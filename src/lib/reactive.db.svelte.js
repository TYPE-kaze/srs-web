import db from "$lib/db";
import { liveQuery } from "dexie";
import { browser } from "$app/environment";
import { fromIndexDBToInstanceSync as fromDB2TInstance } from "$lib/models/SimpleTest";
import { fromIndexDBtoInstance as fromDB2KInstance } from "$lib/models/Knowledge";

const db_states = $state({ tests: [], knowledges: [] });
const tests_db = $derived(db_states.tests);
const knowledges_db = $derived(db_states.knowledges);
const knowledges_table_db = $derived.by(() => {
	let res = {};
	for (const k of knowledges_db) {
		res[k.id] = fromDB2KInstance(k);
	}
	return res;
});
const tests = $derived.by(() => {
	const res = [];
	for (const t of tests_db) {
		const k = knowledges_table_db[t.knowledgeID];
		res.push(fromDB2TInstance(t, k));
	}
	return res;
});

let db_test_res;
let db_k_res;
let isTestFirstTime = true;
let isKnowledgeFirstTime = true;

if (browser) {
	db_test_res = liveQuery(async () => {
		const res = await db.simple_tests.toArray();
		if (isTestFirstTime) {
			db_states.tests = res;
			isFirstTime = false;
		}
		return res;
	});

	db_test_res.subscribe((res) => {
		db_states.tests = res;
	});

	db_k_res = liveQuery(async () => {
		const res = await db.knowledge.toArray();
		if (isKnowledgeFirstTime) {
			db_states.knowledges = res;
			isFirstTime = false;
		}
		return res;
	});

	db_k_res.subscribe((res) => {
		db_states.knowledges = res;
	});
}

// The reactive experiment
// This return value and not a state
export function getAllTestReactive() {
	return tests;
}
