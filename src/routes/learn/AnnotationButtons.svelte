<script>
	import { useAnnotationCapability } from "@embedpdf/plugin-annotation/svelte";
	import { onMount, onDestroy } from "svelte";
	let { documentId } = $props();
	const annotationCapability = useAnnotationCapability();
	const annotationApi = $derived(annotationCapability.provides?.forDocument(documentId));
	let activeTool = $state(null);
	let canDelete = $state(false);
	const tools = [
		{ id: "ink", name: "Pen", icon: '<i class="bi bi-pen"></i>' },
		{ id: "square", name: "Square", icon: '<i class="bi bi-square"></i>' },
		{ id: "highlight", name: "Highlight", icon: '<i class="bi bi-highlighter"></i>' },
	];
	let unsubscribeToolChange;
	let unsubscribeStateChange;
	onMount(() => {
		if (!annotationApi) return;

		unsubscribeToolChange = annotationApi.onActiveToolChange((tool) => {
			activeTool = tool?.id ?? null;
		});

		unsubscribeStateChange = annotationApi.onStateChange((state) => {
			canDelete = !!state.selectedUid;
		});
	});

	onDestroy(() => {
		unsubscribeToolChange?.();
		unsubscribeStateChange?.();
	});

	const handleToolClick = (toolId) => {
		annotationApi?.setActiveTool(activeTool === toolId ? null : toolId);
	};

	const handleDelete = () => {
		const selection = annotationApi?.getSelectedAnnotation();
		if (selection) {
			annotationApi?.deleteAnnotation(selection.object.pageIndex, selection.object.id);
		}
	};
</script>

<div>
	{#each tools as tool}
		{@const classes = [activeTool === tool.id && "active", "btn btn-sm btn-outline-dark me-1 rounded"]}
		<button onclick={() => handleToolClick(tool.id)} class={classes}>
			{@html tool.icon}
			<span style:display="none">{tool.name}</span>
		</button>
	{/each}
</div>
