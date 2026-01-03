<script>
	import { useCapture } from "@embedpdf/plugin-capture/svelte";
	import { onMount, onDestroy } from "svelte";

	let { documentId, captureHandler, toogleModal } = $props();

	const capture = useCapture(() => documentId);
	const isCaptureActive = $derived(capture.state.isMarqueeCaptureActive);

	let unsubscribeCapture;
	let imageUrl = $state(null);
	let captureResult = $state(null);

	onMount(() => {
		if (!capture.provides) return;
		unsubscribeCapture = capture.provides.onCaptureArea(async (result) => {
			captureResult = result;
			const b = result.blob;
			const b64 = await b.bytes().then((b) => b.toBase64());
			imageUrl = `data:${b.type};base64,${b64}`;
			captureHandler(imageUrl);
			toogleModal();
		});
	});

	onDestroy(() => {
		unsubscribeCapture?.();
		if (imageUrl) URL.revokeObjectURL(imageUrl);
	});

	function onclick() {
		capture.provides?.toggleMarqueeCapture();
	}
	const baseClasses = "btn btn-sm btn-outline-dark me-1 rounded";
</script>

<button class={[isCaptureActive && "active", baseClasses]} {onclick}>
	{#if isCaptureActive}
		<i class="bi bi-plus-circle"></i>
	{:else}
		<i class="bi bi-plus-circle-dotted"></i>
	{/if}
	<span style:display="none">capture image</span>
</button>
