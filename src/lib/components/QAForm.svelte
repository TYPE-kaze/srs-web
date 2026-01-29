<script>
	import Knowledge from "$lib/models/Knowledge.js";
	import SimpleTest from "$lib/models/SimpleTest.js";
	import { setContext, onMount } from "svelte";
	import { browser } from "$app/environment";
	import { toast } from "svelte-sonner";
	import EditableField from "$lib/components/EditableField.svelte";
	import QAFormEditButtonGroup from "$lib/components/QAFormEditButtonGroup.svelte";
	const { test, runOnAdd, runOnEdit } = $props();
	const isEditMode = $derived(!!test);
	let filesNode;
	let audioBlobs = {};
	let audioBlobURLs = {};

	let promiseForAudioFirstLoadResove;
	const formStates = $state({
		bold: false,
		italic: false,
		underline: false,
		code: false,
		codeBlock: false,
		currentQuill: null,
		currentFieldID: null,
		reviewNow: false,
		audioNodes: {},
		promiseForAudioFirstLoad: new Promise((resolve, _) => {
			promiseForAudioFirstLoadResove = resolve;
		}),
	});

	const answer = { id: "answer" };
	const question = { id: "question" };
	let answerNode = $state();
	let questionNode = $state();

	let isKeepingQuestion = $state(false);
	let isKeepingAnswer = $state(false);

	export function setQuestionText(text) {
		questionNode?.setText(text);
	}

	export function appendQuestionText(text) {
		questionNode?.appendText(text);
	}

	export function setAnswerText(text) {
		answerNode?.setText(text);
	}

	export function appendAnswerText(text) {
		answerNode?.appendText(text);
	}

	export function setQuestionImage(url) {
		questionNode?.setImage(url);
	}

	export function appendQuestionImage(url) {
		questionNode?.appendImage(url);
	}

	setContext("simpleqa-form-context", formStates);

	// set up initial values if edit
	let init_q = $derived(test?.getHydratedQuestion());
	let init_a = $derived(test?.getHydratedAnswer());
	if (test && browser) {
		audioBlobs = test.audios;
	}

	function parseAudioOnTestChange() {
		for (const filename in audioBlobs) {
			const file = audioBlobs[filename];
			const dataURL = (audioBlobURLs[filename] = URL.createObjectURL(file));
			const audio = document.createElement("audio");
			audio.controls = true;
			audio.src = dataURL;
			audio.setAttribute("name", filename);
			filesNode.appendChild(audio);
			formStates.audioNodes[filename] = audio;
		}
	}

	let isFirstTime = true;
	$effect(() => {
		if (isFirstTime) return;
		if (test && test.audios) {
			audioBlobs = test.audios;
		}
		parseAudioOnTestChange();
	});

	async function setupFiles(el) {
		filesNode = el;
		parseAudioOnTestChange();
		promiseForAudioFirstLoadResove();
		isFirstTime = false;

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				mutation.addedNodes.forEach((a) => {
					if (a instanceof HTMLAudioElement) {
						const name = a.getAttribute("name");
						if (formStates.audioNodes[name]) {
							formStates.audioNodes[name].remove();
						}
						formStates.audioNodes[name] = a;
					}
				});
			});
		});

		observer.observe(el, { childList: true });
	}

	function isQuillSelecting() {
		const range = formStates.currentQuill?.getSelection();
		let isSelection = false;
		if (range && range.length !== 0) {
			isSelection = true;
		}
		return isSelection;
	}

	function boldSelection() {
		formStates.currentQuill?.format("bold", !formStates.bold);
		if (!isQuillSelecting()) {
			formStates.bold = !formStates.bold;
		}
	}

	function italicSelection() {
		formStates.currentQuill?.format("italic", !formStates.italic);
		if (!isQuillSelecting()) {
			formStates.italic = !formStates.italic;
		}
	}

	function underlineSelection() {
		formStates.currentQuill?.format("underline", !formStates.underline);
		if (!isQuillSelecting()) {
			formStates.underline = !formStates.underline;
		}
	}

	function codeButtonHandler() {
		formStates.currentQuill?.format("code", !formStates.code);
		if (!isQuillSelecting()) {
			formStates.code = !formStates.code;
		}
	}

	function undoButtonHandler() {
		formStates.currentQuill?.history.undo();
	}

	function redoButtonHandler() {
		formStates.currentQuill?.history.redo();
	}

	function onkeydowncapture(e) {
		if (e.keyCode === 9) {
			if (formStates.currentFieldID === answer.id) {
				questionNode.focus();
			} else {
				answerNode.focus();
			}
		}
	}

	async function onpaste(e) {
		const items = e.clipboardData.items;
		for (const item of items) {
			if (item.type.startsWith("audio/")) {
				const file = item.getAsFile();
				const filename = file.name;
				/* const b64 = await file.bytes().then((b) => b.toBase64()); */
				/* const dataURL = `data:${item.type};base64,${b64}`; */
				let dataURL;
				if (audioBlobs[filename]) {
					dataURL = audioBlobURLs[filename];
				} else {
					audioBlobs[filename] = file;
					dataURL = audioBlobURLs[filename] = URL.createObjectURL(file);
				}
				// Create audio element
				const range = formStates.currentQuill.getSelection();
				const audioName = `[audio:${filename}]`;
				if (range) {
					if (range.length == 0) {
						formStates.currentQuill.insertText(range.index, audioName, "user");
						formStates.currentQuill.setSelection(range.index + audioName.length);
					} else {
						formStates.currentQuill.deleteText(range.index, range.length);
						formStates.currentQuill.insertText(range.index, audioName, "user");
						formStates.currentQuill.setSelection(range.index + audioName.length);
					}
				} else {
					console.log("User cursor is not in editor");
				}
				const audio = document.createElement("audio");
				audio.controls = true;
				audio.src = dataURL;
				audio.setAttribute("name", filename);
				filesNode?.appendChild(audio);
			}
		}
	}

	function clear() {
		if (!isKeepingQuestion) {
			questionNode.clearContents();
		}

		if (!isKeepingAnswer) {
			answerNode.clearContents();
		}

		if (!isKeepingAnswer && !isKeepingQuestion) {
			audioBlobs = {};
			for (const k in audioBlobURLs) {
				URL.revokeObjectURL(audioBlobURLs[k]);
			}
			audioBlobURLs = {};
			for (const k in formStates.audioNodes) {
				formStates.audioNodes[k].remove();
			}
			formStates.audioNodes = {};
		}
	}

	async function onButtonClick() {
		if (questionNode.getLength() === 0) {
			toast.error("Câu hỏi không được để trống");
			return;
		}
		let q = questionNode.getContent();
		let a = answerNode.getContent();
		const imageBlobs = [];
		const imgRegex = /<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi;
		const h = (m, p1) => {
			const [_, type, b64] = /^data:(image\/(?:png|jpg|jpeg|webp|avif));base64,(.*)/.exec(p1);
			if (type && b64) {
				const arr = Uint8Array.fromBase64(b64);
				const b = new Blob([arr.buffer], { type });
				imageBlobs.push(b);
				return `[image:${imageBlobs.length - 1}]`;
			}
			// Effectively ignore other src formats
			return "";
		};

		q = q.replace(imgRegex, h);
		a = a.replace(imgRegex, h);

		let usedAudio = [...questionNode?.parseAndReturnAudioText(), ...answerNode?.parseAndReturnAudioText()];
		let audioBlobToSave = {};
		for (const aname of usedAudio) {
			if (audioBlobs[aname]) {
				audioBlobToSave[aname] = audioBlobs[aname];
			}
		}

		let t;
		if (test) {
			// editing test is assuming k there already a k
			// edting a new test should display abother button that making it learned?
			t = test;
			t.images = imageBlobs;
			t.audios = audioBlobToSave;
			t.question = q;
			t.answer = a;
		} else {
			// Adding new test is assuming learned
			const k = new Knowledge();
			if (formStates.reviewNow) {
				k.due = new Date();
			}
			await k.save();
			t = new SimpleTest(null, q, a, k, audioBlobToSave, imageBlobs, new Date());
		}

		if (test) {
			runOnEdit && runOnEdit();
		} else {
			runOnAdd && runOnAdd();
		}

		await t.save();
		if (!test) {
			clear();
		}

		const msg = test ? "Cập nhật thành công" : "Thêm thành công";
		toast.success(msg);
	}

	function reviewNowHandler() {
		formStates.reviewNow = !formStates.reviewNow;
	}

	function clozeButtonHandler() {
		const quill = formStates.currentQuill;
		if (!quill || formStates.currentFieldID !== "question") return;
		const replacement = "[...]";
		const range = quill.getSelection();

		if (range && range.length > 0) {
			const selectedText = quill.getText(range.index, range.length);
			quill.deleteText(range.index, range.length);
			/* quill.insertText(range.index, replacement); */
			quill.insertText(
				range.index,
				replacement,
				{
					code: true,
				},
				"user",
			);
			quill.setSelection(range.index + replacement.length);
			setAnswerText(selectedText);
		}
	}
