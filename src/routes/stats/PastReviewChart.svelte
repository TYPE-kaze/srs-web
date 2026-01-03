<script>
	import { timeDay } from "d3-time";
	import { BarChart } from "layerchart";
	const { revArr } = $props();

	function fromDateToDateID(date) {
		return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
	}

	const range = [
		{ id: 1, value: 7, label: "7 ngày" },
		{ id: 2, value: 30, label: "30 ngày" },
		{ id: 3, value: 90, label: "90 ngày" },
		{ id: 4, value: 365, label: "1 năm" },
	];
	let numOfDay = $state(7);

	const today = new Date();
	const mapping = {};
	const data = $derived.by(() => {
		const ret = [];
		for (let i = 0; i < numOfDay; i++) {
			const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
			const obj = { Ngày: date, "Số ôn tập": 0 };
			mapping[fromDateToDateID(date)] = obj;
			ret.push(obj);
		}
		ret.reverse();

		for (const r of revArr) {
			const key = fromDateToDateID(r.date);
			if (mapping[key]) {
				mapping[key]["Số ôn tập"]++;
			}
		}
		return ret;
	});

	const listing = $derived.by(() => {
		const ret = [];
		let value = null;

		let total = data.reduce((a, d) => a + d["Số ôn tập"], 0);
		value = `${total} ôn tập`;
		ret.push({ id: "total", label: "Tổng cộng", value });

		value = total / numOfDay;

		value = `${value.toFixed(2)} ôt/ngày`;
		ret.push({ id: "average", label: "Trung bình", value });

		return ret;
	});

	const formatDateVi = $derived.by(() => {
		if (numOfDay === 7) {
			return (date) => {
				return date.toLocaleDateString("vi-VN", {
					day: "numeric",
					month: "numeric",
				});
			};
		} else {
			return () => "";
		}
	});
</script>

<div class="container-fluid bg-opacity-10 border-secondary-subtle bg-body-tertiary rounded border shadow-sm">
	<div class="d-flex border-bottom border-secondary py-2">
		<h3 class="m-0">Đã ôn tập</h3>
		<select bind:value={numOfDay} class="form-select form-select-sm ms-auto" aria-label="Default select example">
			{#each range as r}
				<option value={r.value}>
					{r.label}
				</option>
			{/each}
		</select>
	</div>
	<div class="chart rounded-sm p-4">
		<BarChart
			props={{
				xAxis: { format: formatDateVi },
			}}
			{data}
			x="Ngày"
			y="Số ôn tập"
			renderContext={"svg"}
		/>
	</div>
	<div class="container-fluid mt-2">
		{#each listing as item}
			<div class="row">
				<div class="fw-bold col-5 p-0 text-end">{item.label}:</div>
				<div class="value col-7 ps-2">{item.value}</div>
			</div>
		{/each}
	</div>
</div>

<style>
	div.chart {
		height: 450px;
	}

	select {
		max-width: 100px;
	}
</style>
