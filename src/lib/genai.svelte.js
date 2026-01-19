import { getGemeniKey } from "$lib/settings.svelte";
import { GoogleGenAI, createPartFromUri } from "@google/genai";
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

I will be transparent and tell you that I need to parse your response programmatically into my application so you need to follow the specified format faithfully without deviation. The format is as follow: the first line is the question; the second line is the corresponding answer; each of such pairs are seperate by double blank lines; as I use newline '\\n' to fomart as stated, this character must not be included in making questions nor answers`;
	const contents = [promt];

	if (file.uri && file.mimeType) {
		const fileContent = createPartFromUri(file.uri, file.mimeType);
		contents.push(fileContent);
	}

	// Initialize directly with the user's key
	const response = await ai.models.generateContent({
		model: "gemini-3-flash-preview",
		contents,
	});
	return response.text;
}
