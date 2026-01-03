<script>
	const { hasImage, onclick } = $props();
	const baseClasses = ["d-flex align-items-center gap-2 mt-1 p-1 ps-2"];
	const classWhenOn = "border-dark rounded border border-2";
</script>

<button {onclick} class={[hasImage && classWhenOn, ...baseClasses]}>
	<i class="bi bi-image"></i>
	Có ảnh
</button>