</script>

<div {onkeydowncapture} {onpaste} class="container mt-3">
	<form action="">
		<div class="toolbar mb-2" role="toolbar" aria-label="Toolbar with button groups">
			<QAFormEditButtonGroup
				{boldSelection}
				{formStates}
				{italicSelection}
				{underlineSelection}
				{questionNode}
				{answerNode}
				{reviewNowHandler}
				{codeButtonHandler}
				{undoButtonHandler}
				{redoButtonHandler}
				{clozeButtonHandler}
			/>
		</div>

		{#await test && browser && init_q ? init_q : undefined then q}
			<EditableField
				isShowPin={!isEditMode}
				toogleKeeping={() => (isKeepingQuestion = !isKeepingQuestion)}
				isKeep={isKeepingQuestion}
				content={q}
				id={question.id}
				bind:this={questionNode}
				customClasses={["mb-3"]}
				label="Câu hỏi"
			/>
		{/await}

		{#await test && browser && init_a ? init_a : undefined then a}
			<EditableField
				isShowPin={!isEditMode}
				toogleKeeping={() => (isKeepingAnswer = !isKeepingAnswer)}
				isKeep={isKeepingAnswer}
				content={a}
				id={answer.id}
				bind:this={answerNode}
				customClasses={["mb-3"]}
				label="Đáp án"
			/>
		{/await}
		<button onclick={onButtonClick} type="button" class={["btn", test ? "btn-success" : "btn-primary"]}>
			{test ? "Cập nhật" : "Thêm"}
		</button>
	</form>
	<div class="audio-files" {@attach setupFiles}></div>
</div>

<style>
	.audio-files {
		display: none;
	}

	div.toolbar {
		font-size: 0.75em;
		padding: 0;
		padding-bottom: 10px;
		border-bottom: 2px solid grey;
	}
</style>
