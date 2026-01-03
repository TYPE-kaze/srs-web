<script>
	const { test, deleteHandler } = $props();
	let modal;
	async function setup(el) {
		const bootstrap = await import("bootstrap");
		modal = new bootstrap.Modal(el);
	}

	export function hide() {
		modal?.hide();
	}

	export function show() {
		modal?.show();
	}

	function onclick() {
		deleteHandler();
		hide();
	}
</script>

<div {@attach setup} class="modal" tabindex="-1">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content rounded-4 shadow">
			<div class="modal-header border-bottom-0">
				<h1 class="modal-title fs-3">Xác nhận xóa ?</h1>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body py-0">
				<p>Kiến thức sẽ bị xóa ra khỏi cả hàng đợi và ổ cứng. Bạn đã chắc chắn?</p>
			</div>
			<div class="fs-3 modal-footer flex-column align-items-stretch border-top-0 w-100 gap-1 pb-3">
				<button {onclick} type="button" class="btn btn btn-danger">Xóa</button>
				<button type="button" class="btn btn btn-secondary" data-bs-dismiss="modal">Quay lại</button>
			</div>
		</div>
	</div>
</div>
