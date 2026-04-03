import Database from "better-sqlite3";
import { sqlRequests } from "./utils.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(__dirname);

const dbFolder = path.join(__dirname, "../../data");

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

const db = new Database(__dirname + "/../../data/dataBase.db", {});

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

// // TODO : CREATE TABLES
sqlRequests.forEach((request) => {
  db.prepare(request).run();
});

// console.log(db.prepare(`SELECT * FROM upload_session`).all());
// db.prepare(`DROP TABLE upload_session`).run();
export default db;
