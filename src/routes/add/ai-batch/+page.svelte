<script>
	//TODO: left-click that ai gen question from the hightlight. And option to
	//gen question from the question field. Add 'review now' option
	// should clear cloud data before uploading?
	import Knowledge from "$lib/models/Knowledge.js";
	import SimpleTest from "$lib/models/SimpleTest.js";
	import Masonry from "$lib/components/Masonry.svelte";
	import QAForm from "$lib/components/QAForm.svelte";
	import EditModal from "./EditModal.svelte";
	import { toast } from "svelte-sonner";
	import { generateQAPairs } from "$lib/genai.svelte";
	let log = $state();
	let fileInput;
	let file;
	let numberOfQuestions = $state(10);
	let content;
	let qaform = $state();
	let loading = $state(false);
	let qaList = $state([]);
	let modal = $state();
	let refreshLayout = $state();
	let modelTitle = $state("");
	const languageList = [
		{ id: "english", label: "Tiếng Anh" },
		{ id: "vietnamese", label: "Tiếng Việt" },
	];
	let language = $state("english");

	async function onclick() {
		loading = true;
		try {
			let res = await generateQAPairs(file, numberOfQuestions, language);
			console.log(res);
			res = res.split("\n\n\n").map((str, index) => {
				let res = str.split("\n");
				return {
					id: index,
					question: res[0].replace(/^Q: /, ""),
					answer: res[1].replace(/^A: /, ""),
					isAdded: false,
				};
			});
			qaList = res;
		} catch (err) {
			let msg = "Có lỗi xảy ra";
			msg = err.message;
			try {
				if (JSON.parse(err.message)?.error?.code === 429) {
					msg = "Bạn đã sử dụng quá giới hạn hiện tại của API";
				}
			} catch (e) {}
			toast.error(msg);
		} finally {
			loading = false;
		}
	}

	async function onchange(event) {
		file = event.target.files[0];
	}

	function editCard(id) {
		modelTitle = "Câu hỏi " + (id + 1);
		qaform.setQuestionText(qaList[id].question);
		qaform.setAnswerText(qaList[id].answer);
		modal.show();
	}

	async function importTestFromCard(id) {
		const { question: q, answer: a } = qaList[id];
		const k = new Knowledge();
		await k.save();
		const t = new SimpleTest(null, q, a, k, null, null, new Date());
		await t.save();
		qaList[id].isAdded = true;
	}
</script>

<div class="container mb-3">
	<h1 class="mt-2 text-center">Thêm câu hỏi tự động bằng AI</h1>
	<h2 class="border-bottom mt-2 mb-2 pb-2">Cấu hình</h2>
	<form class="container-fluid" action="">
		<div class="row mb-3">
			<label for="num-of-questions" class="form-label col-2 my-auto">Số lượng câu hỏi</label>
			<div class="col-2">
				<input
					bind:value={numberOfQuestions}
					id="num-of-questions"
					min="0"
					max="999"
					step="1"
					class="form-control"
					type="number"
				/>
			</div>
		</div>
		<div class="row mb-3">
			<label for="language" class="form-label col-2 my-auto">Ngôn ngữ</label>
			<div class="col-2">
				<select bind:value={language} class="form-select" id="language">
					{#each languageList as i}
						<option selected={i.id === language} value={i.id}>
							{i.label}
						</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="row mb-3">
			<label for="file-input" class="form-label col-2 my-auto">Nhập tài liệu</label>
			<div class="col-5">
				<input id="file-input" class="form-control" {onchange} bind:this={fileInput} type="file" />
			</div>
		</div>
		<button disabled={loading} {onclick} class="btn btn-primary mb-3">Tạo câu hỏi</button>
		<button disabled={loading || qaList.length === 0} onclick={() => (qaList = [])} class="btn btn-secondary mb-3">
			Làm rỗng danh sách
		</button>
	</form>

	<h2 class="border-bottom mt-2 mb-2 pb-2">Danh sách câu hỏi tạo tự động</h2>
	{#if loading}
		<div class="text-center">
			<div class="spinner-border mt-5" style="width: 3rem; height: 3rem;" role="status">
				<span class="visually-hidden">Loading...</span>
			</div>
		</div>
	{:else if qaList.length === 0}
		<div class="fs-2 mt-5 text-center text-secondary">Danh sách rỗng</div>
	{:else}
		<Masonry
			bind:refreshLayout
			stretchFirst={false}
			gridGap={"0.75rem"}
			colWidth={"minmax(Min(45%, 100%), 1fr)"}
			items={qaList}
		>
			{#each qaList as item}
				<div class="card">
					<div class="card-body">
						<p contenteditable="plaintext-only" bind:textContent={item.question} class="card-text fs-5"></p>
						<hr />
						<p contenteditable="plaintext-only" bind:textContent={item.answer} class="card-text fs-6 mb-2"></p>
						<div class="d-flex">
							{#if item.isAdded}
								<span class="text-secondary">
									<i class="bi bi-check2-circle"></i>
									Đã thêm
								</span>
							{:else}
								<button onclick={() => importTestFromCard(item.id)} class="btn btn-primary btn-sm">
									Nhập và Lập lịch
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</Masonry>
	{/if}
</div>

<EditModal title={modelTitle} bind:this={modal}>
	<QAForm bind:this={qaform} />
</EditModal>

<style>
</style>
