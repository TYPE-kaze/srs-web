<script>
	import Review from "./Review.svelte";
	import ButtonGroup from "./ButtonGroup.svelte";
	import EditCardModal from "$lib/components/EditCardModal.svelte";
	import QAForm from "$lib/components/QAForm.svelte";
	import DeleteConfirmModal from "$lib/components/DeleteConfirmModal.svelte";
	import { onMount } from "svelte";
	import { Reviewer } from "$lib/reviewer.svelte.js";
	import TestInfoModal from "$lib/components/TestInfoModal.svelte";

	let isFlipped = $state(false);
	let qaElement = $state.raw();
	let reviewer = $state();
	let question = $derived(reviewer?.current?.getHydrateQuestionForViewing());
	let answer = $derived(reviewer?.current?.getHydrateAnswerForViewing());
	function resetQuestion() {
		question = reviewer?.current?.getHydrateQuestionForViewing();
	}
	function resetAnswer() {
		answer = reviewer?.current?.getHydrateAnswerForViewing();
	}
	function resetBoth() {
		resetQuestion();
		resetAnswer();
	}

	let modal = $state();
	let deleteModal = $state();
	let infoModal = $state();
	let qaform;
	const promise = (async () => {
		reviewer = await Reviewer.createNewReviewer();
	})();

	function deleteHandler() {
		reviewer?.deleteCurrent();
	}

	function onGradeForget() {
		reviewer.gradeForget();
		isFlipped = false;
	}

	function onGradeGood() {
		reviewer.gradeGood();
		isFlipped = false;
	}

	$effect(() => {
		if (isFlipped === false && qaElement) qaElement.scrollTop = 0;
	});

	let isReviewable = $derived(Array.isArray(reviewer?.queue) && reviewer?.queue?.length !== 0);
</script>

{#await promise then res}
	{#if Array.isArray(reviewer.queue) && reviewer.queue.length === 0}
		<div class="empty-state d-flex flex-column justify-content-center align-items-center">
			<h3 class="mt-3">Hiện tại không có kiến thức cần ôn lại</h3>
		</div>
	{:else}
		<div bind:this={qaElement} id="qa" class="mt-3">
			<Review --max-img-height="80vh" --max-img-width="70vw" {isFlipped} {question} {answer} />
		</div>
	{/if}

	<div class="bottom">
		<div class="left">
			{#if isReviewable}
				<button onclick={() => modal?.show()} class="btn btn-outline-success">
					<i class="bi bi-pencil-square"></i>
					Chỉnh sửa
				</button>

				<button onclick={deleteModal?.show} class="btn btn-outline-danger">
					<i class="bi bi-trash"></i>
					Xóa
				</button>
				<span style:display="none">left</span>
			{/if}
		</div>
		<div class="center">
			{#if isReviewable}
				<ButtonGroup onCheck={() => (isFlipped = true)} {onGradeForget} {onGradeGood} {isFlipped} />
			{/if}
		</div>
		<div class="right">
			<button onclick={() => infoModal?.show()} class="btn btn-outline-info">
				<i class="bi bi-info-circle"></i>
				<span style:display="none">info</span>
			</button>
			<a class="btn btn-outline-primary" href="/">
				<i class="bi bi-arrow-left"></i>
				GD Chính
			</a>
		</div>
	</div>
{/await}

<EditCardModal bind:this={modal}>
	<QAForm runOnEdit={resetBoth} test={reviewer?.current} bind:this={qaform} />
</EditCardModal>

<DeleteConfirmModal {deleteHandler} test={reviewer?.current} bind:this={deleteModal} />

{#if reviewer?.current}
	<TestInfoModal bind:this={infoModal} currentTest={reviewer?.current} />
{/if}

<style>
	div.empty-state {
		height: 100%;
		border-radius: 10px;
		text-align: center;
	}

	div.bottom {
		background-color: rgb(248, 249, 250);
		border-top: 1px solid grey;
		padding: 8px;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
	}

	div.bottom div.left {
		justify-self: start;
	}

	div.bottom div.center {
		justify-self: center;
	}

	div.bottom div.right {
		justify-self: end;
	}

	div#qa {
		width: 100%;
		max-height: 100%;
		padding-left: 5%;
		padding-right: 5%;
		margin-left: auto;
		margin-right: auto;
		overflow-y: auto;
		flex: 1;
	}
</style>
