<script>
	import { useScroll } from "@embedpdf/plugin-scroll/svelte";
	import { ThumbnailsPane, ThumbImg, useThumbnailCapability } from "@embedpdf/plugin-thumbnail/svelte";

	const { documentId } = $props();
	const scroll = useScroll(() => documentId);
</script>

<div class="main d-flex flex-column border">
	<ThumbnailsPane {documentId}>
		{#snippet children(meta)}
			{@const baseClasses = "overflow-hidden rounded-md transition-all"}
			{@const classOnCurrent = "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900"}
			{@const classOnNotCurrent = "ring-1 ring-gray-300 hover:ring-gray-400 dark:ring-gray-700 dark:hover:ring-gray-600"}
			{@const cutomsClasses = [
				baseClasses,
				scroll.state.currentPage === meta.pageIndex + 1 ? classOnCurrent : classOnNotCurrent,
			]}

			<button
				type="button"
				class="d-flex flex-column absolute w-100 items-center px-2"
				style:height="{meta.wrapperHeight}px"
				style:top="{meta.top}px"
				onclick={() => scroll.provides?.scrollToPage?.({ pageNumber: meta.pageIndex + 1 })}
			>
				<div class={cutomsClasses} style:width="{meta.width}px" style:height="{meta.height}px">
					<ThumbImg style="width: 100%; height: 100%; object-fit: cover;" {documentId} {meta} />
				</div>
				<span>{meta.pageIndex + 1}</span>
			</button>
		{/snippet}
	</ThumbnailsPane>
</div>

<style>
	.main {
		height: 100%;
		width: 100%;
	}
</style>
