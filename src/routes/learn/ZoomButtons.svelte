<script>
	import { useZoom, ZoomMode } from "@embedpdf/plugin-zoom/svelte";
	let { documentId } = $props();

	const zoom = useZoom(() => documentId);
	let dropdown;
	async function setup(el) {
		/* const bootstrap = await import("bootstrap"); */
		/* dropdown = new bootstrap.Dropdown(el); */
	}
</script>

{#if zoom.provides}
	<div class="zoom flex items-center gap-1">
		<button class="btn btn-sm btn-outline-dark rounded" onclick={() => zoom.provides?.zoomOut()}>
			<i class="bi bi-dash-circle"></i>
			<span style:display="none">zoom out</span>
		</button>

		<div class="dropup-center btn-group dropup">
			<button
				{@attach setup}
				type="button"
				class="btn dropdown-toggle btn-sm btn-outline-dark flex items-center gap-1 rounded px-2"
				data-bs-toggle="dropdown"
				aria-expanded="false"
			>
				<span>{Math.round(zoom.state.currentZoomLevel * 100)}%</span>
			</button>
			<ul class="dropdown-menu">
				<li>
					<button onclick={() => zoom.provides?.requestZoom(1.5)} class="dropdown-item text-center">150%</button>
				</li>
				<li>
					<button onclick={() => zoom.provides?.requestZoom(1.25)} class="dropdown-item text-center">125%</button>
				</li>
				<li>
					<button onclick={() => zoom.provides?.requestZoom(0.75)} class="dropdown-item text-center">75%</button>
				</li>
				<li>
					<button onclick={() => zoom.provides?.requestZoom(ZoomMode.FitWidth)} class="dropdown-item">
						<i class="bi bi-arrows-expand-vertical"></i>
						Ngang
					</button>
				</li>
				<li>
					<button onclick={() => zoom.provides?.requestZoom(1.0)} class="dropdown-item">
						<i class="bi bi-arrow-clockwise"></i>
						Đặt lại
					</button>
				</li>
			</ul>
		</div>
		<button class="btn btn-sm btn-outline-dark rounded" onclick={() => zoom.provides?.zoomIn()}>
			<i class="bi bi-plus-circle"></i>
			<span style:display="none">zoom in</span>
		</button>
	</div>
{/if}

<style>
	ul.dropdown-menu {
		min-width: fit-content;
		font-size: 0.85em;
	}
	div.zoom {
		height: 100%;
		display: flex;
		align-items: center;
	}
</style>
