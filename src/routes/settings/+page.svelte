<script>
	import { resetSettings, getCurrentSettings, setSetting } from "$lib/settings.svelte.js";
	import { toast } from "svelte-sonner";
	const currentSettings = getCurrentSettings();
	const reviewOrder = [
		{ id: "random", label: "Ngẫu nhiên" },
		{ id: "addedDateDesc", label: "Ngày thêm mới nhất trước" },
		{ id: "addedDateAsc", label: "Ngày thêm cũ nhất trước" },
		{ id: "retrievability", label: "Xác xuất nhớ thấp nhất trước" },
	];

	const easyDayList = [
		{ label: "Thứ 2", id: 1 },
		{ label: "Thứ 3", id: 2 },
		{ label: "Thứ 4", id: 3 },
		{ label: "Thứ 5", id: 4 },
		{ label: "Thứ 6", id: 5 },
		{ label: "Thứ 7", id: 6 },
		{ label: "Chủ nhật", id: 0 },
	];
	let showKey = $state(false);
	let apiKey = $derived(currentSettings.geminiKey);
	let selectedReviewOrder = $derived(currentSettings.reviewOrder);
	let desiredRetention = $derived(currentSettings.desiredRetention);
	let maxInterval = $derived(currentSettings.maxInterval);
	let easyDays = $derived(currentSettings.easyDays ?? {});
</script>

<div class="container mt-3">
	<h1 style:display="none">Settings</h1>
	<form class="container-fluid">
		<h2 class="border-bottom pb-2">API</h2>
		<div class="row mb-3">
			<label for="apiKeyInput" class="fw-bold col-form-label col-3 text-end">Google Gemini API Key</label>
			<div class="col-4">
				<div class="input-group">
					<input
						onchange={() => setSetting("geminiKey", apiKey)}
						bind:value={apiKey}
						type={showKey ? "text" : "password"}
						id="apiKeyInput"
						class="form-control"
						placeholder="Chưa có khóa. Điền vào đây..."
						spellcheck="false"
					/>

					<button
						class="btn btn-outline-secondary"
						type="button"
						onclick={() => (showKey = !showKey)}
						aria-label={showKey ? "Hide API Key" : "Show API Key"}
					>
						{#if showKey}
							Ẩn
						{:else}
							Hiện
						{/if}
					</button>
				</div>
			</div>
		</div>
		<h2 class="border-bottom pb-2">Ôn tập</h2>
		<div class="row mb-1">
			<label for="max-interval" class="fw-bold col-form-label col-3 text-end">Chu kì ôn tập tối đa:</label>
			<div class="d-flex align-item-center col-2 ps-0">
				<input
					oninput={() => setSetting("maxInterval", maxInterval)}
					bind:value={maxInterval}
					min="10"
					max="36500"
					type="number"
					id="max-interval"
					class="form-control-sm form-control"
				/>
			</div>
		</div>
		<div class="row mb-1">
			<label for="desired_retention" class="fw-bold col-form-label col-3 text-end">Xác xuất hồi tưởng kì vọng:</label>
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
		<div class="row mb-3">
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
		<h2 class="border-bottom pb-2">Ngày nghỉ</h2>
		<div class="row mb-1">
			<label for="" class="fw-bold col-form-label col-2 text-end"></label>
			<div class="row col-6 p-0">
				<div class="col-4 ps-0 text-start">Tối thiểu</div>
				<div class="col-4 text-center">Giảm thiểu</div>
				<div class="col-4 pe-0 text-end">Bình thường</div>
			</div>
		</div>
		{#each easyDayList as d}
			<div class="row mb-1">
				<label for="easy-day-{d.id}" class="fw-bold col-form-label col-2 text-end">{d.label}</label>
				<div class="d-flex align-item-center col-6 ps-0">
					<input
						onchange={() => setSetting("easyDays", easyDays)}
						bind:value={easyDays[d.id]}
						type="range"
						min="0.1"
						step="0.45"
						max="1"
						class="form-range my-auto"
						id="easy-day-{d.id}"
					/>
				</div>
			</div>
		{/each}
		<button
			onclick={async () => {
				await resetSettings();
				toast.success("Đặt lại thành công");
			}}
			type="button"
			class="btn btn-secondary mt-3 mb-3"
		>
			Đặt lại mặc định
		</button>
	</form>
</div>

<style>
</style>
