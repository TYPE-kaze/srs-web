<script>
	const { test, onload } = $props();
	const { question, images } = test;
</script>

<div class="card browse-card">
	<div class="card-body">
		<p class="card-text">
			{@html question}
		</p>
	</div>
	<img {onload} src={image} class="card-img-bottom" alt="" />
</div>

<style>
	img {
		height: 400px;
		width: 100%;
		object-fit: cover;
	}

	div.card.browse-card div.card-body p.card-text :global(p) {
		padding: 0;
		margin: 0;
	}
</style>
