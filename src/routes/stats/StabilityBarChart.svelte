<script>
	import { PieChart } from "layerchart";

	const { kArr } = $props();
	const total = $derived(kArr.length);
	const levelOneNum = $derived(
		kArr.reduce((a, k) => {
			if (k.stability <= 7) {
				return a + 1;
			} else return a;
		}, 0),
	);

	const levelTwoNum = $derived(
		kArr.reduce((a, k) => {
			if (k.stability > 7 && k.stability <= 30) {
				return a + 1;
			} else return a;
		}, 0),
	);

	const levelThreeNum = $derived(
		kArr.reduce((a, k) => {
			if (k.stability > 30 && k.stability <= 90) {
				return a + 1;
			} else return a;
		}, 0),
	);

	const levelFourNum = $derived(
		kArr.reduce((a, k) => {
			if (k.stability > 90 && k.stability <= 365) {
				return a + 1;
			} else return a;
		}, 0),
	);

	const levelFiveNum = $derived(
		kArr.reduce((a, k) => {
			if (k.stability > 365) {
				return a + 1;
			} else return a;
		}, 0),
	);

	const data = $derived([
		{ customClass: "one", stability: "dưới 7", kNum: levelOneNum, per: (levelOneNum / total) * 100 },
		{ customClass: "two", stability: "từ 7 đến 30", kNum: levelTwoNum, per: (levelTwoNum / total) * 100 },
		{ customClass: "three", stability: "từ 30 đến 90", kNum: levelThreeNum, per: (levelThreeNum / total) * 101 },
		{ customClass: "four", stability: "từ 90 đến 1 năm", kNum: levelFourNum, per: (levelFourNum / total) * 100 },
		{ customClass: "five", stability: "trên 1 năm", kNum: levelFiveNum, per: (levelFiveNum / total) * 100 },
	]);
</script>

<div class="container-fluid bg-opacity-10 border-secondary-subtle bg-body-tertiary rounded border shadow-sm">
	<h3 class="border-bottom border-secondary py-2">Phân bố độ ổn định (số ngày)</h3>
	<div class="row">
		<div class="chart col-5 rounded-sm p-4">
			<PieChart {data} key="stability" value="kNum" renderContext={"svg"} />
		</div>
		<div class="col-7 mt-4">
			<div class="container-fluid">
				<div class="row">
					<div class="col-6">Tổng cộng</div>
					<div class="col-2">{total}</div>
				</div>
				{#each data as item}
					<div class="row">
						<div class={["col-6", item.customClass]}>{item.stability}:</div>
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
	.one::before {
		content: "";
		display: inline-block;
		width: 0.5rem;
		height: 0.5rem;
		margin-right: 0.375rem;
		border-radius: 50%;
		background-color: #2b7fff;
	}
	.two::before {
		content: "";
		display: inline-block;
		width: 0.5rem;
		height: 0.5rem;
		margin-right: 0.375rem;
		border-radius: 50%;
		background-color: #f66500;
	}
	.three::before {
		content: "";
		display: inline-block;
		width: 0.5rem;
		height: 0.5rem;
		margin-right: 0.375rem;
		border-radius: 50%;
		background-color: #00a9fd;
	}
	.four::before {
		content: "";
		display: inline-block;
		width: 0.5rem;
		height: 0.5rem;
		margin-right: 0.375rem;
		border-radius: 50%;
		background-color: #009966;
	}
	.five::before {
		content: "";
		display: inline-block;
		width: 0.5rem;
		height: 0.5rem;
		margin-right: 0.375rem;
		border-radius: 50%;
		background-color: #ffbf00;
	}
</style>
