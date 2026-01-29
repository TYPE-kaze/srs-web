import { getGemeniKey } from "$lib/settings.svelte";
import { GoogleGenAI, createPartFromUri } from "@google/genai";
const model = "gemini-2.5-flash"; // 'gemini-3-flash-preview'
export async function generateQAPairs(fileBlob, numberOfQuestions, language) {
	if (!fileBlob) throw new Error("Bạn chưa nhập tài liệu");
	const API_KEY = getGemeniKey();
	if (!API_KEY) throw new Error("Bạn chưa điền API_KEY. Hãy kiểm tra trang cài đặt");

	const ai = new GoogleGenAI({ apiKey: API_KEY });
	const file = await ai.files.upload({
		file: fileBlob,
		config: {
			displayName: fileBlob.name,
		},
	});
	let getFile = await ai.files.get({ name: file.name });
	while (getFile.state === "PROCESSING") {
		getFile = await ai.files.get({ name: file.name });
		console.log(`current file status: ${getFile.state}`);
		console.log("File is still processing, retrying in 3 seconds");

		await new Promise((resolve) => {
			setTimeout(resolve, 3000);
		});
	}
	if (file.state === "FAILED") {
		throw new Error("Mô hình ngôn ngữ không xử lí được tệp tin tải lên");
	}
	const promt = `
Generate ${numberOfQuestions} question-answer pairs from the attatched document.

The manner and fashion in making each question-answer pair I desired is, first to have the question being longer than the answer, to make it "atomic", so if the reviewer give the wrong answer, they are clear on which part is the mistake. Secondly, having said that, there must be a fine balance in making the question so that it did not take too long to read and parse but also is not to terse, dry and boring. Thirdly, in making "atomic" questions, it should be obvious that you need not to make questions that try to fully capture the whole contents, instead I want you to prioritize making questions on parts that are pivotal, the hinge, the crux that the whole given material rely on.
Also, the language I want you to response in is ${language}.

I will be transparent and tell you that I need to parse your response programmatically into my application so you need to follow the specified format faithfully without deviation. The format is as follow: the first line is the question; the second line is the corresponding answer; each of such pairs are seperate by double blank lines; as I use newline '\\n' to fomart as stated, this character must not be included in making questions nor answers
`;
	const contents = [promt];

	if (file.uri && file.mimeType) {
		const fileContent = createPartFromUri(file.uri, file.mimeType);
		contents.push(fileContent);
	}

	// Initialize directly with the user's key
	const response = await ai.models.generateContent({
		model: model,
		contents,
	});
	return response.text;
}

class LearnPartnerAI {
	constructor(ai, fileRef) {
		this.ai = ai;
		this.fileRef = fileRef;
	}

	getQA = async (pageNum, text) => {
		const promt = `
Generate for me extacly 1 question-answer pair. The attached pdf is the context in which I am learning from. I am going to give you two input, first is the page number I am at and the second is the content that I want you to generate the question-answer pair from. But before giving you the two inputs, I will layout some rules that you must follow, the next blank line indicates the start of the rules and the blank line after that means the end of the rules. After the second blank line that end the rules is the paragrpah that specify the 2 inputs.

The length of the question is around 20-25 words. The manner and fashion in making the question-answer pair I desired is to have the question being longer than the answer, to make it "atomic", so if the reviewer give the wrong answer, they are clear on which part is the mistake. Having said that, there must be a fine balance in making the question so that it will not take too long for the learner to read and interpret but also is not to terse, dry or boring. In making "atomic" questions, it should be obvious that you need not to make the one question that try to fully capture the text, instead I want you to prioritize parts that are pivotal, that are the hinge, the crux that the whole given material rely on.
Also, the language I want you to response in is English. I will be transparent and tell you that I need to parse your response programmatically into my application so you need to follow the specified format faithfully without deviation. The format is as follow: the first line is the question; the second line is the corresponding answer. As I use newline '\\n' to fomart as stated, this character must not be included in making questions nor answers.

Next is the two inputs. I am at page ${pageNum} of the attached document and the content to generate question-answer pair from is the rest of this promt, as follow:
${text}
		`;
		const contents = [promt];
		contents.push(this.fileRef);

		const response = await this.ai.models.generateContent({
			model: model,
			contents,
		});
		return response.text;
	};
}

export async function getLearnPartnerAI(fileBlob) {
	if (!fileBlob) throw new Error("Bạn chưa nhập tài liệu");
	const API_KEY = getGemeniKey();
	if (!API_KEY) throw new Error("Bạn chưa điền API_KEY. Hãy kiểm tra trang cài đặt");

	const ai = new GoogleGenAI({ apiKey: API_KEY });
	const file = await ai.files.upload({
		file: fileBlob,
		config: {
			displayName: fileBlob.name,
		},
	});
	let getFile = await ai.files.get({ name: file.name });
	while (getFile.state === "PROCESSING") {
		getFile = await ai.files.get({ name: file.name });
		console.log(`current file status: ${getFile.state}`);
		console.log("File is still processing, retrying in 3 seconds");

		await new Promise((resolve) => {
			setTimeout(resolve, 2000);
		});
	}
	if (file.state === "FAILED") {
		throw new Error("AI không xử lí được file tài liệu");
	}

	let fileContent;
	if (file.uri && file.mimeType) {
		fileContent = createPartFromUri(file.uri, file.mimeType);
	}

	if (!fileContent) throw new Error("AI không xử lí được file tài liệu");
	return new LearnPartnerAI(ai, fileContent);
}
