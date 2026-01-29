<script>
	const {
		redoButtonHandler,
		undoButtonHandler,
		codeButtonHandler,
		boldSelection,
		formStates,
		italicSelection,
		underlineSelection,
		questionNode,
		answerNode,
		reviewNowHandler,
		clozeButtonHandler,
	} = $props();
</script>

<div class="btn-group text-format me-2" role="group" aria-label="First group">
	<button type="button" onclick={boldSelection} class={[formStates.bold && "active", "bold btn btn-sm btn-outline-secondary"]}>
		B
	</button>
	<button
		type="button"
		onclick={italicSelection}
		class={[formStates.italic && "active", "btn btn-sm btn-outline-secondary italic"]}
	>
		I
	</button>
	<button
		type="button"
		onclick={underlineSelection}
		class={[formStates.underline && "active", "underscore btn btn-sm btn-outline-secondary"]}
	>
		U
	</button>
</div>

<div class="btn-group me-2" role="group">
	<button type="button" onclick={codeButtonHandler} class={[formStates.code && "active", "btn btn-sm btn-outline-secondary"]}>
		<i class="bi bi-code-slash"></i>
		<span style:display="none">Code</span>
	</button>
</div>

<div class="btn-group me-2" role="group">
	<button type="button" onclick={undoButtonHandler} class="btn btn-sm btn-outline-secondary">
		<i class="bi bi-arrow-counterclockwise"></i>
		<span style:display="none">undo</span>
	</button>
	<button type="button" onclick={redoButtonHandler} class="btn btn-sm btn-outline-secondary">
		<i class="bi bi-arrow-clockwise"></i>
		<span style:display="none">redo</span>
	</button>
</div>

<div class="btn-group me-2" role="group">
	<button type="button" onclick={clozeButtonHandler} class="btn btn-sm btn-outline-secondary">Cloze</button>
</div>

<div class="btn-group me-2" role="group">
	<button
		type="button"
		onclick={reviewNowHandler}
		class={[formStates.reviewNow && "active", "btn btn-sm btn-outline-secondary"]}
	>
		Ôn tập luôn
	</button>
</div>

<div class="btn-group me-2" role="group">
	<button
		type="button"
		onclick={() => {
			questionNode?.setText("");
			answerNode?.setText("");
		}}
		class="btn btn-sm btn-outline-secondary"
	>
		Đặt lại
	</button>
</div>

<style>
	button {
		color: black;
		height: 2em;
	}

	div.text-format button {
		width: 2em;
		height: 2em;
		aspect-ratio: 1/1;
	}

	button.active {
		color: white;
	}

	button.bold {
		font-weight: bold;
	}

	button.italic {
		font-style: italic;
	}

	button.underscore {
		text-decoration: underline;
	}
</style>
