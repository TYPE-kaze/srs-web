<script>
	const { difficulty, toogleDifficulty } = $props();
	let dropdown;
	async function setup(el) {
		/* const bootstrap = await import("bootstrap"); */
		/* dropdown = new bootstrap.Collapse(el); */
	}
	const list = [
		{
			label: "Dễ (dưới 4)",
			id: "easy",
			icon: '<i class="bi bi-3-circle"></i>',
		},
		{
			label: "Trung bình (4 đến 8)",
			id: "medium",
			icon: '<i class="bi bi-7-circle"></i>',
		},
		{
			label: "Khó (8 đến 10)",
			id: "hard",
			icon: '<i class="bi bi-9-circle"></i>',
		},
	];
</script>

<ul class="menu list-unstyled mb-0">
	<li>
		<button
			onclick={() => dropdown?.toggle()}
			class="d-flex align-items-center btn btn-toggle gap-2 p-1 ps-2"
			data-bs-toggle="collapse"
		>
			<i class="bi bi-slash-circle"></i>
			Độ khó
		</button>
		<ul {@attach setup} id="state-menu" class="list-unstyled">
			{#each list as item}
				<li class={[difficulty[item.id] && "border-dark rounded border border-2"]}>
					<button
						onclick={() => toogleDifficulty(item.id)}
						class={["dropdown-item d-flex align-items-center ms-3 gap-2 py-1"]}
					>
						{@html item.icon}
						{item.label}
					</button>
				</li>
			{/each}
		</ul>
	</li>
</ul>

<style>
	li {
		box-sizing: border-box;
	}

	:global(.collapse) {
		visibility: unset;
	}
	.menu {
		button {
			padding: 0;
			border: none;
		}
	}
</style>
