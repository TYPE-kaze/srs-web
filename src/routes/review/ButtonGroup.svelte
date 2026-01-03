<script>
	const { isFlipped, onCheck, onGradeForget, onGradeGood } = $props();
</script>

<div class="button-group">
	{#if !isFlipped}
		<button onclick={onCheck} type="button" class="btn btn-secondary">Hiện đáp án</button>
	{:else}
		<button onclick={onGradeForget} type="button" class="btn btn-secondary">
			<i class="bi bi-arrow-clockwise"></i>
			<span>Quên</span>
		</button>
		<button onclick={onGradeGood} type="button" class="btn btn-success">
			<i class="bi bi-check-lg"></i>
			<span>Có nhớ</span>
		</button>
	{/if}
</div>
