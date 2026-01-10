import db from "$lib/db.js";
import fsrs, { getRetrievability, grade as gradeAndGetNewMemState } from "$lib/fsrs.svelte.js";
export function fromIndexDBtoInstance(k) {
	const due = Number.isFinite(k.due) ? new Date(k.due) : null;
	const lastReviewDate = Number.isFinite(k.lastReviewDate) ? new Date(k.lastReviewDate) : null;
	const firstReviewDate = Number.isFinite(k.firstReviewDate) ? new Date(k.firstReviewDate) : null;
	return new Knowledge(k.id, k.stability, k.difficulty, k.interval, due, lastReviewDate, firstReviewDate, k.reviewHistory);
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

	async updateOnGrade(grade) {
		let delta = 0;
		let date = new Date();
		if (this.lastReviewDate) {
			delta = ((date - this.lastReviewDate) / (1000 * 60 * 60 * 24)) | 0;
		}
		// const s = fsrs.nextStates(this.stability, this.difficulty, d_r, delta)[grade];
		const s = gradeAndGetNewMemState(this.stability, this.difficulty, delta, grade);

		this.trackReviewNow(grade);
		if (s) {
			this.stability = s.memory.stability;
			this.difficulty = s.memory.difficulty;
			this.interval = Math.max(s.interval | 0, 1);
			this.lastReviewDate = date;
			const due = new Date();
			due.setDate(date.getDate() + this.interval);
			this.due = due;
		} else {
			throw new Error("grade is not a valid grade");
		}
		await this.save();
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
