import SimpleTest from "$lib/models/SimpleTest";
import { fromIndexDBtoInstance as fromDB2KInstance } from "$lib/models/Knowledge";
import Knowledge from "$lib/models/Knowledge";
import { getCurrentSettings } from "$lib/settings.svelte";
import { db_states } from "$lib/reactive.db.svelte"; // let settings = currentSetting;
let settings = getCurrentSettings();
let k_by_date;

function formatDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function populateKByDate() {
	const date = new Date();
	k_by_date = {};
	for (const k of db_states.knowledges) {
		date.setTime(k.due);
		const dateStr = formatDate(date);
		if (Array.isArray(k_by_date[dateStr])) k_by_date[dateStr].push(k);
		else k_by_date[dateStr] = [k];
	}
}

function getReviewCountOfDate(date) {
	return k_by_date[formatDate(date)];
}

// Fisher–Yates shuffle
function shuffle(array) {
	let ret = [...array];
	for (let i = ret.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[ret[i], ret[j]] = [ret[j], ret[i]]; //js cool-looking way to swap
	}
	return ret;
}

export class Reviewer {
	#queue = $state([]);
	#remainingReview = $derived(this.#queue.length);
	sortedQueue = $derived.by(() => {
		let sorter;
		let ret = this.#queue.map((tests, index) => ({ tests, index, knowledge: tests[0].knowledge }));
		switch (settings.reviewOrder) {
			case "addedDateDesc":
				sorter = ({ tests: a }, { tests: b }) => b[0].knowledge.firstReviewDate - a[0].knowledge.firstReviewDate;
				ret = ret.toSorted(sorter);
				break;
			case "addedDateAsc":
				sorter = ({ tests: a }, { tests: b }) => a[0].knowledge.firstReviewDate - b[0].knowledge.firstReviewDate;
				ret = ret.toSorted(sorter);
				break;
			case "retrievability":
				sorter = ({ tests: a }, { tests: b }) => a[0].knowledge.retrievability - b[0].knowledge.retrievability;
				ret = ret.toSorted(sorter);
				break;
			case "random":
			default:
				ret = shuffle(ret);
				break;
		}
		return ret;
	});

	#cur = $derived(this.sortedQueue.at(0));

	#current = $derived.by(() => {
		const testsOfOneK = this.#cur?.tests;
		return testsOfOneK && testsOfOneK[0];
	});

	constructor(tests) {
		this.#queue = tests;
	}

	get remainingReview() {
		return this.#remainingReview;
	}

	get queue() {
		return this.#queue;
	}

	get current() {
		return this.#current;
	}

	set queue(v) {
		this.#queue = v;
	}

	set current(v) {
		this.#current = v;
	}

	static async createNewReviewer() {
		const tests = await SimpleTest.getAllDue();
		populateKByDate();
		return new Reviewer(tests);
	}

	nextReview() {
		this.queue.splice(this.#cur.index, 1);
	}

	deleteCurrent = () => {
		this.current?.delete();
		this.nextReview();
	};

	gradeGood() {
		// console.log("Pre grade: ", $state.snapshot(this.current.knowledge));
		this.current.knowledge.updateOnGrade("good", getReviewCountOfDate);
		// console.log("Post grade: ", $state.snapshot(this.current.knowledge));
		this.nextReview();
	}

	gradeForget() {
		// console.log("Pre grade: ", $state.snapshot(this.current.knowledge));
		this.current.knowledge.updateOnGrade("again", getReviewCountOfDate);
		// console.log("Post grade: ", $state.snapshot(this.current.knowledge));
		this.nextReview();
	}
}
