<script>
	import SimpleHTMLWindow from "$lib/components/SimpleHTMLWindow.svelte";
	let { isFlipped, question, answer } = $props();
</script>

<SimpleHTMLWindow --size-of-content="2.3rem" content={question} isAutoPlay={true} />
{#if isFlipped}
	<hr />
	<SimpleHTMLWindow --size-of-content="2rem" content={answer} isAutoPlay={false} />
{/if}

<style>
	hr {
		max-width: 90%;
		margin-left: auto;
		margin-right: auto;
	}
</style>
