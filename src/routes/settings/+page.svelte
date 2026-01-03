<script>
	import { getCurrentSettings, setSetting } from "$lib/settings.svelte.js";
	const currentSettings = getCurrentSettings();
	const reviewOrder = [
		{ id: "random", label: "Ngẫu nhiên" },
		{ id: "addedDateDesc", label: "Ngày thêm mới nhất trước" },
		{ id: "addedDateAsc", label: "Ngày thêm cũ nhất trước" },
		{ id: "retrievability", label: "Xác xuất nhớ thấp nhất trước" },
	];
	let selectedReviewOrder = $state(currentSettings.reviewOrder);
	let desiredRetention = $state(currentSettings.desiredRetention);
</script>

<div class="container mt-3">
	<h1 style:display="none">Settings</h1>
	<h2 class="border-bottom pb-2">Ôn tập</h2>
	<form class="container-fluid">
		<div class="row mb-1">
			<label for="desired_retention" class="fw-bold col-form-label col-3 text-end">Xác xuất hồi tưởng kì vọng</label>
			<div class="d-flex align-item-center col-1 ps-0">
				<input
					oninput={() => setSetting("desiredRetention", desiredRetention)}
					bind:value={desiredRetention}
					min="10"
					max="95"
					type="number"
					id="desired_retention"
					class="form-control-sm form-control"
				/>
			</div>
		</div>
		<div class="row mb-1">
			<label for="reviewOrder" class="fw-bold col-form-label col-3 text-end">Thứ tự ôn tập:</label>
			<div class="d-flex align-item-center col-3 ps-0">
				<select
					onchange={() => setSetting("reviewOrder", selectedReviewOrder)}
					bind:value={selectedReviewOrder}
					class="form-select form-select-sm"
					id="reviewOrder"
				>
					{#each reviewOrder as i}
						<option selected={i.id === currentSettings.reviewOrder} value={i.id}>{i.label}</option>
					{/each}
				</select>
			</div>
		</div>
	</form>
</div>

<style>
</style>
