import express from "express";
import Database from "better-sqlite3";
import { createUser, sqlRequests } from "./utils.js";

const db = new Database("../dataBase.db", {
  verbose: console.log("CREATION DE LA BASE DE DONNEES"),
});

db.pragma("journal_mode = WAL");

// TODO : CREATE TABLES
sqlRequests.forEach((request) => {
  db.exec(request);
});

const allUsers = db.prepare("SELECT * FROM users").all();
const allfiles = db.prepare("SELECT * FROM files").all();
const allsessions = db.prepare("SELECT * FROM upload_session  ").all();

// prettier-ignore
// createUser("Evrad", "evradassoko99@gmail.com","admin", "Ass@k@9922", allUsers, db);
// db.prepare("DROP TABLE upload_session ADD COLUMN mimetype TEXT;").run();
// db.prepare("DROP TABLE files").run();
// db.prepare("DROP TABLE users").run();
// db.prepare("DROP TABLE upload_session").run();

console.log(allUsers);
// console.log(allfiles);
// console.log(allsessions);

export default db;
