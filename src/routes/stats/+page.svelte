<script>
	import { LineChart } from "layerchart";
	import Knowledge from "$lib/models/Knowledge.js";
	import TodayListing from "./TodayListing.svelte";
	import FutureDueChart from "./FutureDueChart.svelte";
	import PastReviewChart from "./PastReviewChart.svelte";
	import HeatMapChart from "$lib/components/HeatMapChart.svelte";
	import DifficultyBarChart from "./DifficultyBarChart.svelte";
	import StabilityBarChart from "./StabilityBarChart.svelte";
	import Masonry from "$lib/components/Masonry.svelte";

	let kArr = $state([]);
	let revArr = $derived.by(() => {
		const ret = [];
		for (const k of kArr) {
			ret.push(...k.reviewHistory);
		}
		return ret;
	});
	const main = (async function () {
		kArr = await Knowledge.getAll();
	})();
</script>

{#snippet heatMapHeader()}
	<h3 class="border-bottom mt-2 border-secondary pb-2">Biểu đồ nhiệt</h3>
{/snippet}

<div class="container-fluid p-3">
	{#await main then res}
		<Masonry stretchFirst={false} gridGap={"0.75rem"} colWidth={"minmax(Min(45%, 100%), 1fr)"}>
			<TodayListing {revArr} />
			<FutureDueChart {kArr} />
			<PastReviewChart {revArr} />
			<HeatMapChart header={heatMapHeader} {revArr} />
			<DifficultyBarChart {kArr} />
			<StabilityBarChart {kArr} />
		</Masonry>
	{/await}
</div>
