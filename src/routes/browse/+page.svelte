<script>
	import { onMount, getContext } from "svelte";
	import { browser } from "$app/environment";
	import { toast } from "svelte-sonner";
	import SimpleTest from "$lib/models/SimpleTest";
	import Card from "$lib/components/Card.svelte";
	import ImageCard from "$lib/components/ImageCard.svelte";
	import Masonry from "$lib/components/Masonry.svelte";
	import StatusMenu from "./StatusMenu.svelte";
	import ImageFilterButton from "./ImageFilterButton.svelte";
	import AudioFilterButton from "./AudioFilterButton.svelte";
	import EmptySpace from "./EmptySpace.svelte";
	import TestInfoModal from "$lib/components/TestInfoModal.svelte";
	import StabilityMenu from "./StabilityMenu.svelte";
	import DifficultyMenu from "./DifficultyMenu.svelte";
	import SortMenu from "./SortMenu.svelte";
	import EditCardModal from "$lib/components/EditCardModal.svelte";
	import QAForm from "$lib/components/QAForm.svelte";
	import DeleteConfirmModal from "$lib/components/DeleteConfirmModal.svelte";

	let qaform;
	let editModal;
	let currentTest = $state();
	const infoModalId = "browse-info-model";
	const { state: s, setSearchTermState } = getContext("nav");
	setSearchTermState("");
	const filter = $state({
		today: {
			needReview: false,
			reviewed: false,
			added: false,
			good: false,
			again: false,
		},
		stability: {
			under7: false,
			from7to30: false,
			from30to90: false,
			from90to365: false,
			over365: false,
		},
		difficulty: {
			easy: false,
			medium: false,
			hard: false,
		},
		hasImage: false,
		hasAudio: false,
	});

	const sort = $state({
		addedDate: { on: true, direction: "down" },
		difficulty: { on: false, direction: "down" },
		stability: { on: false, direction: "down" },
		retrievability: { on: false, direction: "down" },
	});

	const currentSort = $derived.by(() => {
		for (const key in sort) {
			if (sort[key].on) return { name: key, direction: sort[key].direction };
		}
	});

	function sortHandler(key) {
		for (const k in sort) {
			if (k === key) {
				if (sort[k].on) {
					sort[k].direction = sort[k].direction === "up" ? "down" : "up";
					return;
				} else {
					sort[k].on = true;
				}
			} else {
				sort[k].on = false;
			}
		}
	}

	function toogleDifficulty(key) {
		for (const k in filter.difficulty) {
			if (k === key) {
				filter.difficulty[k] = !filter.difficulty[k];
			} else {
				filter.difficulty[k] = false;
			}
		}
	}

	function toogleStability(key) {
		for (const k in filter.stability) {
			if (k === key) {
				filter.stability[k] = !filter.stability[k];
			} else {
				filter.stability[k] = false;
			}
		}
	}

	function toogleReviewedAgainToday() {
		filter.today.again = !filter.today.again;
	}

	function toogleReviewedGoodToday() {
		filter.today.good = !filter.today.good;
	}

	function toogleAddedToday() {
		filter.today.added = !filter.today.added;
	}

	function toggleReviewedTodayStateFilter() {
		filter.today.reviewed = !filter.today.reviewed;
	}

	function toggleNeedReviewStateFilter() {
		filter.today.needReview = !filter.today.needReview;
	}

	function isToday(date) {
		const today = new Date();
		return (
			date.getFullYear() === today.getFullYear() &&
			date.getMonth() === today.getMonth() &&
			date.getDate() === today.getDate()
		);
	}

	function filterReviewedTodayTests(arr) {
		const d1 = new Date();
		return arr.filter((t) => {
			const d2 = t.knowledge.lastReviewDate;
			return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
		});
	}

	let tests = $state([]);
	let refreshLayout = $state();
	let filteredCardData = $derived.by(() => {
		let filteredTests = tests;
		if (s.browseSearchTerm && s.browseSearchTerm.length !== 0) {
			filteredTests = filteredTests.filter((t) => {
				return t.question.toLowerCase().includes(s.browseSearchTerm.toLowerCase());
			});
		}

		if (filter.difficulty.easy) {
			filteredTests = filteredTests.filter((t) => {
				const k = t.knowledge;
				return k.difficulty <= 4;
			});
		}

		if (filter.difficulty.medium) {
			filteredTests = filteredTests.filter((t) => {
				const k = t.knowledge;
				return k.difficulty > 4 && k.difficulty <= 8;
			});
		}

		if (filter.difficulty.hard) {
			filteredTests = filteredTests.filter((t) => {
				const k = t.knowledge;
				return k.difficulty > 8;
			});
		}

		if (filter.stability.under7) {
			filteredTests = filteredTests.filter((t) => {
				const k = t.knowledge;
				return k.stability <= 7;
			});
		}

		if (filter.stability.from7to30) {
			filteredTests = filteredTests.filter((t) => {
				const k = t.knowledge;
				return k.stability > 7 && k.stability <= 30;
			});
		}

		if (filter.stability.from30to90) {
			filteredTests = filteredTests.filter((t) => {
				const k = t.knowledge;
				return k.stability > 30 && k.stability <= 90;
			});
		}

		if (filter.stability.from90to365) {
			filteredTests = filteredTests.filter((t) => {
				const k = t.knowledge;
				return k.stability > 90 && k.stability <= 365;
			});
		}

		if (filter.stability.over365) {
			filteredTests = filteredTests.filter((t) => {
				const k = t.knowledge;
				return k.stability > 365;
			});
		}

		if (filter.today.needReview) {
			const todayStart = new Date();
			todayStart.setHours(23, 52, 57);
			filteredTests = filteredTests.filter((t) => {
				return t.knowledge.due.getTime() < todayStart.getTime();
			});
		}

		if (filter.today.reviewed) {
			filteredTests = filterReviewedTodayTests(filteredTests);
		}

		if (filter.today.good) {
			filteredTests = filterReviewedTodayTests(filteredTests);
			filteredTests = filteredTests.filter((t) => {
				const rev = t.knowledge.reviewHistory.at(-1);
				return rev.grade === "good";
			});
		}

		if (filter.today.again) {
			filteredTests = filterReviewedTodayTests(filteredTests);
			filteredTests = filteredTests.filter((t) => {
				const rev = t.knowledge.reviewHistory.at(-1);
				return rev.grade === "again";
			});
		}

		if (filter.hasImage) {
			filteredTests = filteredTests.filter((t) => {
				return t.images.length > 0;
			});
		}

		if (filter.hasAudio) {
			filteredTests = filteredTests.filter((t) => {
				return Object.keys(t.audios).length > 0;
			});
		}

		if (filter.today.added) {
			filteredTests = filteredTests.filter((t) => {
				if (t.addedDate) {
					return isToday(t.addedDate);
				}
				return false;
			});
		}

		// Sort
		let sort_cb;
		switch (currentSort.name) {
			case "addedDate":
				sort_cb = (a, b) => b.addedDate - a.addedDate;
				break;
			case "difficulty":
				sort_cb = (a, b) => b.knowledge.difficulty - a.knowledge.difficulty;
				break;
			case "stability":
				sort_cb = (a, b) => b.knowledge.stability - a.knowledge.stability;
				break;
			case "retrievability":
				sort_cb = (a, b) => b.knowledge.retrievability - a.knowledge.retrievability;
				break;
		}

		filteredTests = filteredTests.toSorted(sort_cb);
		if (currentSort.direction === "up") {
			filteredTests = filteredTests.toReversed();
		}

		return filteredTests;
	});

	let currentPage = $state(1);
	let displayCardData = $derived.by(() => {
		if (filteredCardData.length > 100) {
			const maxIndexOfCurrentPage = Math.min(100 * currentPage, filteredCardData.length);
			return filteredCardData.slice(0, maxIndexOfCurrentPage);
		} else return filteredCardData;
	});
	let main = $state();

	async function deleteTest(test) {
		await test.delete();
		tests = tests.filter((t) => {
			return t.id !== test.id;
		});
		toast.success("Đã xóa test");
	}

	function setupInffinityScrolling(el) {
		const observer = new IntersectionObserver(async (entries) => {
			if (entries[0].isIntersecting) {
				if (filteredCardData.length > currentPage * 100) {
					currentPage += 1;
				}
			}
		});

		observer.observe(el);
	}

	main = (async function () {
		tests = await SimpleTest.getAll();
		const due = await SimpleTest.getAllDue();
	})();

	let modal = $state();
	let deleteModal = $state();
	const showModal = () => modal.show();
	const updateCardTable = {};
	function registerUpdateCardHandler(id, func) {
		updateCardTable[id] = func;
	}
