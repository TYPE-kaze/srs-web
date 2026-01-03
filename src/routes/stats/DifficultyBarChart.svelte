<script>
	import { PieChart } from "layerchart";

	const { kArr } = $props();
	const total = $derived(kArr.length);
	const easyNum = $derived(
		kArr.reduce((a, k) => {
			if (k.difficulty <= 4) {
				return a + 1;
			} else return a;
		}, 0),
	);

	const mediumNum = $derived(
		kArr.reduce((a, k) => {
			if (k.difficulty > 4 && k.difficulty <= 8) {
				return a + 1;
			} else return a;
		}, 0),
	);

	const hardNum = $derived(
		kArr.reduce((a, k) => {
			if (k.difficulty > 8) {
				return a + 1;
			} else return a;
		}, 0),
	);

	const data = $derived([
		{
			customClass: "easy",
			difficulty: "Dễ (dưới 4)",
			kNum: easyNum,
			color: "var(--color-success)",
			per: (easyNum / total) * 100,
		},
		{
			customClass: "medium",
			difficulty: "Trung bình (4-8)",
			kNum: mediumNum,
			color: "var(--color-warning)",
			per: (mediumNum / total) * 100,
		},
		{
			customClass: "hard",
			difficulty: "Khó (trên 8)",
			kNum: hardNum,
			color: "var(--color-danger)",
			per: (hardNum / total) * 100,
		},
	]);

	const listing = $derived([]);
</script>

<div class="container-fluid bg-opacity-10 border-secondary-subtle bg-body-tertiary rounded border shadow-sm">
	<h3 class="border-bottom border-secondary py-2">Phân bố độ khó (thang 10)</h3>
	<div class="row">
		<div class="chart col-5 rounded-sm p-4">
			<PieChart {data} key="difficulty" value="kNum" c="color" renderContext={"svg"} />
		</div>
		<div class="col-7 mt-5">
			<div class="container-fluid">
				<div class="row">
					<div class="col-6">Tổng cộng</div>
					<div class="col-2">{total}</div>
				</div>
				{#each data as item}
					<div class="row">
						<div class={["col-6", item.customClass]}>{item.difficulty}:</div>
						<div class={["col-2"]}>{item.kNum}</div>
						<div class={["col-4"]}>{item.per.toFixed(1)}%</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	div.chart {
		height: 250px;
	}
	.hard::before {
		content: "";
		display: inline-block;
		width: 0.5rem;
		height: 0.5rem;
		margin-right: 0.375rem;
		border-radius: 50%;
		background-color: var(--bs-danger);
	}
	.medium::before {
		content: "";
		display: inline-block;
		width: 0.5rem;
		height: 0.5rem;
		margin-right: 0.375rem;
		border-radius: 50%;
		background-color: var(--bs-warning);
	}
	.easy::before {
		content: "";
		display: inline-block;
		width: 0.5rem;
		height: 0.5rem;
		margin-right: 0.375rem;
		border-radius: 50%;
		background-color: var(--bs-success);
	}
</style>
