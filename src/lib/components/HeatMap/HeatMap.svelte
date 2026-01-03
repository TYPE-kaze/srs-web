<script lang="ts">
	import { getCalendar, getColor } from "./utils.js";
	import type { Props } from "./utils.js";

	let {
		data,
		onclick,
		onmouseout,
		onmouseover,
		colors = ["#eff2f5", "#aceebb", "#4ac26b", "#2da44e", "#116329"],
		className = "Heatmap",
		year = new Date().getFullYear(),
		lday = true,
		lmonth = true,
		...theRest
	}: Props = $props();

	// --

	let { max, calendar } = $derived(getCalendar(data, year));
</script>

<table {...theRest} class={className} style="font-size:1em">
	{#if lmonth}
		<thead>
			<tr style="font-size:0.75em">
				<td style="padding-bottom:0.5em">‎</td>
				<td colspan="5">Thg1</td>
				<td colspan="4">Thg2</td>
				<td colspan="4">Thg3</td>
				<td colspan="5">Thg4</td>
				<td colspan="4">Thg5</td>
				<td colspan="4">Thg6</td>
				<td colspan="5">Thg7</td>
				<td colspan="4">Thg8</td>
				<td colspan="4">Thg9</td>
				<td colspan="5">Thg10</td>
				<td colspan="4">Thg11</td>
				<td colspan="4">Thg12</td>
			</tr>
		</thead>
	{/if}
	<tbody>
		{#each calendar as w, i}
			<tr>
				{#if lday}
					<td style="padding-right:0.5em;font-size:0.75em">
						{["Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "CN"][i]}
					</td>
				{/if}
				{#each w as d}
					{#if d}
						<td
							style={`width:1em;height:1em;background:${getColor(colors, max, d.value)}`}
							data-date={d.date}
							data-value={d.value}
							data-bs-title={`Ngày ${d.date.split("-")[2]}: ${d.value} ôn tập`}
							data-bs-toggle="tooltip"
							{onclick}
							{onmouseout}
							{onmouseover}
						/>
					{:else}
						<td />
					{/if}
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
