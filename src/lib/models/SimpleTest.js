import db from "$lib/db.js";
import Knowledge from "$lib/models/Knowledge.js";
// if Knowledge instance has not been created
async function fromIndexDBtoInstance(t, k) {
	if (!(k instanceof Knowledge)) {
		k = await Knowledge.getOne(t.knowledgeID);
	}
	return fromIndexDBToInstanceSync(t, k);
}

// if Knowledge instance has been created
export function fromIndexDBToInstanceSync(t, k) {
	const addedDate = Number.isFinite(t.addedDate) ? new Date(t.addedDate) : null;
	return new SimpleTest(t.id, t.question, t.answer, k, t.audios, t.images, addedDate);
}

export default class SimpleTest {
	constructor(id, question, answer, knowledge, audios, images, addedDate) {
		this.id = id;
		this.knowledge = knowledge;
		this.question = question;
		this.answer = answer;
		this.audios = audios ?? {};
		this.images = images ?? [];
		this.addedDate = addedDate;
	}

	hydrateQuestion() {
		this.h_q = this.hydrate(this.question);
	}

	hydrateAnswer() {
		this.h_a = this.hydrate(this.answer);
	}

	async getHydratedQuestion() {
		if (!this.h_q) {
			this.hydrateQuestion();
		}
		return await this.h_q;
	}

	async getHydratedAnswer() {
		if (!this.h_a) {
			this.hydrateAnswer();
		}
		return await this.h_a;
	}

	async delete() {
		await db.simple_tests.delete(this.id);
		const tests = await db.simple_tests.get({
			knowledgeID: this.knowledge.id,
		});

		if (!tests || (Array.isArray(tests) && tests.length === 0)) {
			await db.knowledge.delete(this.knowledge.id);
		}
	}

	async save() {
		const addedDate = this.addedDate ? this.addedDate.getTime() : Date.now();
		this.hydrateAnswer();
		this.hydrateQuestion();
		if (this.id) {
			// update
			await db.simple_tests.put({
				id: this.id,
				question: this.question,
				answer: this.answer,
				knowledgeID: this.knowledge?.id,
				audios: this.audios,
				images: this.images,
				addedDate,
			});
		} else {
			// add
			this.id = await db.simple_tests.add({
				question: this.question,
				answer: this.answer,
				knowledgeID: this.knowledge?.id,
				audios: this.audios,
				images: this.images,
				addedDate,
			});
		}
		return this;
	}

	// hydrate with image in b64 and sound in a custom scheme
	async hydrate(text) {
		const imageRegex = /\[image:([0-9]+)\]/dg;
		let res;
		const parts = [];
		const ids = [];
		let cur_i = 0;
		while ((res = imageRegex.exec(text)) !== null) {
			const r = res["indices"][0];
			ids.push(parseInt(res[1]));
			parts.push(text.slice(cur_i, r[0]));
			cur_i = r[1];
		}
		// if no match there is no image, return text as is
		// // answer has different index!!!

		if (cur_i === 0) return text;
		parts.push(text.slice(cur_i));
		res = parts[0];
		for (let i = 1; i < parts.length; i++) {
			const b = this.images[ids[i - 1]];
			const b64 = await b.bytes().then((b) => b.toBase64());
			const dataURL = `data:${b.type};base64,${b64}`;
			const img = `<img src="${dataURL}" />`;
			res = res + img + parts[i];
		}
		return res;
	}

	getHydrateQuestionForViewing() {
		return this.hydrateForViewing(this.question);
	}

	getHydrateAnswerForViewing() {
		return this.hydrateForViewing(this.answer);
	}
	//hydrate fror viewing
	hydrateForViewing(text) {
		const regex = /\[(?:(audio)|(image)):([^\]]+)\]/g;
		const handler = (m, au, img, id) => {
			if (au) {
				const audioBlob = this.audios[id];
				if (audioBlob) {
					return `<button class="btn play-audio" for="${id}"><i class="bi bi-play-circle-fill"></i></button><audio src="${URL.createObjectURL(audioBlob)}" name="${id}">Audio</audio> `;
				}
			}
			if (img) {
				const imageBlob = this.images[id];
				if (imageBlob) {
					return `<img src="${URL.createObjectURL(imageBlob)}" />`;
				}
			}
			return m;
		};
		const res = text.replace(regex, handler);

		return res;
	}

	static async getAllDue() {
		const k_list = await Knowledge.getAllDue();
		let jobs = k_list.map(async (k) => {
			// below return a list of test with the same knowledgeID
			const tests = await db.simple_tests.where("knowledgeID").equals(k.id).toArray();
			const ret = [];
			for (const t of tests) {
				ret.push(await fromIndexDBtoInstance(t, k));
			}
			return ret;
		});
		const list = await Promise.all(jobs);
		return list.filter((item) => item.length !== 0);
	}

	static async getOne(id) {
		const t = await db.simple_tests.get(parseInt(id));
		return await fromIndexDBtoInstance(t);
	}

	static async getAll() {
		const tests = await db.simple_tests.toArray();
		const jobs = [];
		for (const t of tests) {
			jobs.push(fromIndexDBtoInstance(t));
		}
		return await Promise.all(jobs);
	}
}
