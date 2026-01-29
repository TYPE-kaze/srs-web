<script>
	/* import "quill/dist/quill.bubble.css"; */
	import "quill/dist/quill.snow.css";
	import { onMount } from "svelte";
	import { getContext } from "svelte";
	import SmallPlayAudioButton from "$lib/components/SmallPlayAudioButton.svelte";
	const { isShowPin, id, label, customClasses, content, isKeep, toogleKeeping } = $props();

	let isFirstTime = true;
	let quill;
	let usedAudios = $state([]);

	const formStates = getContext("simpleqa-form-context");

	export function parseAndReturnAudioText() {
		const used = [];
		const regex = /\[audio:([^\n\[\]]+)\]/g;
		const text = quill.getText();
		let res;
		while ((res = regex.exec(text)) !== null) {
			if (formStates.audioNodes[res[1]]) {
				used.push(res[1]);
			}
		}
		return used;
	}

	function parseAudioText() {
		usedAudios = parseAndReturnAudioText();
	}

	export function clearContents() {
		quill.setText("");
	}
	export function focus() {
		quill.focus();
	}

	export function getContent() {
		return quill.getSemanticHTML();
	}

	export function getLength() {
		return quill.getLength() - 1;
	}

	export function setText(text) {
		quill?.setText(text);
	}

	export function setImage(url) {
		quill?.setContents([{ insert: { image: url } }]);
	}

	export function appendImage(url) {
		quill?.insertEmbed(getLength(), "image", url);
	}

	export function appendText(text) {
		quill?.insertText(getLength(), text);
	}

	async function setupQuill(element) {
		const { default: Quill } = await import("quill");
		quill = new Quill(element, {
			modules: { toolbar: false },
		});

		quill.root.classList.add("form-control");
		quill.root.setAttribute("id", id);

		let i_id;

		quill.on("text-change", (delta) => {
			clearTimeout(i_id);
			i_id = setTimeout(parseAudioText, 550);
		});

		quill.on("editor-change", () => {
			if (quill === formStates.currentQuill) {
				const s = quill.getFormat();
				if (s.bold !== formStates.bold) formStates.bold = s.bold;
				if (s.italic !== formStates.italic) formStates.italic = s.italic;
				if (s.underline !== formStates.underline) formStates.underline = s.underline;
				if (s.code !== formStates.code) formStates.code = s.code;
			}
		});

		quill.root.addEventListener("dblclick", (e) => {
			const el = e.target;
			if (el instanceof HTMLImageElement) {
				el.classList.toggle("editable-quill-textbox-not-shrink");
			}
		});

		quill.root.addEventListener("focus", (e) => {
			if (formStates.currentQuill !== quill) {
				formStates.currentQuill = quill;
				formStates.currentFieldID = id;
			}
		});

		quill.root.addEventListener("blur", (e) => {
			if (formStates.currentQuill === quill) {
				/* formStates.currentQuill = undefined; */
			}
		});
		quill.root.addEventListener(
			"keydown",
			(e) => {
				if (e.key === "Tab") {
					e.preventDefault();
				}
			},
			true,
		);

		await formStates.promiseForAudioFirstLoad;
		parseAudioText();
	}

	async function playAudioButtonOnClick() {
		// play all audios in this one field
		for (const name of usedAudios) {
			const n = formStates.audioNodes[name];
			await n.play();
			await new Promise((resovle, reject) => {
				n.onended = (e) => resovle();
			});
		}
	}
</script>

<div class={customClasses}>
	<label for={id} class="d-flex form-label justify-content-between align-items-center">
		<span>{label}</span>
		<div>
			{#if usedAudios.length !== 0}
				<SmallPlayAudioButton onclick={playAudioButtonOnClick} />
			{/if}
			{#if isShowPin}
				<button onclick={toogleKeeping}>
					{#if isKeep}
						<i class="bi bi-pin-angle-fill"></i>
					{:else}
						<i class="bi bi-pin-angle"></i>
					{/if}
					<span style:display="none">toogke keeping</span>
				</button>
			{/if}
		</div>
	</label>
	<div class="editable-quill-textbox" {@attach setupQuill}>
		{#if content}
			{@html content}
		{/if}
	</div>
</div>

<style>
	.editable-quill-textbox :global(img) {
		max-width: 250px;
		max-height: 150px;
		width: unset;
		height: unset;
	}

	.editable-quill-textbox :global(img.editable-quill-textbox-not-shrink) {
		max-width: 100%;
		max-height: 100%;
	}
</style>
