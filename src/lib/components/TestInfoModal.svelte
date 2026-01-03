<script>
	import ReviewLogTable from "$lib/components/ReviewLogTable.svelte";
	import IntervalChart from "$lib/components/IntervalChart.svelte";
	import ForgettingCurveChart from "$lib/components/ForgettingCurveChart.svelte";
	const { currentTest } = $props();
	const k = $derived(currentTest.knowledge);
	const dateStrOptions = { year: "numeric", month: "long", day: "numeric" };
	const locale = "vi-VN";
	const listing = $derived.by(() => {
		const ret = [];
		let value = "";

		value = k.firstReviewDate.toLocaleDateString(locale, dateStrOptions);
		ret.push({ id: "firstReviewDate", label: "Ngày học", value });

		value = k.due.toLocaleDateString(locale, dateStrOptions);
		ret.push({ id: "due", label: "Ngày ôn tiếp theo", value });

		value = k.lastReviewDate.toLocaleDateString(locale, dateStrOptions);
		ret.push({ id: "lastReviewDate", label: "Ngày ôn gần nhất", value });

		value = k.difficulty.toFixed(1) + " (thang 0-10)";
		ret.push({ id: "difficulty", label: "Độ khó", value });

		value = k.stability.toFixed(0) + " ngày";
		ret.push({ id: "stability", label: "Độ ổn định", value });

		value = (k.retrievability * 100).toFixed(2) + "%";
		ret.push({ id: "retrievability", label: "Xác xuất hồi tưởng", value });

		return ret;
	});

	const testListing = $derived.by(() => {
		const ret = [];
		let value = "";
		value = currentTest.addedDate.toLocaleDateString(locale, dateStrOptions);
		ret.push({ id: "addedDate", label: "Ngày thêm", value });
		return ret;
	});

	const reviewLogs = $derived(k.reviewHistory);

	let modal;
	async function setup(el) {
		const bootstrap = await import("bootstrap");
		modal = new bootstrap.Modal(el);
	}

	export function show() {
		modal?.show();
	}
</script>

<div {@attach setup} class="modal" tabindex="-1" aria-labelledby="test info" aria-hidden="true">
	<div class="modal-dialog modal-xl">
		{#if currentTest}
			<div class="modal-content">
				<div class="modal-body">
					<ul class="nav nav-tabs" id="myTab" role="tablist">
						<li class="nav-item" role="presentation">
							<button
								class="nav-link active"
								id="home-tab"
								data-bs-toggle="tab"
								data-bs-target="#home-tab-pane"
								type="button"
								role="tab"
								aria-controls="home-tab-pane"
								aria-selected="true"
							>
								Trạng thái ghi nhớ
							</button>
						</li>
						<li class="nav-item" role="presentation">
							<button
								class="nav-link"
								id="profile-tab"
								data-bs-toggle="tab"
								data-bs-target="#profile-tab-pane"
								type="button"
								role="tab"
								aria-controls="profile-tab-pane"
								aria-selected="false"
							>
								Bài kiểm tra
							</button>
						</li>
						<button
							type="button"
							class="btn-close my-auto ms-auto"
							data-bs-dismiss="modal"
							aria-label="Close"
						></button>
					</ul>
					<div class="tab-content" id="myTabContent">
						<div
							class="tab-pane show active"
							id="home-tab-pane"
							role="tabpanel"
							aria-labelledby="home-tab"
							tabindex="0"
						>
							<h3 class="mt-2">Tổng quan</h3>
							<div class="container-fluid">
								{#each listing as item (item.id)}
									<div class="row">
										<div class="fw-bold col-3 text-end">{item.label}:</div>
										<div class="value col-9">{item.value}</div>
									</div>
								{/each}
							</div>
							<div class="mt-2">
								<h3>Lịch sử ôn tập</h3>
								<ReviewLogTable {locale} {dateStrOptions} {reviewLogs} {currentTest} />
							</div>
							<div class="mt-2">
								<h3>Đường cong quên lãng</h3>
								<ForgettingCurveChart {currentTest} />
							</div>
							<div class="mt-2">
								<h3>Chu kì ôn tập sau mỗi lần ôn</h3>
								<IntervalChart {currentTest} />
							</div>
						</div>
						<div class="tab-pane" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
							<div class="container-fluid mt-3">
								{#each testListing as item (item.id)}
									<div class="row">
										<div class="fw-bold col-3 text-end">{item.label}:</div>
										<div class="value col-9">{item.value}</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="modal-body">...</div>
		{/if}
	</div>
</div>

<style>
	div.row div.value {
		padding-left: 0;
	}
</style>
