<script>
	import { LineChart, Tooltip } from "layerchart";
	import { curveMonotoneX, curveCatmullRom } from "d3-shape";
	import { getRetrievability } from "$lib/fsrs.svelte.js";
	import { format } from "@layerstack/utils";
	import { getCurrentSettings } from "$lib/settings.svelte";
	const settings = getCurrentSettings();
	const dr = $derived(settings.desiredRetention);
	const { currentTest } = $props();
	const { stability } = currentTest.knowledge;
	const formatDateVi = (date) => {
		return date.toLocaleDateString("vi-VN", {
			day: "numeric",
			month: "short",
		});
	};
	const minInterval = 3 * 30 * 24 * 60 * 60 * 1000;
	const lineData = $derived.by(() => {
		const ret = [];
		let i = 0;
		let date = null;
		let s = null;
		let curRev = null;
		let nextRev = null;
		let nextRevDate = null;
		let newCurveBaseDate = null;
		let length = currentTest.knowledge.reviewHistory.length;
		let obj = null;
		while (i !== length) {
			// cap nhat state moi
			curRev = currentTest.knowledge.reviewHistory[i];
			newCurveBaseDate = curRev.date;
			date = curRev.date;
			if (i === length - 1) {
				nextRev = null;
				nextRevDate = currentTest.knowledge.due;
				if (nextRevDate.getTime() - newCurveBaseDate.getTime() < minInterval) {
					nextRevDate = new Date(newCurveBaseDate.getTime() + minInterval);
				}
				s = currentTest.knowledge.stability;
			} else {
				nextRev = currentTest.knowledge.reviewHistory[i + 1];
				nextRevDate = nextRev.date;
				s = nextRev.prevStability;
			}

			// plot until next review, start from 100%
			while (date < nextRevDate) {
				ret.push({
					date: new Date(date.getTime()),
					value: getRetrievability(s, newCurveBaseDate.getTime(), date.getTime()) * 100,
				});
				date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
			}

			i++;
		}
		return ret;
	});

	let yValues = $derived(lineData.map((d) => d.value));
	let yMin = $derived(Math.min(...yValues));
	let yMax = 100;

	// Add small padding (optional)
	let yDomain = $derived([Math.floor(yMin - 2), yMax]);
	let annotations = $derived([
		{
			type: "line",
			y: dr,
			label: "DR",
			labelXOffset: 4,
			labelYOffset: 2,
			props: {
				label: { class: "fill-danger" },
				line: { class: "[stroke-dasharray:2,2] stroke-danger" },
			},
		},
	]);
</script>

<div class="chart mx-auto rounded-sm border p-4">
	<LineChart
		data={lineData}
		{yDomain}
		yNice={false}
		x="date"
		series={[{ key: "value", label: "Độ ổn định", color: "var(--color-primary)" }]}
		props={{
			xAxis: { format: formatDateVi },
			spline: { curve: curveMonotoneX },
		}}
		{annotations}
		renderContext={"svg"}
	>
		{#snippet tooltip({ context })}
			<Tooltip.Root
				x={context.padding.left}
				y="data"
				anchor="right"
				contained={false}
				class="mt-[2px] rounded-sm border border-primary bg-surface-100 px-1 py-[2px] text-[10px] font-semibold whitespace-nowrap text-primary"
			>
				{#snippet children({ data })}
					{"R: " + data.value.toFixed(2) + "%"}
				{/snippet}
			</Tooltip.Root>

			<Tooltip.Root
				x="data"
				y={context.height}
				anchor="top"
				class="mt-[2px] rounded-sm border border-primary bg-surface-100 px-2 py-[2px] text-[10px] font-semibold whitespace-nowrap text-primary"
				contained={false}
			>
				{#snippet children({ data })}
					{data.date.toLocaleDateString("vi-VN")}
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</LineChart>
</div>

<style>
	div.chart {
		min-height: 450px;
		height: 450px;
		width: 100%;
	}
</style>
