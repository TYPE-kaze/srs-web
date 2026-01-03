<script>
	import SmallPlayAudioButton from "$lib/components/SmallPlayAudioButton.svelte";
	const { registerUpdateCardHandler, onEditButtonHandler, showModal, test, onload, deleteTest, onCardClick, currentTest } =
		$props();
	const isSelected = $derived(currentTest?.id === test.id);
	let audios = $state([]);
	let isQuestionHasImage = false;

	let question = $state();
	let answer = $state();
	let image = $state();

	function updateQuestion() {
		isQuestionHasImage = false;
		audios = [];
		question = test.question.replace(/\[(audio|image):([^\]]+)\]/g, (_, type, name) => {
			const audioblob = test.audios[name];
			if (type === "image") {
				isQuestionHasImage = true;
			}

			if (audioblob) {
				const dataURL = URL.createObjectURL(audioblob);
				const a = new Audio();
				a.src = dataURL;
				a.setAttribute("name", name);
				audios.push(a);
			} else {
			}
			return "";
		});

		if (isQuestionHasImage && test.images[0]) {
			image = URL.createObjectURL(test.images[0]);
		} else image = null;
	}

	async function updateAnswer() {
		answer = await test.getHydratedAnswer();
	}

	function updateBoth() {
		updateQuestion();
		updateAnswer();
	}
	registerUpdateCardHandler(updateBoth);

	updateBoth();

	function playAudio() {
		for (const a of audios) {
			a.play();
		}
	}
	function onkeydown() {}
	const elBaseClass = ["card browse-card"];
	const selectedClass = "border border-primary border-2";

	let answerDropdown;
	async function setup(el) {
		const bootstrap = await import("bootstrap");
		answerDropdown = new bootstrap.Dropdown(el);
	}
</script>

<div onclick={onCardClick} {onkeydown} tabindex="0" role="button" class={[isSelected && selectedClass, ...elBaseClass]}>
	{#if image}
		<img {onload} src={image} class="card-img-top" alt="" />
	{/if}
	<div class="card-body">
		<p class="card-text">
			{@html question}
		</p>
		<div class="d-flex justify-content-between">
			<div class="left d-flex">
				<button onclick={showModal}>
					<i class="bi bi-info-circle"></i>
					<span style:display="none">info</span>
				</button>
				{#if audios.length !== 0}
					<SmallPlayAudioButton class="ps-1" onclick={playAudio} />
				{/if}
			</div>
			<div class="btn-group" role="group">
				<div class="btn-group" role="group">
					<button
						onclick={() => answerDropdown?.toggle()}
						{@attach setup}
						class="btn btn-outline-primary btn-sm dropdown-toggle"
						data-bs-toggle="dropdown"
					>
						<i class="bi bi-check-lg"></i>
						<span style:display="none">check answer</span>
					</button>
					<ul
						class="dropdown-menu border border-2 border-primary px-3 py-2"
						style:min-width="300px"
						style:max-width="600px"
					>
						<h6 class="dropdown-header mb-1 p-0">Đáp án</h6>
						<li class="answer">{@html answer}</li>
					</ul>
				</div>
				<button onclick={onEditButtonHandler} class="btn btn-outline-success btn-sm">
					<i class="bi bi-pencil-square"></i>
					<span style:display="none">edit</span>
				</button>
				<button onclick={deleteTest} class="btn btn-outline-danger btn-sm">
					<i class="bi bi-trash"></i>
					<span style:display="none">delete</span>
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	div.left {
		font-size: 1.15em;
	}
	div.btn-group {
		button::after {
			display: none;
		}
	}
	div.card-body {
		padding-bottom: 8px;
		padding-right: 8px;
	}
	p.card-text {
		margin-bottom: 4px;
	}

	img {
		max-height: 400px;
		width: 100%;
		object-fit: cover;
	}

	li.answer :global(img) {
		width: 100%;
		max-width: 100%;
		max-height: 100%;
	}

	div.card.browse-card div.card-body p.card-text :global(p) {
		padding: 0;
		margin: 0;
	}
</style>
