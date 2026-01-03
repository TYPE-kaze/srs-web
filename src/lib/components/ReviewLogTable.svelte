<script>
	const { reviewLogs, currentTest, locale, dateStrOptions } = $props();
	function format(date, grade, prevStability, prevDifficulty, interval) {
		date = date.toLocaleDateString(locale, dateStrOptions);
		switch (grade) {
			case "again":
				grade = "Không nhớ";
				break;
			case "hard":
				grade = "Nhớ nhưng khó";
				break;
			case "good":
				grade = "Có nhớ";
				break;
			case "easy":
				grade = "Rất dễ nhớ";
				break;
		}

		let newStability = prevStability.toFixed(0);
		let newDifficulty = prevDifficulty.toFixed(1);
		return { date, grade, newStability, newDifficulty };
	}
	const renderData = $derived.by(() => {
		const ret = [];
		for (let i = 0; i < reviewLogs.length - 1; i++) {
			let { date, grade } = reviewLogs[i];
			let { interval, prevStability, prevDifficulty } = reviewLogs[i + 1];
			ret.push(format(date, grade, prevStability, prevDifficulty, interval));
		}
		let { date, grade } = reviewLogs[reviewLogs.length - 1];
		ret.push(
			format(
				date,
				grade,
				currentTest.knowledge?.stability,
				currentTest.knowledge?.difficulty,
				currentTest.knowledge?.interval,
			),
		);
		return ret;
	});
</script>

<table class="table-bordered border-dark mt-3 table">
	<thead>
		<tr>
			<th class="text-center" scope="col">#</th>
			<th scope="col">Ngày ôn</th>
			<th scope="col">Chấm điểm</th>
			<th scope="col">Độ ổn định mới</th>
			<th scope="col">Độ khó mới</th>
		</tr>
	</thead>
	<tbody>
		{#each renderData as item, index}
			<tr>
				<th class="text-center" scope="row">{index}</th>
				<td>{item.date}</td>
				<td>{item.grade}</td>
				<td>{item.newStability}</td>
				<td>{item.newDifficulty}</td>
			</tr>
		{/each}
	</tbody>
</table>
