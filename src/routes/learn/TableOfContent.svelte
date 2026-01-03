<script>
	import { useScroll } from "@embedpdf/plugin-scroll/svelte";
	const { toc, documentId } = $props();
	const scroll = useScroll(() => documentId);
	function scrollToPage(page) {
		return () => {
			scroll.provides?.scrollToPage?.({ pageNumber: page });
		};
	}
</script>

<nav id="toc" class="border p-1 px-2">
	{#if toc.length !== 0}
		<ul class="list-unstyled">
			{#each toc as item}
				<li class="mb-2 rounded p-1 hover:bg-gray-300">
					<button
						onclick={scrollToPage(item.page)}
						class="align-items-center d-flex item justify-content-between w-100 text-wrap"
					>
						<div class="me-2 text-start">
							{item.title}
						</div>
						<div class="text-end">
							{item.page}
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-center">Không đọc được mục lục của quyển sách này</p>
	{/if}
</nav>

<style>
	nav {
		height: 100%;
		overflow: auto;
	}

	button.item {
		font-size: 0.85em;
	}
</style>
