import db from "$lib/db";
import { liveQuery } from "dexie";
import { browser } from "$app/environment";
import { fromIndexDBToInstanceSync as fromDB2TInstance } from "$lib/models/SimpleTest";
import { fromIndexDBtoInstance as fromDB2KInstance } from "$lib/models/Knowledge";

function formatDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

export const db_states = $state({ tests: [], knowledges: [] });
const tests_db = $derived(db_states.tests);
const knowledges_db = $derived(db_states.knowledges);
const knowledges_table_db = $derived.by(() => {
	let res = {};
	for (const k of knowledges_db) {
		res[k.id] = fromDB2KInstance(k);
	}
	return res;
});

const k_by_date = $derived.by(() => {
	let res = {};
	for (const key in knowledges_table_db) {
		const item = knowledges_table_db[key];
		const dateStr = formatDate(item.due);
		if (Array.isArray(res[dateStr])) res[dateStr].push(item);
		else res[dateStr] = [item];
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
			isTestFirstTime = false;
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
			isKnowledgeFirstTime = false;
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

export function getDBStates() {
	return db_states;
}

export function getKnowledgeByDate() {
	return k_by_date;
}

export function getReviewCountOfDate(date) {
	return k_by_date[formatDate(date)] ?? 0;
}
