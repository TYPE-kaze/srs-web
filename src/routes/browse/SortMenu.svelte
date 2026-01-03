<script>
	const { sort, handle } = $props();
	let dropdown;
	async function setup(el) {
		/* const bootstrap = await import("bootstrap"); */
		/* dropdown = new bootstrap.Collapse(el); */
	}
	const list = [
		{
			label: "Ngày thêm",
			id: "addedDate",
		},
		{
			label: "Độ khó",
			id: "difficulty",
		},
		{
			label: "Độ ổn định",
			id: "stability",
		},
		{
			label: "Xác xuất nhớ",
			id: "retrievability",
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
			<i class="bi bi-arrow-down-up"></i>
			Sắp xếp
		</button>
		<ul {@attach setup} id="state-menu" class="list-unstyled">
			{#each list as item}
				<li class={[sort[item.id].on && "border-dark rounded border border-2"]}>
					<button onclick={() => handle(item.id)} class={["dropdown-item d-flex align-items-center ms-3 gap-2 py-1"]}>
						{#if sort[item.id].direction === "down"}
							<i class="bi bi-sort-down"></i>
						{:else}
							<i class="bi bi-sort-up"></i>
						{/if}
						{item.label}
					</button>
				</li>
			{/each}
		</ul>
	</li>
</ul>

<style>
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
