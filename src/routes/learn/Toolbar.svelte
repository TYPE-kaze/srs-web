<script>
	import ZoomButtons from "./ZoomButtons.svelte";
	import AnnotationButtons from "./AnnotationButtons.svelte";
	import CaptureButtons from "./CaptureButtons.svelte";
	let { documentId, toogleSideBar, toogleModal, setQuestionImage, appendQuestionImage } = $props();
</script>

<div class="main row g-0 px-2">
	<div class="start d-flex justify-content-between align-items-center col-5 p-0">
		<button class="btn btn-sm btn-outline-dark rounded" onclick={toogleSideBar}>
			<i class="bi bi-layout-text-sidebar-reverse"></i>
			<span style:display="none">toogle side bar</span>
		</button>
		<AnnotationButtons {documentId} />
	</div>

	<div class="middle d-flex justify-content-center align-items-center col-2 p-0">
		<ZoomButtons {documentId} />
	</div>
	<div class="align-items-center d-flex justify-content-between end col-5 p-0">
		<div class="align-items-center d-flex justify-content-between p-0">
			<CaptureButtons {toogleModal} {documentId} captureHandler={appendQuestionImage} />
			<button onclick={toogleModal} class="btn btn-sm btn-outline-dark rounded">
				<i class="bi bi-pencil-square"></i>
				<span style:display="none">toogle modal</span>
			</button>
		</div>
		<a class="btn btn-sm btn-primary" href="/">
			<i class="bi bi-arrow-left"></i>
			GD Chính
		</a>
	</div>
</div>

<style>
	div.main {
		width: 100%;
		min-width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
	}
</style>
