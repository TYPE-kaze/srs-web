import Dexie from "dexie";

const db = new Dexie("testingDB");
db.version(1).stores({
	knowledge: "++id, due",
	simple_tests: "++id, knowledgeID",
	books: "name",
	setting: "name",
});
export default db;
