<script>
	const { boldSelection, formStates, italicSelection, underlineSelection, questionNode, answerNode } = $props();
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

<div class="btn-group me-2" role="group" aria-label="First group">
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
