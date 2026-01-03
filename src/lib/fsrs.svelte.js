import wasmUrl from "fsrs-browser/fsrs_browser_bg.wasm?url";
import { browser } from "$app/environment";
import { getCurrentSettings } from "$lib/settings.svelte";
const settings = getCurrentSettings();
const _dr = $derived(settings.desiredRetention / 100);
const dr = $derived(_dr || 0.9);
let fsrs = undefined;
const defaultParams = [
	0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014,
	1.8729, 0.5425, 0.0912, 0.0658, 0.1542,
];
const params = defaultParams;

if (browser) {
	const { default: init, Fsrs } = await import("fsrs-browser");
	await init({ module_or_path: wasmUrl });
	fsrs = new Fsrs(new Float32Array(defaultParams));
}

export function getRetrievability(s, t_s, t_e) {
	let diff = t_e - t_s;
	diff = diff / (1000 * 60 * 60 * 24);
	return getRetrievabilityByDelta(s, diff);
}

//delta is the number of days
export function getRetrievabilityByDelta(s, delta) {
	const w20 = params[20];
	const factor = 0.9 ** (-1 / w20) - 1;
	return (1 + factor * (delta / s)) ** -w20;
}

export function grade(s, d, delta, grade) {
	return fsrs.nextStates(s, d, dr, delta)[grade];
}

export default fsrs;
