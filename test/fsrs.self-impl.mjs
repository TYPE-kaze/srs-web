// Simple re-implementation of FSR-6 in JS
// Code along this: https://borretti.me/article/implementing-fsrs-in-100-lines
// Note: seem to omit short-term s
// R: real in [0, 1]
// S: real in [0, +Inf]
// D: real in [0, 10]
//
// Rating:
// 1 = again
// 2 = hard
// 3 = good
// 4 = easy
const Grade = {
	Again: 1,
	Hard: 2,
	Good: 3,
	Easy: 4
}
Object.freeze(Grade)

// Default Parameters
// 21 params
// const w = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];

// Mining param
// const w = [2.1500, 11.5724, 37.2736, 100.0000, 6.5117, 0.6874, 3.9912, 0.0050, 1.6755, 0.0121, 0.6851, 1.6995, 0.0010, 0.5004, 1.9216, 0.6014, 1.8729, 0.7429, 0.3380, 0.0977, 0.1000];

const w = [3.9158, 4.3710, 4.7182, 5.0356, 5.8522, 0.1912, 3.4498, 0.0010, 2.1116, 0.2666, 1.0744, 1.7689, 0.0014, 0.5184, 1.8478, 0.5975, 1.8729, 0.5512, 0.1069, 0.0838, 0.1480]
// Retrievability
const F = Math.pow(0.9, -1/w[20]) - 1;
function retrievability(t, S) {
	return Math.pow(1 + F * (t/S), -w[20]);
}

// interval
function interval(r, s) {
	return (s/F) * (Math.pow(r, (-1/w[20])) - 1);
}

// First Stability base on initial grade
function s_0(g) {
	return w[g-1];
}

// New S on success
function s_success(d, s, r, g) {
	const t_d = 11.0 - d;
	const t_s = Math.pow(s, -w[9]);
	const t_r = Math.exp(w[10] * (1-r)) - 1;
	const pen = g === Grade.Hard ? w[15] : 1;
	const bonus = g === Grade.Easy ? w[16] : 1;
	const alpha =  1 + t_d * t_s * t_r * pen * bonus * Math.exp(w[8]);
	return s * alpha;
}

// New S on failure, g = 1
function s_fail(d, s, r) {
	const d_f = Math.pow(d, -w[12]);
	const s_f = Math.pow(s+1, w[13]) - 1;
	const r_f = Math.exp(w[14] * (1-r));
	const s_n = d_f * s_f * r_f * w[11];
	return Math.min(s_n, s);
}

function stability(d, s, r, g) {
	switch(g) {
		case Grade.Again:
			return s_fail(d, s, r);
		case Grade.Hard:
		case Grade.Good:
		case Grade.Easy:
			return s_success(d, s, r, g);
		default:
			throw new Error('Not a supported grade');
	}
}

// Ensure d stray within [1.0, 10.0]
function clamp_d(d) {
  return Math.min(Math.max(d, 1.0), 10.0);
}

// 1st time Diff
function d_0(g) {
	return clamp_d(w[4] - Math.exp(w[5] * (g-1)) + 1);
}

// n-th time diff
function difficulty(d, g) {
	return clamp_d(w[7] * d_0(Grade.Easy) + (1 - w[7]) * dp(d, g));
}

function dp(d, g) {
	return d + delta_d(g) * ((10 - d) / 9);
}

function delta_d(g) {
	return -w[6] * (g - 3);
}

// simple simulator
// interval is round to reflect user reviewing by day
// - kinda impractical to force reviewing after interval like 0.2 day
// - special case: round to 0 -> interval likely stay 0 for most of the reviews
//    -> interval has min of 1
function sim(g) {
	let t = 0;
	let r_d = 0.9;
	const steps = [];

	// Initial review
	let s = s_0(g[0]);
	let d = d_0(g[0]);
	let i = Math.max(Math.round(interval(r_d, s)), 1.0);
	steps.push({ t, s, d, i });

	// n-th next review
	for (let j = 1; j < g.length; j++) {
		t += i;
		let r = retrievability(t, s);
		s = stability(d, s, r, g[j]);
		d = difficulty(d, g[j]);
		i = Math.max(Math.round(interval(r_d, s)), 1.0);
		steps.push({ t, s, d, i });
	}
	return steps;
}

// Test run
console.log(sim([3, 3, 3, 3, 3, 3, 3]))
// console.log(sim([4, 4, 4, 4, 4]))
// console.log(sim([3, 1, 3, 3, 1, 3, 3]))
// console.log(sim([1,3,3,3,1,3,3]))

