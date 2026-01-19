<script>
	import { MarqueeCapture } from "@embedpdf/plugin-capture/svelte";
	import { AnnotationLayer, useAnnotationCapability } from "@embedpdf/plugin-annotation/svelte";
	import { SelectionLayer, useSelectionCapability } from "@embedpdf/plugin-selection/svelte";
	import { PagePointerProvider } from "@embedpdf/plugin-interaction-manager/svelte";
	import { RenderLayer } from "@embedpdf/plugin-render/svelte";

	import ThumbnailSideBar from "./ThumbnailSideBar.svelte";
	import TableOfContent from "./TableOfContent.svelte";

	import { ViewportPluginPackage, Viewport } from "@embedpdf/plugin-viewport/svelte";
	import { ScrollPluginPackage, Scroller, useScroll, useScrollCapability } from "@embedpdf/plugin-scroll/svelte";

	import { onMount, onDestroy } from "svelte";

	import { ignore } from "@embedpdf/models";

	import { getCurrentPage, setCurrentPage } from "$lib/book.svelte.js";

	const {
		setQuestionText,
		setAnswerText,
		appendAnswerText,
		appendQuestionText,
		updateSelectedText,
		selectedText,
		showModal,
		documentId,
		bookStates,
		isSideBar,
	} = $props();
	let activeSideBarPage = $state(0);
	const selectionCapability = useSelectionCapability();
	const selection = $derived(selectionCapability.provides?.forDocument(documentId));
	const scroll = useScroll(() => documentId);
	const scrollCap = useScrollCapability();
	let hasSelection = $state(false);
	let unsubscribeSelectionChange;
	let unsubscribeEndSelection;

	onMount(() => {
		const page = getCurrentPage();
		if (scrollCap) {
			scrollCap?.provides.onPageChange(({ pageNumber }) => {
				if (Number.isInteger(pageNumber)) {
					setCurrentPage(pageNumber);
				}
			});

			scrollCap?.provides.onLayoutReady(({ isInitial }) => {
				if (Number.isInteger(page)) {
					scroll.provides.scrollToPage({ pageNumber: page });
				}
			});
		}
		if (!selection) return;

		unsubscribeSelectionChange = selection.onSelectionChange((selectionRange) => {
			hasSelection = !!selectionRange;
			if (!selectionRange) {
				/* selectedText = ""; */
				updateSelectedText("");
			}
		});

		unsubscribeEndSelection = selection.onEndSelection(() => {
			const textTask = selection?.getSelectedText();
			textTask.wait((textLines) => {
				updateSelectedText(textLines.join("\n"));
				/* selectedText = textLines.join("\n"); */
			}, ignore);
		});
	});

	onDestroy(() => {
		unsubscribeSelectionChange?.();
		unsubscribeEndSelection?.();
	});

	function handleCopy() {
		selection?.copyToClipboard();
		selection?.clear();
	}

	function setQuestionTextAndOpenModel() {
		const text = selectedText?.replace(/[\n\s\r]+/g, " ");
		setQuestionText(text);
		selection?.clear();
		showModal();
	}

	function setAnswerTextAndOpenModel() {
		const text = selectedText?.replace(/[\n\s\r]+/g, " ");
		setAnswerText(text);
		selection?.clear();
		showModal();
	}

	function appendQuestionTextAndOpenModel() {
		const text = "\n" + selectedText?.replace(/[\n\s\r]+/g, " ");
		appendQuestionText(text);
		selection?.clear();
		showModal();
	}

	function appendAnswerTextAndOpenModel() {
		const text = "\n" + selectedText?.replace(/[\n\s\r]+/g, " ");
		appendAnswerText(text);
		selection?.clear();
		showModal();
	}

	const annotationCapability = useAnnotationCapability();
	const annotationApi = $derived(annotationCapability.provides?.forDocument(documentId));
	const handleDeleteFromMenu = (pageIndex, id) => {
		annotationApi?.deleteAnnotation(pageIndex, id);
	};
</script>

