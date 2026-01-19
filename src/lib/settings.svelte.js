import { liveQuery } from "dexie";
import { browser } from "$app/environment";
import db from "$lib/db";

const defaultSetting = {
	reviewOrder: "random",
	desiredRetention: 90,
	maxInterval: 36500,
	easyDays: {
		0: 1.0, // Sunday
		1: 1.0, // Monday
		2: 1.0, // Tuesday
		3: 1.0, // Wednesday
		4: 1.0, // Thursday
		5: 1.0, // Friday
		6: 1.0, // Saturday
	},
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
	if (typeof value === "object") {
		for (const k in value) {
			currentSetting[key][k] = value[k];
		}
	} else {
		currentSetting[key] = value;
	}
	await db.setting.put({
		name: "setting",
		settings: {
			reviewOrder: currentSetting.reviewOrder,
			desiredRetention: currentSetting.desiredRetention,
			maxInterval: currentSetting.maxInterval,
			geminiKey: currentSetting.geminiKey,
			easyDays: {
				0: currentSetting.easyDays[0],
				1: currentSetting.easyDays[1],
				2: currentSetting.easyDays[2],
				3: currentSetting.easyDays[3],
				4: currentSetting.easyDays[4],
				5: currentSetting.easyDays[5],
				6: currentSetting.easyDays[6],
			},
		},
	});
}

export function getCurrentSettings() {
	return currentSetting;
}

export async function resetSettings() {
	await db.setting.put({
		name: "setting",
		settings: { ...defaultSetting, geminiKey: currentSetting.geminiKey },
	});
}

export function getMaxInterval() {
	return currentSetting.maxInterval;
}

export function getCurrentEasyDays() {
	return currentSetting.easyDays;
}

export function getGemeniKey() {
	return currentSetting.geminiKey;
}
