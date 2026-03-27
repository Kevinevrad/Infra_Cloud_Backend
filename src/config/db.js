import path from "path";
import Database from "better-sqlite3";
import { sqlRequests } from "./utils.js";
import fs from "fs";

const dbPath = path.resolve("../../data/dataBase.db");
// créer le dossier si nécessaire
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log("📁 Dossier data créé");
}

const db = new Database(dbPath, {
  // verbose: (msg) => console.log("SQL: BD CREATED"),
});

db.pragma("journal_mode = WAL");

// db.prepare(`SELECT * FROM db`).run();

// // TODO : CREATE TABLES
// sqlRequests.forEach((request) => {
//   db.prepare(request).run();
// });

console.log(db.prepare(`SELECT * FROM users`).get());
// db.prepare(`DROP TABLE users`).run();
export default db;
