import SimpleTest from "$lib/models/SimpleTest";
import Knowledge from "$lib/models/Knowledge";
import { getCurrentSettings } from "$lib/settings.svelte";
let settings = getCurrentSettings();
// let settings = currentSetting;

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
		const testsOfOneK = this.#cur.tests;
		return testsOfOneK[0];
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
		return new Reviewer(tests);
	}

	nextReview() {
		this.queue.splice(this.#cur.index, 1);
	}

	deleteCurrent = () => {
		this.current?.delete();
		this.nextReview();
	};

	async gradeGood() {
		// console.log("Pre grade: ", $state.snapshot(this.current.knowledge));
		await this.current.knowledge.updateOnGrade("good");
		// console.log("Post grade: ", $state.snapshot(this.current.knowledge));
		this.nextReview();
	}

	async gradeForget() {
		// console.log("Pre grade: ", $state.snapshot(this.current.knowledge));
		await this.current.knowledge.updateOnGrade("again");
		// console.log("Post grade: ", $state.snapshot(this.current.knowledge));
		this.nextReview();
	}
}
