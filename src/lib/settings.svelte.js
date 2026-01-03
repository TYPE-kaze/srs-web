import { liveQuery } from "dexie";
import { browser } from "$app/environment";
import db from "$lib/db";

const defaultSetting = {
	reviewOrder: "random",
	desiredRetention: 90,
};
let dbResult;
let currentSetting = $state({});

if (browser) {
	let res = await db.setting.toArray();
	if (!res || (Array.isArray(res) && res.length === 0)) {
		await db.setting.put({ name: "setting", settings: defaultSetting });
		currentSetting = defaultSetting;
	} else {
		currentSetting = res[0].settings;
	}

	dbResult = liveQuery(async () => {
		const result = await db.setting.toArray();
		return result;
	});

	dbResult.subscribe((arr) => {
		if (arr[0]) {
			// currentSetting = arr[0].settings; // reassign like this will discard the state Proxy object
			const sets = arr[0].settings;
			for (const k in sets) {
				currentSetting[k] = sets[k];
			}
		}
	});
}

export async function setSetting(key, value) {
	currentSetting[key] = value;
	await db.setting.put({ name: "setting", settings: { ...currentSetting } });
}

export function getCurrentSettings() {
	return currentSetting;
}
