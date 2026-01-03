<script>
	const { stability, toogleUnder7, toogle7To30, toogle30To90, toogle90To365, toogleOver365 } = $props();
	let dropdown;
	async function setup(el) {
		/* const bootstrap = await import("bootstrap"); */
		/* dropdown = new bootstrap.Collapse(el); */
	}
</script>

<ul class="menu list-unstyled mb-0">
	<li>
		<button
			onclick={() => dropdown?.toggle()}
			class="d-flex align-items-center btn btn-toggle gap-2 p-1 ps-2"
			data-bs-toggle="collapse"
		>
			<i class="bi bi-clock"></i>
			Độ ổn định
		</button>
		<ul {@attach setup} id="state-menu" class="list-unstyled">
			<li class={[stability.under7 && "border-dark rounded border border-2"]}>
				<button onclick={toogleUnder7} class={["dropdown-item d-flex align-items-center ms-3 gap-2 py-1"]}>
					<i class="bi bi-clock"></i>
					Dưới 7 ngày
				</button>
			</li>
			<li class={[stability.from7to30 && "border-dark rounded border border-2"]}>
				<button onclick={toogle7To30} class={["dropdown-item d-flex align-items-center ms-3 gap-2 py-1"]}>
					<i class="bi bi-clock"></i>
					Từ 7 đến 30 ngày
				</button>
			</li>
			<li class={[stability.from30to90 && "border-dark rounded border border-2"]}>
				<button onclick={toogle30To90} class={["dropdown-item d-flex align-items-center ms-3 gap-2 py-1"]}>
					<i class="bi bi-clock"></i>
					Từ 30 đến 90 ngày
				</button>
			</li>
			<li class={[stability.from90to365 && "border-dark rounded border border-2"]}>
				<button onclick={toogle90To365} class={["dropdown-item d-flex align-items-center ms-3 gap-2 py-1"]}>
					<i class="bi bi-clock"></i>
					Từ 90 đến 1 năm
				</button>
			</li>
			<li class={[stability.over365 && "border-dark rounded border border-2"]}>
				<button onclick={toogleOver365} class={["dropdown-item d-flex align-items-center ms-3 gap-2 py-1"]}>
					<i class="bi bi-clock"></i>
					Trên 1 năm
				</button>
			</li>
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
