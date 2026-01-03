<script>
	const { hasAudio, onclick } = $props();
</script>

<button
	{onclick}
	class={[hasAudio && "border-dark rounded border border-2", "dropdown-item d-flex align-items-center mt-1 gap-2 p-1 ps-2"]}
>
	<i class="bi bi-music-note-beamed"></i>
	Có âm thanh
</button>
