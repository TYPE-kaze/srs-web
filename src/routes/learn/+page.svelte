<script>
	import { onMount } from "svelte";
	import { usePdfiumEngine } from "@embedpdf/engines/svelte";
	import { EmbedPDF } from "@embedpdf/core/svelte";
	import { createPluginRegistration } from "@embedpdf/core";

	import { ViewportPluginPackage, Viewport } from "@embedpdf/plugin-viewport/svelte";
	import { ScrollPluginPackage, Scroller } from "@embedpdf/plugin-scroll/svelte";
	import { ZoomPluginPackage, ZoomMode } from "@embedpdf/plugin-zoom/svelte";

	import {
		DocumentManagerPluginPackage,
		DocumentContent,
		useDocumentManagerCapability,
	} from "@embedpdf/plugin-document-manager/svelte";
	import { RenderLayer, RenderPluginPackage } from "@embedpdf/plugin-render/svelte";
	import { ThumbnailPluginPackage } from "@embedpdf/plugin-thumbnail/svelte";

	import { SelectionPluginPackage, SelectionLayer } from "@embedpdf/plugin-selection/svelte";
	import { InteractionManagerPluginPackage, PagePointerProvider } from "@embedpdf/plugin-interaction-manager/svelte";

	import { HistoryPluginPackage } from "@embedpdf/plugin-history/svelte";
	import { AnnotationPluginPackage } from "@embedpdf/plugin-annotation/svelte";
	import { CapturePluginPackage } from "@embedpdf/plugin-capture/svelte";

	import { getCurrentBook } from "$lib/book.svelte.js";

	import Content from "./Content.svelte";
	import Toolbar from "./Toolbar.svelte";
	import AddCardModal from "./AddCardModal.svelte";
	import QAForm from "$lib/components/QAForm.svelte";
	import { getLearnPartnerAI } from "$lib/genai.svelte";
	import { toast } from "svelte-sonner";

	let bookStates = getCurrentBook();
	let selectedText = $state("");
	let modal = $state();
	let qaform;

	function appendQuestionText(text) {
		qaform.appendQuestionText(text);
	}

	function appendAnswerText(text) {
		qaform.appendAnswerText(text);
	}

	function setQuestionText(text) {
		qaform.setQuestionText(text);
	}

	function setAnswerText(text) {
		qaform.setAnswerText(text);
	}

	function setQuestionImage(url) {
		qaform.setQuestionImage(url);
	}

	function updateSelectedText(text) {
		selectedText = text;
	}

	function appendQuestionImage(url) {
		qaform.appendQuestionImage(url);
	}

	function toogleModal() {
		modal?.toggle();
	}

	const pdfEngine = usePdfiumEngine();
	let plugins = $state();
	let isSideBar = $state(false);
	function toogleSideBar() {
		isSideBar = !isSideBar;
	}

	let isPluginInit = $state(false);
	async function initPlugins(file) {
		if (!isPluginInit) {
			const buffer = await file.arrayBuffer();

			plugins = [
				createPluginRegistration(DocumentManagerPluginPackage, {
					initialDocuments: [{ name: "test", buffer }],
				}),
				createPluginRegistration(ViewportPluginPackage),
				createPluginRegistration(ScrollPluginPackage),
				createPluginRegistration(RenderPluginPackage),
				createPluginRegistration(ZoomPluginPackage, {
					defaultZoomLevel: ZoomMode.FitPage,
				}),
				createPluginRegistration(ThumbnailPluginPackage, {
					width: 140,
					paddingY: 10,
					autoScroll: false,
				}),
				createPluginRegistration(InteractionManagerPluginPackage),
				createPluginRegistration(SelectionPluginPackage),
				createPluginRegistration(HistoryPluginPackage),
				createPluginRegistration(AnnotationPluginPackage, {
					deactivateToolAfterCreate: true,
					selectAfterCreate: false,
				}),
				createPluginRegistration(CapturePluginPackage, {
					scale: 2,
					imageType: "image/jpeg",
					withAnnotations: true,
				}),
			];
			isPluginInit = true;
		}
	}

	let learnPartner;
	let learnPartnerPromise;
	let loading = $state(false);

	async function getQA(pageNum, text) {
		loading = true;
		try {
			let ret = pageNum + text;
			if (!learnPartner) {
				learnPartner = await learnPartnerPromise;
			}
			ret = await learnPartner.getQA(pageNum, text);
			ret = ret.split("\n");
			setQuestionText(ret[0]);
			setAnswerText(ret[1]);
		} catch (err) {
			let msg = "Có lỗi xảy ra";
			msg = err.message;
			try {
				if (JSON.parse(err.message)?.error?.code === 429) {
					msg = "Bạn đã sử dụng quá giới hạn hiện tại của API";
				}
			} catch (e) {}
			toast.error(msg);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (bookStates.currentBook && !isPluginInit) {
			initPlugins(bookStates.currentBook.file);
			learnPartnerPromise = getLearnPartnerAI(bookStates.currentBook.file);
		}
	});
</script>

{#if pdfEngine.isLoading || !pdfEngine.engine || !isPluginInit}
	<div class="loading-pane">
		<div class="text-center">
			<div class="spinner-border mt-5" style="width: 5rem; height: 5rem;" role="status">
				<span class="visually-hidden">Loading...</span>
			</div>
		</div>
	</div>
{:else}
	<div class="reader d-flex flex-column">
		<EmbedPDF engine={pdfEngine.engine} {plugins}>
			{#snippet children({ activeDocumentId })}
				{#if activeDocumentId}
					{@const documentId = activeDocumentId}
					<DocumentContent {documentId}>
						{#snippet children(documentContent)}
							{#if documentContent.isLoaded}
								<Content
									{setQuestionText}
									{setAnswerText}
									{appendQuestionText}
									{appendAnswerText}
									{updateSelectedText}
									{selectedText}
									showModal={() => modal?.show()}
									{isSideBar}
									{documentId}
									{bookStates}
									generateQAFromAI={getQA}
								/>
							{/if}
						{/snippet}
					</DocumentContent>
					<div class="border-dark-subtle toolbar border">
						<Toolbar {appendQuestionImage} {setQuestionImage} {toogleModal} {documentId} {toogleSideBar} />
					</div>
				{/if}
			{/snippet}
		</EmbedPDF>
	</div>
{/if}

<AddCardModal {loading} bind:this={modal} {selectedText}>
	<QAForm bind:this={qaform} />
</AddCardModal>

<style>
	div.toolbar {
		flex: 0 0 auto;
		min-height: 45px;
		/* padding: 4px 8px 4px 8px; */
		background-color: #f9fafb;
	}

	.reader {
		height: 100%;
	}

	.loading-pane {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
</style>
