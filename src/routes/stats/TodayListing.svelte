<script>
	const { revArr } = $props();

	const today = new Date();
	function isToday(date) {
		return (
			date.getFullYear() === today.getFullYear() &&
			date.getMonth() === today.getMonth() &&
			date.getDate() === today.getDate()
		);
	}

	const listing = $derived.by(() => {
		const ret = [
			{ label: "Số kiến thức đã ôn", value: 0 },
			{ label: "Có nhớ", value: 0 },
			{ label: "Quên", value: 0 },
		];

		for (const rev of revArr) {
			// review today
			if (isToday(rev.date)) {
				ret[0].value++;
				if (rev.grade === "good") {
					ret[1].value++;
				} else if (rev.grade === "again") {
					ret[2].value++;
				}
			}
		}
		return ret;
	});
</script>

<div class="container-fluid bg-opacity-10 border-secondary-subtle bg-body-tertiary rounded border shadow-sm">
	<h3 class="border-bottom border-secondary py-2">Hôm nay</h3>
	{#each listing as item}
		<div class="row">
			<div class="fw-bold col-5 p-0 text-end">{item.label}:</div>
			<div class="value col-7 ps-2">{item.value}</div>
		</div>
	{/each}
</div>
