<script>
	import Heatmap from "$lib/components/HeatMap";
	import { browser } from "$app/environment";
	const { revArr, header } = $props();
	let bootstrap;
	let heatmap;

	function reloadTooltip() {
		// maybe excuse cell that has value of 0
		const tooltipTriggerList = heatmap.querySelectorAll('[data-bs-toggle="tooltip"]');
		const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
	}

	async function setup(el) {
		bootstrap = await import("bootstrap");
		heatmap = el;
		reloadTooltip();
	}

	function formatLocalYYYYMMDD(date) {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	}

	let year = $state(new Date().getFullYear());
	$effect(() => {
		year;
		heatmap && reloadTooltip();
	});
	let data = $derived.by(() => {
		const ret = {};
		for (const rev of revArr) {
			if (rev.date.getFullYear() === year) {
				let key = formatLocalYYYYMMDD(rev.date);
				ret[key] = ret[key] ? ret[key] + 1 : 1;
			}
		}
		return ret;
	});
</script>

<div class="heatmap container-fluid bg-opacity-10 border-secondary-subtle bg-body-tertiary rounded pb-3 shadow-sm border">
	{@render header?.()}
	<div class="d-flex">
		<div class="mx-auto">
			<button onclick={() => year--} class="btn">
				<i class="bi bi-caret-left-square"><i><span style:display="none">previous year</span></i></i>
			</button>
			<span>{year}</span>
			<button onclick={() => year++} class="btn">
				<i class="bi bi-caret-right-square"></i>
				<span style:display="none">next year</span>
			</button>
		</div>
	</div>
	<Heatmap {@attach setup} {data} {year} />
</div>

<style>
	div.heatmap {
		font-size: 0.8em;
	}
	button {
		border: none;
	}
</style>