</script>

{#await main then res}
	<div class="container-fluid top">
		<div class="sidebar">
			<SortMenu {sort} handle={sortHandler} />
			<hr />
			<StatusMenu
				today={filter.today}
				{toogleReviewedGoodToday}
				{toogleReviewedAgainToday}
				{toogleAddedToday}
				{toggleNeedReviewStateFilter}
				{toggleReviewedTodayStateFilter}
			/>
			<hr />
			<StabilityMenu
				toogleUnder7={() => toogleStability("under7")}
				toogle7To30={() => toogleStability("from7to30")}
				toogle30To90={() => toogleStability("from30to90")}
				toogle90To365={() => toogleStability("from90to365")}
				toogleOver365={() => toogleStability("over365")}
				stability={filter.stability}
			/>
			<hr />
			<DifficultyMenu {toogleDifficulty} difficulty={filter.difficulty} />
			<hr />
			<ImageFilterButton
				hasImage={filter.hasImage}
				onclick={() => {
					filter.hasImage = !filter.hasImage;
				}}
			/>

			<AudioFilterButton
				onclick={() => {
					filter.hasAudio = !filter.hasAudio;
				}}
				hasAudio={filter.hasAudio}
			/>
		</div>
		<div class="masonry container-fluid rounded pt-3 pb-3">
			{#if displayCardData}
				{#if displayCardData.length === 0}
					<EmptySpace />
				{:else}
					<Masonry
						bind:refreshLayout
						stretchFirst={false}
						gridGap={"0.75rem"}
						colWidth={"minmax(Min(20em, 100%), 1fr)"}
						items={displayCardData}
					>
						{#each displayCardData as test (test.id)}
							<Card
								{showModal}
								{currentTest}
								onCardClick={() => (currentTest = test)}
								{test}
								onload={refreshLayout}
								deleteTest={() => deleteModal?.show()}
								onEditButtonHandler={() => editModal?.show()}
								registerUpdateCardHandler={(func) => registerUpdateCardHandler(test.id, func)}
							/>
						{/each}
					</Masonry>
					<div {@attach setupInffinityScrolling} class="sentinel"></div>
				{/if}
			{/if}
		</div>
	</div>
	<TestInfoModal bind:this={modal} {currentTest} />
{/await}

<EditCardModal bind:this={editModal}>
	<QAForm
		runOnEdit={() => updateCardTable[currentTest?.id] && updateCardTable[currentTest?.id]()}
		test={currentTest}
		bind:this={qaform}
	/>
</EditCardModal>

<DeleteConfirmModal deleteHandler={() => currentTest && deleteTest(currentTest)} test={currentTest} bind:this={deleteModal} />

<style>
	div.container-fluid.top {
		padding: 0;
		max-height: 100%;
		min-height: 100%;
		display: flex;
	}

	div.sidebar {
		padding: 0 10px 0 10px;
		display: flex;
		flex-direction: column;
		max-width: 260px;
		width: 260px;
		background-color: rgb(248, 249, 250);
		flex-shrink: 0;
		overflow: auto;
	}

	hr {
		margin: 0.3em 0;
	}

	div.container-fluid.masonry {
		border: 1px solid lightgray;
		flex-grow: 1;
		max-height: 100%;
		min-height: 100%;
		height: 100%;
		height: 100%;
		overflow: auto;
	}
</style>
