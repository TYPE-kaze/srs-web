import db from "$lib/db.js";
import fsrs, { getRetrievability, grade as gradeAndGetNewMemState } from "$lib/fsrs.svelte.js";
import { getCurrentEasyDays, getMaxInterval } from "$lib/settings.svelte";
export function fromIndexDBtoInstance(k) {
	const due = Number.isFinite(k.due) ? new Date(k.due) : null;
	const lastReviewDate = Number.isFinite(k.lastReviewDate) ? new Date(k.lastReviewDate) : null;
	const firstReviewDate = Number.isFinite(k.firstReviewDate) ? new Date(k.firstReviewDate) : null;
	return new Knowledge(k.id, k.stability, k.difficulty, k.interval, due, lastReviewDate, firstReviewDate, k.reviewHistory);
}

function getFuzzRange(interval, elapsedDays = 0) {
	// No fuzz for very short intervals
	if (interval < 2.5) {
		const rounded = Math.max(1, Math.round(interval));
		return { minIvl: rounded, maxIvl: rounded };
	}

	// FSRS-style fuzz range: approximately ±5% with minimum bounds
	let minIvl, maxIvl;

	if (interval < 7) {
		// Short intervals: tighter range
		minIvl = Math.max(2, Math.round(interval) - 1);
		maxIvl = Math.round(interval) + 1;
	} else if (interval < 30) {
		// Medium intervals
		minIvl = Math.max(2, Math.round(interval * 0.95 - 1));
		maxIvl = Math.round(interval * 1.05 + 1);
	} else if (interval < 90) {
		// Longer intervals
		minIvl = Math.max(2, Math.round(interval * 0.92 - 1));
		maxIvl = Math.round(interval * 1.08 + 1);
	} else {
		// Very long intervals: wider range
		minIvl = Math.max(2, Math.round(interval * 0.9 - 1));
		maxIvl = Math.round(interval * 1.1 + 1);
	}

	// Ensure minimum is at least elapsed + 1
	if (elapsedDays > 0) {
		minIvl = Math.max(minIvl, elapsedDays + 1);
	}

	// Ensure maximum doesn't exceed limit
	const maximumInterval = getMaxInterval() ?? 36500;
	maxIvl = Math.min(maxIvl, maximumInterval);

	// Ensure min <= max
	minIvl = Math.min(minIvl, maxIvl);

	return { minIvl, maxIvl };
}

function getNormalizationParams(candidates) {
	let minLoad = Infinity,
		maxLoad = 0;
	let minWeight = Infinity,
		maxWeight = 0;
	let maxDev = 0;

	for (const c of candidates) {
		minLoad = Math.min(minLoad, c.reviewCount);
		maxLoad = Math.max(maxLoad, c.reviewCount);
		minWeight = Math.min(minWeight, c.dayWeight);
		maxWeight = Math.max(maxWeight, c.dayWeight);
		maxDev = Math.max(maxDev, c.deviation);
	}

	return { minLoad, maxLoad, minWeight, maxWeight, maxDev };
}

function selectPreferredEasyDay(candidates) {
	// Normalize values for fair comparison
	const { minLoad, maxLoad, minWeight, maxWeight, maxDev } = getNormalizationParams(candidates);

	const loadRange = maxLoad - minLoad || 1;
	const weightRange = maxWeight - minWeight || 1;
	const devRange = maxDev || 1;

	// Scoring weights
	const loadFactor = 0.4;
	const dayFactor = 0.4;
	const devFactor = 0.2;

	let best = candidates[0];
	let bestScore = Infinity;

	for (const candidate of candidates) {
		const normLoad = (candidate.reviewCount - minLoad) / loadRange;
		const normWeight = (candidate.dayWeight - minWeight) / weightRange;
		const normDev = candidate.deviation / devRange;

		const score = loadFactor * normLoad + dayFactor * normWeight + devFactor * normDev;

		candidate.score = score;

		if (score < bestScore) {
			bestScore = score;
			best = candidate;
		}
	}

	return best;
}

function getDayWeight(date) {
	const dayWeights = getCurrentEasyDays();
	return dayWeights[date.getDay()] || 1;
}

