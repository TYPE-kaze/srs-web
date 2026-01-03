<script>
	import MainNav from "$lib/components/nav/MainNav.svelte";
	import { page } from "$app/state";

	const { nav, onBrowseSeachInput } = $props();
	let additionalClasses = $derived.by(() => {
		if (page.route.id === "/browse") {
			return [];
		} else {
			return ["border"];
		}
	});
</script>

<nav class={["navbar navbar-expand bg-light p-1", ...additionalClasses]}>
	<div class="container-fluid position-relative px-2">
		<!-- LEFT (Search) -->
		<div class="left d-flex">
			{#if page.route.id === "/browse"}
				<form>
					<input
						value={nav.browseSearchTerm ?? ""}
						oninput={onBrowseSeachInput}
						class="form-control"
						type="search"
						placeholder="Tìm kiếm"
					/>
				</form>
			{/if}
		</div>

		<!-- CENTER (Nav links) -->
		<MainNav />

		<!-- RIGHT (Buttons) -->
		<div class="right d-flex">
			<a href="/settings" class="btn border border-0 px-0">
				<i class="bi bi-gear-fill"></i>
				<span style:display="none">Settings</span>
			</a>
		</div>
	</div>
</nav>

<style>
	.no-bottom-border {
		border-bottom: none !important;
	}

	.right {
		justify-content: flex-end;
	}
</style>
