<script>
	const {
		toogleReviewedAgainToday,
		toogleReviewedGoodToday,
		today,
		toggleNeedReviewStateFilter,
		toggleReviewedTodayStateFilter,
		toogleAddedToday,
	} = $props();
	let dropdown;
	async function setup(el) {
		/* const bootstrap = await import("bootstrap"); */
		/* dropdown = new bootstrap.Collapse(el); */
	}
</script>

<ul class="menu list-unstyled mb-0">
	<li>
		<button onclick={() => dropdown?.toggle()} class="btn btn-toggle p-1 ps-2" data-bs-toggle="collapse">
			<span class="d-inline-block border-dark rounded-circle border p-1"></span>
			Hôm nay
		</button>
		<ul {@attach setup} id="state-menu" class="list-unstyled">
			<li class={[today.needReview && "rounded border border-2 border-info"]}>
				<button onclick={toggleNeedReviewStateFilter} class={["dropdown-item d-flex align-items-center ms-3 gap-2 py-1"]}>
					<span class="d-inline-block rounded-circle bg-info p-1"></span>
					Cần ôn lại
				</button>
			</li>
			<li class={[today.reviewed && "rounded border border-2 border-primary"]}>
				<button onclick={toggleReviewedTodayStateFilter} class="dropdown-item d-flex align-items-center ms-3 gap-2 py-1">
					<span class="d-inline-block rounded-circle bg-primary p-1"></span>
					Đã ôn lại
				</button>
			</li>
			<li class={[today.added && "rounded border border-2 border-danger"]}>
				<button onclick={toogleAddedToday} class="dropdown-item d-flex align-items-center ms-3 gap-2 py-1">
					<span class="d-inline-block rounded-circle bg-danger p-1"></span>
					Mới thêm
				</button>
			</li>
			<li class={[today.good && "rounded border border-2 border-success"]}>
				<button onclick={toogleReviewedGoodToday} class="dropdown-item d-flex align-items-center ms-3 gap-2 py-1">
					<span class="d-inline-block rounded-circle bg-success p-1"></span>
					Có nhớ
				</button>
			</li>
			<li class={[today.again && "rounded border border-2 border-warning"]}>
				<button onclick={toogleReviewedAgainToday} class="dropdown-item d-flex align-items-center ms-3 gap-2 py-1">
					<span class="d-inline-block rounded-circle bg-warning p-1"></span>
					Quên
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
