<script>
	import { LineChart } from "layerchart";
	const { currentTest } = $props();
	const data = $derived.by(() => {
		const ret = [];
		const hist = currentTest.knowledge.reviewHistory;
		// in this context, learn and review is the same because each spawn a new interval
		function helper(n_th, interval) {
			ret.push({ "Lần ôn thứ mấy": n_th, "Chu kì ôn mới": interval });
		}
		let i = 0;
		for (; i < hist.length - 1; i++) {
			helper(i, hist[i + 1].interval);
		}
		helper(i, currentTest.knowledge.interval || currentTest.knowledge.stability);
		return ret;
	});
</script>

<div class="chart rounded-sm border p-4">
	<LineChart
		props={{
			xAxis: {
				ticks: data.length,
				format: (d) => d.toString(),
				tickValues: data.map((d) => d["Lần ôn thứ mấy"]),
			},
			tooltip: {
				format: (d) => "hello",
			},
		}}
		}
		{data}
		x="Lần ôn thứ mấy"
		y="Chu kì ôn mới"
		renderContext={"svg"}
	/>
</div>

<style>
	div.chart {
		height: 400px;
	}
</style>
