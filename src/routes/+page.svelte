<script>
	import HeatMapChart from "$lib/components/HeatMapChart.svelte";
	import Knowledge from "$lib/models/Knowledge";
	import SimpleTest from "$lib/models/SimpleTest";
	import BookPanel from "./BookPanel.svelte";

	let kArr = $state([]);
	let revArr = $derived.by(() => {
		const ret = [];
		for (const k of kArr) {
			ret.push(...k.reviewHistory);
		}
		return ret;
	});

	let tDue = $state([]);
	let remainingReview = $derived(tDue.length);
	const main = (async () => {
		const ret = await Promise.all([Knowledge.getAll(), SimpleTest.getAllDue()]);
		kArr = ret[0];
		tDue = ret[1];
	})();
</script>

{#await main then res}
	<div class="container mt-2 mb-2">
		<div class="row d-flex align-items-center justify-content-center">
			<div
				class="flex-column d-flex align-items-center justify-content-center main col container-fluid bg-opacity-10 border-secondary-subtle bg-body-tertiary rounded border border-2 pb-3 shadow-sm"
			>
				<div class="row">
					<div class="col fs-2">
						Số lượng ôn tập còn lại:
						<span class="remaining-card">
							{remainingReview}
						</span>
					</div>
				</div>
				<div class="row pt-2">
					<div class="col">
						<a href="/review" type="button" class="btn btn-primary">Bắt đầu</a>
					</div>
				</div>
			</div>
		</div>
		<div class="row mt-3">
			<div class="col-5 p-0 pe-2">
				<BookPanel />
			</div>
			<div class="col-7 p-0">
				<HeatMapChart {revArr} />
			</div>
		</div>
	</div>
{:catch err}
	<h1>{err}</h1>
{/await}

<style>
	.main {
		min-height: 300px;
	}
	.remaining-card {
		color: #16a34a;
	}
</style>