{#snippet renderPage(page)}
	<div style:width="{page.width}px" style:height="{page.height}px" style:position="relative">
		<PagePointerProvider {documentId} pageIndex={page.pageIndex}>
			<RenderLayer class="pointer-events-none" {documentId} pageIndex={page.pageIndex} />
			<MarqueeCapture {documentId} pageIndex={page.pageIndex} />
			<SelectionLayer {documentId} pageIndex={page.pageIndex}>
				{#snippet selectionMenuSnippet({ rect, menuWrapperProps, placement })}
					<span style={menuWrapperProps.style} use:menuWrapperProps.action>
						<div
							style:position="absolute"
							style:top={placement.suggestTop ? "-48px" : `${rect.size.height + 8}px`}
							style:pointer-events="auto"
							style:cursor="default"
							style:min-width="200px"
						>
							<div style:font-size="0.9em" class="context-menu list-group">
								<button
									type="button"
									class="context-menu text-dark list-group-item-action list-group-item text-start"
									onclick={setQuestionTextAndOpenModel}
								>
									Thêm đè lên Câu Hỏi
								</button>
								<button
									type="button"
									class="context-menu text-dark list-group-item-action list-group-item text-start"
									onclick={setAnswerTextAndOpenModel}
								>
									Thêm đè lên Đáp Án
								</button>
								<button
									type="button"
									class="context-menu text-dark list-group-item-action list-group-item text-start"
									onclick={appendQuestionTextAndOpenModel}
								>
									Thêm vào cuối Câu Hỏi
								</button>
								<button
									type="button"
									class="context-menu text-dark list-group-item-action list-group-item text-start"
									onclick={appendAnswerTextAndOpenModel}
								>
									Thêm vào cuối Đáp Án
								</button>
								<button
									type="button"
									class="context-menu text-dark list-group-item-action list-group-item text-start"
									onclick={handleCopy}
								>
									<i class="bi bi-clipboard"></i>
									Sao chép
								</button>
							</div>
						</div>
					</span>
				{/snippet}
			</SelectionLayer>
			<AnnotationLayer {documentId} pageIndex={page.pageIndex}>
				{#snippet selectionMenuSnippet({ selected, context, menuWrapperProps, rect })}
					{@const pageIndex = context.annotation.object.pageIndex}
					{@const objID = context.annotation.object.id}
					{@const onclick = () => handleDeleteFromMenu(pageIndex, objID)}
					{#if selected}
						<span style={menuWrapperProps.style} use:menuWrapperProps.action>
							<div
								class="rounded border bg-white shadow"
								style:position="absolute"
								style:top="{rect.size.height + 8}px"
								style:pointer-events="auto"
								style:cursor="default"
							>
								<div class="flex items-center p-1">
									<button type="button" {onclick} class="btn btn-outline-danger btn-sm">
										<i class="bi bi-trash-fill"></i>
										<span style:display="none">delete</span>
									</button>
								</div>
							</div>
						</span>
					{/if}
				{/snippet}
			</AnnotationLayer>
		</PagePointerProvider>
	</div>
{/snippet}

<div class="main d-flex flex-column" style:user-select="none">
	<div class="viewport-and-sidebar d-flex">
		{#if isSideBar}
			<div class="sidebar d-flex flex-column">
				<div class="d-flex border p-1" role="group">
					<button onclick={(activeSideBarPage = 0)} type="button" class="flex-fill rounded hover:bg-gray-300">
						<i class="bi bi-list-nested"></i>
						<span style:display="none">table of content</span>
					</button>
					<button onclick={(activeSideBarPage = 1)} type="button" class="flex-fill rounded hover:bg-gray-300">
						<i class="bi bi-grid"></i>
						<span style:display="none">thumnails</span>
					</button>
				</div>

				{#if activeSideBarPage === 0}
					<TableOfContent {documentId} toc={bookStates?.currentBook.toc} />
				{:else}
					<ThumbnailSideBar {documentId} />
				{/if}
			</div>
		{/if}
		<div class="viewport">
			<Viewport {documentId} style="background-color: #f1f3f5;">
				<Scroller {documentId} {renderPage} />
			</Viewport>
		</div>
	</div>
</div>

<style>
	div.viewport {
		height: 100%;
		flex: 1 1 auto;
		overflow: auto;
	}

	.viewport-and-sidebar {
		height: 100%;
	}
	div.main {
		flex: 1 1 auto;
		overflow: auto;
		height: 100%;
	}

	div.sidebar {
		height: 100%;
		width: 17%;
		max-height: 100%;
		min-width: 120px;
		background-color: #f9fafb;
	}
</style>
