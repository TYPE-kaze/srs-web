<script>
	import ankiConnect from "./ankiconnect.js";
	import SimpleTest from "$lib/models/SimpleTest";
	import Knowledge from "$lib/models/Knowledge";
	import fsrs from "$lib/fsrs.svelte.js";
	import db from "$lib/db.js";
	import { onMount } from "svelte";
	const mimeTypes = {
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		webp: "image/webp",
		svg: "image/svg+xml",
		pdf: "application/pdf",
		json: "application/json",
		txt: "text/plain",
		html: "text/html",
		css: "text/css",
		js: "application/javascript",
	};

	let status = $state("seeding from Anki");

	async function main() {
		const num = 2000;
		const tests = [];
		const cardIDs = await ankiConnect("findCards", { query: 'deck:Deck::Learned -"note:Default Image Occlusion"' });

		const usedIndexs = new Set();
		const filterdCardIDs = [];

		for (let i = 0; i < num; i++) {
			let randomIndex = null;
			do {
				randomIndex = (Math.random() * cardIDs.length) | 0;
			} while (usedIndexs.has(randomIndex));
			usedIndexs.add(randomIndex);

			filterdCardIDs.push(cardIDs[randomIndex]);
		}

		// add to indexDB
		const cards = await ankiConnect("cardsInfo", { cards: filterdCardIDs });
		const reviews = await ankiConnect("getReviewsOfCards", { cards: filterdCardIDs });

		for (const c of cards) {
			let q = c.fields.Front.value;
			let a = c.fields.Back.value;

			const jobs = [];
			const imgRegex = /<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi;

			async function loadFileToBlob(filename) {
				const b64 = await ankiConnect("retrieveMediaFile", { filename });
				const [_, ext] = /^.*\.(.*)/.exec(filename);
				const type = mimeTypes[ext];
				const arr = Uint8Array.fromBase64(b64);
				const b = new Blob([arr.buffer], { type });
				return b;
			}

			function h(m, filename) {
				jobs.push(loadFileToBlob(filename));
				return `[image:${jobs.length - 1}]`;
			}

			q = q.replace(imgRegex, h);
			a = a.replace(imgRegex, h);

			// reviews and then s and d
			const r_logs = reviews[c.cardId];
			const ratings = [];
			const delta_ts = [];
			ratings.push(r_logs[0].ease);
			delta_ts.push(0);

			for (let i = 1; i < r_logs.length; i++) {
				const day = ((r_logs[i].id - r_logs[i - 1].id) / 86400000) | 0;
				delta_ts.push(day);
				ratings.push(r_logs[i].ease);
			}

			const prevReviewDate = new Date(r_logs[r_logs.length - 1].id);
			const firstReviewDate = new Date(r_logs[0].id);
			let [s, d] = fsrs.memoryState(new Uint32Array(ratings), new Uint32Array(delta_ts));
			const imageBlobs = await Promise.all(jobs);
			let due = new Date();
			const k = new Knowledge(null, s, d, null, due, prevReviewDate, firstReviewDate);

			s = null;
			d = null;
			let interval = null;
			let date = new Date(firstReviewDate.getTime());
			let rate = null;
			let newMemState = null;
			for (let i = 0; i < r_logs.length; i++) {
				switch (ratings[i]) {
					case 1:
						rate = "again";
						break;
					case 2:
						rate = "hard";
						break;
					case 3:
						rate = "good";
						break;
					case 4:
						rate = "easy";
						break;
				}

				date = new Date(r_logs[i].id);
				k.trackReview(date, rate, s, d, interval);
				newMemState = fsrs.nextStates(s, d, 0.9, delta_ts[i])[rate];
				s = newMemState.memory.stability;
				d = newMemState.memory.difficulty;
				interval = Math.max(newMemState.interval | 0, 1);
			}
			k.interval = interval;
			k.due = new Date(k.lastReviewDate.getTime() + k.interval * 24 * 60 * 60 * 1000);
			/* k.due = new Date(); */

			const t = new SimpleTest(null, q, a, k, null, imageBlobs, new Date(firstReviewDate.getTime()));
			tests.push(t);
		}

		console.log("deleteing DB...");
		await db.delete();
		console.log("reopening DB...");
		await db.open();
		console.log("Saving new tests to DB...");
		await Promise.all(
			tests.map((t) => {
				return (async function () {
					await t.knowledge.save();
					await t.save();
				})();
			}),
		);
		console.log("Done");
		console.log(tests);
		status = "Done";
	}
	onMount(main);
</script>

<h1>Seed page</h1>
<p>State : {status}</p>
