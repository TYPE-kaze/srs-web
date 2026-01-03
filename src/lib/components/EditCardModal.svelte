<script>
	const { children } = $props();

	let modal = $state();
	let isModalOpen = $state(false);

	async function setup(el) {
		const bootstrap = await import("bootstrap");
		modal = new bootstrap.Modal(el);
		el.addEventListener("show.bs.modal", () => {
			isModalOpen = true;
		});

		el.addEventListener("hide.bs.modal", () => {
			isModalOpen = false;
		});
	}

	export function show() {
		modal?.show();
	}

	export function toggle() {
		modal?.toggle();
	}
</script>

<div {@attach setup} class="modal" tabindex="-1">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="modal-header py-3">
				<h5 class="modal-title">Chỉnh sửa</h5>
				<button tabindex="-1" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body pt-0">
				{@render children()}
			</div>
		</div>
	</div>
</div>
