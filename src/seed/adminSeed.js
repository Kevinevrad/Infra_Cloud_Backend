import bcrypt from "bcryptjs";
import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createAdminIfNotExists = () => {
  const userId = uuidv4();
  const adminExist = db
    .prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`)
    .get();

  if (adminExist.count > 0) {
    console.log("👑 Admin already exists");
    return;
  }

  const hashedPassword = bcrypt.hashSync("Ass@k@9922", 10);

  db.prepare(
    `
    INSERT INTO users (id,name, email, role, password)
    VALUES (?, ?, ?, ?,?)
  `,
  ).run(userId, "Super Admin", "admin@system.com", "admin", hashedPassword);

  console.log("👑 Admin created successfully");
};
