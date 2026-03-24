import bcrypt from "bcryptjs";
import db from "../config/db.js";

export const createAdminIfNotExists = () => {
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
    INSERT INTO users (name, email, role, password)
    VALUES (?, ?, ?, ?)
  `,
  ).run("Super Admin", "admin@system.com", "admin", hashedPassword);

  console.log("👑 Admin created successfully");
};
