import {
  FSRS,
  DEFAULT_PARAMETERS,
  FSRS5_DEFAULT_DECAY,
  FSRS6_DEFAULT_DECAY,
  FSRSReview,
  FSRSItem,
  MemoryState,
  NextStates,
  ItemState
} from './fsrs/index.js'

const Grade = {
	Again: 1,
	Hard: 2,
	Good: 3,
	Easy: 4
}
Object.freeze(Grade)

// Default Parameters
// 21 params
// const params = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];

// Mining params
// const params = [2.1500, 11.5724, 37.2736, 100.0000, 6.5117, 0.6874, 3.9912, 0.0050, 1.6755, 0.0121, 0.6851, 1.6995, 0.0010, 0.5004, 1.9216, 0.6014, 1.8729, 0.7429, 0.3380, 0.0977, 0.1000];

// Default params
const params = [3.9158, 4.3710, 4.7182, 5.0356, 5.8522, 0.1912, 3.4498, 0.0010, 2.1116, 0.2666, 1.0744, 1.7689, 0.0014, 0.5184, 1.8478, 0.5975, 1.8729, 0.5512, 0.1069, 0.0838, 0.1480]
// const variable = a;
*  const variable = a;
function sim(g) {
	let t = 0;
	let r_d = 0.9;
	const steps = [];

	// Initial review
	// let s = s_0(g[0]);
	// let d = d_0(g[0]);
	// let i = Math.max(Math.round(interval(r_d, s)), 1.0);
	// steps.push({ t, s, d, i });
	function get_s_on_g(g) {
		switch (g) {
			case Grade.Again:
				return 'again';
				break;
			case Grade.Hard:
				return 'hard';
				break;
			case Grade.Good:
				return 'good';
				break;
			case Grade.Easy:
				return 'easy';
				break;
			default:
				throw new Error()
		}
	}

	const frsr = new FSRS(params);
	let states = frsr.nextStates(null, r_d, 0);
	let i_state = states[get_s_on_g(g[0])];
	let s = i_state.memory.stability;
	let d = i_state.memory.difficulty;
	let i = Math.max(Math.round(i_state.interval), 1.0);
	steps.push({ t, s, d, i });

	// n-th next review
	for (let j = 1; j < g.length; j++) {
		t += i;
		states = frsr.nextStates(new MemoryState(s, d) , r_d, i);
		i_state = states[get_s_on_g(g[0])];
		s = i_state.memory.stability;
		d = i_state.memory.difficulty;
		i = Math.max(Math.round(i_state.interval), 1.0);
		steps.push({ t, s, d, i });
	}
	return steps;
}

// Test run
console.log(sim([3, 3, 3, 3, 3, 3, 3]))
// console.log(sim([4, 4, 4, 4, 4]))
// console.log(sim([3, 1, 3, 3, 1, 3, 3]))
// console.log(sim([1,3,3,3,1,3,3]))