function applyLoadBalance(calculatedInterval, getReviewCountOfDate, options = {}) {
	const { today = new Date(), elapsedDays = 0 } = options;

	let { minIvl, maxIvl } = getFuzzRange(calculatedInterval, elapsedDays);
	// If no range, return as-is
	if (minIvl === maxIvl) {
		return minIvl;
	}

	const target = Math.round(calculatedInterval);
	// Collect candidate days with scores
	const candidates = [];
	const date = today;

	for (let ivl = minIvl; ivl <= maxIvl; ivl++) {
		// const date = addDays(today, ivl);
		date.setDate(date.getDate() + ivl);
		const reviewCount = getReviewCountOfDate(date);
		const dayWeight = getDayWeight(date);
		const deviation = Math.abs(ivl - target);

		candidates.push({
			interval: ivl,
			reviewCount,
			dayWeight,
			deviation,
		});
	}

	let bestCandidate;
	bestCandidate = selectPreferredEasyDay(candidates);
	return bestCandidate.interval;
}

export default class Knowledge {
	// A plain `new Knowledge()` assume first review to be good
	constructor(id, stability, difficulty, interval, due, lastReviewDate, firstReviewDate, reviewHistory) {
		this.id = id;
		this.stability = stability;
		this.difficulty = difficulty;
		this.interval = interval;
		this.due = due;
		this.lastReviewDate = lastReviewDate;
		this.firstReviewDate = firstReviewDate;
		this.reviewHistory = reviewHistory;

		if (!reviewHistory) {
			this.reviewHistory = [];
		}

		if (!stability || !difficulty) {
			// new
			// If a test with state 'new' is added then this need to change
			// const s = fsrs.nextStates(null, null, 0.9, 0).good;
			const s = gradeAndGetNewMemState(null, null, 0, "good");
			this.trackReviewNow("good");
			this.stability = s.memory.stability;
			this.difficulty = s.memory.difficulty;
			this.interval = s.interval;
			this.lastReviewDate = new Date();
			this.firstReviewDate = new Date();
			const due = new Date();
			due.setDate(due.getDate() + Math.max(Math.round(this.interval), 1));
			this.due = due;
		}
	}

	get retrievability() {
		return this.getRetrievabilityNow();
	}

	getRetrievabilityNow() {
		return getRetrievability(this.stability, this.lastReviewDate.getTime(), Date.now());
	}

	updateOnGrade(grade, func) {
		let delta = 0;
		let date = new Date();
		if (this.lastReviewDate) {
			delta = (date - this.lastReviewDate) / (1000 * 60 * 60 * 24);
		}
		// const s = fsrs.nextStates(this.stability, this.difficulty, d_r, delta)[grade];
		const s = gradeAndGetNewMemState(this.stability, this.difficulty, delta, grade);

		this.trackReviewNow(grade);
		if (s) {
			const b_inv = applyLoadBalance(s.interval, func, { elapsedDays: delta, today: new Date() });
			this.stability = s.memory.stability;
			this.difficulty = s.memory.difficulty;
			this.interval = b_inv || Math.max(s.interval | 0, 1);
			this.lastReviewDate = date;
			const due = new Date();
			due.setDate(date.getDate() + this.interval);
			this.due = due;
		} else {
			throw new Error("grade is not a valid grade");
		}
		this.save();
		return this;
	}

	trackReviewNow(grade) {
		const date = new Date();
		this.trackReview(date, grade, this.stability, this.difficulty, this.interval);
	}

	trackReview(date, grade, prevStability, prevDifficulty, interval) {
		this.reviewHistory.push({
			date,
			grade,
			prevStability,
			prevDifficulty,
			interval,
		});
	}

	async save() {
		if (this.id) {
			// update
			await db.knowledge.put({
				id: this.id,
				stability: this.stability,
				difficulty: this.difficulty,
				interval: this.interval,
				due: this.due.getTime(),
				lastReviewDate: this.lastReviewDate.getTime(),
				firstReviewDate: this.firstReviewDate.getTime(),
				reviewHistory: this.reviewHistory,
			});
		} else {
			// add
			this.id = await db.knowledge.add({
				stability: this.stability,
				difficulty: this.difficulty,
				interval: this.interval,
				due: this.due.getTime(),
				lastReviewDate: this.lastReviewDate.getTime(),
				firstReviewDate: this.firstReviewDate.getTime(),
				reviewHistory: this.reviewHistory,
			});
		}
		return this;
	}

	static async getAllDue() {
		const todayStart = new Date();
		todayStart.setHours(23, 52, 57);
		const lists = await db.knowledge.where("due").below(todayStart.getTime()).toArray();
		return lists.map((k) => fromIndexDBtoInstance(k));
	}

	static async getAll() {
		const arr = await db.knowledge.toArray();
		return arr.map((k) => fromIndexDBtoInstance(k));
	}

	static async getOne(id) {
		const k = await db.knowledge.get(parseInt(id));
		return fromIndexDBtoInstance(k);
	}
}
