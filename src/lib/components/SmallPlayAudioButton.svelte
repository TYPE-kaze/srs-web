<script>
	const props = $props();
</script>

<button onclick={props.onclick} class={[props.class, "play-button"]} type="button">
	<i class="bi bi-play-circle"></i>
	<span class="visually-hidden">Play</span>
</button>

<style>
	.play-button {
		background: transparent;
		border: none;
		padding: 0;
	}
</style>
