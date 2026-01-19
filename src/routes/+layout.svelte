<script>
	import "./layout.css";
	import "@fontsource/noto-sans";
	import "@fontsource/noto-sans-jp";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import favicon from "$lib/assets/favicon.svg";
	import "bootstrap/dist/css/bootstrap.min.css";
	import "bootstrap-icons/font/bootstrap-icons.css";
	import { page } from "$app/state";
	import { setContext } from "svelte";
	import { Toaster } from "svelte-sonner";
	import NavBar from "./NavBar.svelte";

	if (browser) {
		/* let res = import("bootstrap/dist/js/bootstrap.bundle.min.js"); */
		/* BUG FIX: JS seem to differentate imported module by the string used */
		/* the above will cause bootrap to be imported twice. leading to stupid behaviour */
		let res = import("bootstrap");
	}

	let { children } = $props();
	let nav = $state({ browseSearchTerm: null });
	let t_id;
	function onBrowseSeachInput(e) {
		clearTimeout(t_id);

		setTimeout(() => {
			nav.browseSearchTerm = e.target?.value ?? "";
		}, 300);
	}

	setContext("nav", {
		state: nav,
		setSearchTermState: (val) => {
			nav.browseSearchTerm = val;
		},
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if !(page.route.id === "/review" || page.route.id === "/learn")}
	<NavBar {nav} {onBrowseSeachInput} />
{/if}

<main>{@render children()}</main>
<Toaster richColors closeButton position="bottom-center" />

<style>
	:global {
		body {
			margin: 0;
			height: 100vh;
			display: flex;
			flex-direction: column;
		}
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
</style>
