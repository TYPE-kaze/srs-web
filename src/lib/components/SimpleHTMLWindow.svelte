<script>
	const { content, isAutoPlay } = $props();
	let mainNode;
	let isFirstTime = true;
	function setHandlerForThePlayButton(node) {
		const buttons = node.querySelectorAll("button");
		for (const button of buttons) {
			const audio = node.querySelector(`audio[name="${button.getAttribute("for")}"]`);
			if (audio) {
				if (isAutoPlay) audio.play();
				button.addEventListener("click", () => {
					audio.play();
				});
			}
		}
	}

	function setup(node) {
		mainNode = node;
		node.scrollIntoView({ behavior: "instant" });
		/* node.scrollIntoView({ behavior: "smooth" }); */
		setHandlerForThePlayButton(mainNode);
		isFirstTime = false;
	}

	$effect(() => {
		content;
		if (isFirstTime) return;
		if (mainNode) setHandlerForThePlayButton(mainNode);
	});
</script>

<div {@attach setup}>{@html content}</div>

<style>
	div {
		max-width: 100%;
		max-height: 100%;
		text-align: center;
		font-family: "Noto Sans", "Noto Sans JP", sans-serif;
		line-height: 1.25;
		font-size: var(--size-of-content, 1em);

		:global(button.play-audio) {
			padding: 0;
			font-size: 2.5rem;
			border: none;
		}
	}

	div :global(img) {
		max-width: var(--max-img-width, 80%);
		max-height: var(--max-img-height, 80%);
		display: inline;
	}
</style>
