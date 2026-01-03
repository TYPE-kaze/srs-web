<script>
	import { setCurrentBook, getCurrentBook } from "$lib/book.svelte.js";
	import { goto } from "$app/navigation";
	import { toast } from "svelte-sonner";
	// pdf engine
	let fileInput;
	let bookState = getCurrentBook();
	let currentBook = $derived(bookState?.currentBook);
	let thumbURL = $derived(currentBook?.thumbBlob && URL.createObjectURL(currentBook?.thumbBlob));
	let title = $derived.by(() => {
		let ret = currentBook?.title ?? currentBook?.file?.name ?? "(Chưa có tiêu đề)";
		if (ret.length > 60) {
			ret = ret.slice(0, 59) + "...";
		}
		return ret;
	});

	let author = $derived.by(() => {
		let ret = currentBook?.author;
		if (ret && ret.length > 60) {
			ret = ret.slice(0, 60);
		}
		return ret;
	});

	let description = $derived.by(() => {
		let ret = currentBook?.description;
		if (ret && ret.length > 60) {
			ret = ret.slice(0, 80) + "...";
		} else {
			ret = "Thêm sách hoặc bắt đầu học";
		}
		return ret;
	});

	async function onclick() {
		fileInput.click();
	}

	async function onchange(event) {
		const selectedFile = event.target.files[0];
		if (selectedFile) {
			try {
				await setCurrentBook(selectedFile);
			} catch (err) {
				toast.error("Nhập sách thất bại");
			}
		}
	}

	function learnButtonhandler() {
		if (getCurrentBook()?.currentBook) {
			goto("/learn");
		} else {
			toast.warning("Không có sách nào để học");
		}
	}
</script>

<div class="card bg-opacity-10 border-secondary-subtle bg-body-tertiary rounded border border-2 shadow-sm">
	<div class="row g-0">
		<div class="col-md-7">
			<div class="card-body d-flex flex-column justify-content-between">
				<div>
					<h5 class="card-title">{title}</h5>
					{#if author}
						<h6 class="card-subtitle text-body-secondary mb-2">{author}</h6>
					{/if}
					<p class="card-text">{description}</p>
				</div>
				<div class="btn-group" role="group" aria-label="Basic example">
					<button {onclick} class="btn btn-sm btn-primary">Thêm sách</button>
					<button onclick={learnButtonhandler} class="btn btn-sm btn-success">Học</button>
				</div>
			</div>
		</div>

		<div class="col-md-5">
			{#if thumbURL}
				<img src={thumbURL} class="thumb img-fluid" alt="book thumbnail" />
			{:else}
				<div class="empty"><span id="emptyText">Rỗng</span></div>
			{/if}
		</div>
	</div>
</div>
<input {onchange} bind:this={fileInput} type="file" id="book" />

<style>
	img.thumb {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	div.card-body {
		min-height: 200px;
		height: 100%;
		max-height: 100%;
	}

	input[type="file"] {
		display: none;
	}

	div.empty {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #868e96;
		color: white;
		font-size: 20px;
		text-align: center;
		position: relative;
	}
</style>
