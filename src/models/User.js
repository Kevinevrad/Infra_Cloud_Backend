import db from "../config/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const User = {
  //  * TROUVER UN UTILISATEUR VIA SON EMAIL
  findByEmail: (email) => {
    const stmt = db.prepare("SELECT * FROM users WHERE email=?");
    return stmt.get(email);
  },

  //  * TROUVER UN UTILISATEUR VIA SON ID
  findByID: (id) => {
    const stmt = db.prepare("SELECT * FROM users WHERE id =?");
    return stmt.get(id);
  },

  //  * CREER UN UTILISATEUR
  createUser: ({ name, email, role, password }, finalQuota) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (name, email, role, password, quota)
      VALUES (?, ?, ?,?, ?)
    `);

    const result = stmt.run(name, email, "user", hashedPassword, finalQuota);
    return {
      id: result.lastInsertRowid,
      name,
      email,
      role,
      password,
      quota: finalQuota,
    };
  },

  //  * VERIFIER LE PASSWORD
  verifyPassword: (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
  },

  //  * UPDATE USER

  updateRow: (id, { name, email, password, quota, used_space }) => {
    const fields = [];
    const values = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }
    if (email) {
      fields.push("email = ?");
      values.push(email);
    }
    if (password) {
      fields.push("password = ?");
      values.push(password);
    }
    if (quota !== undefined) {
      fields.push("quota = ?");
      values.push(quota);
    }

    if (used_space) {
      fields.push("used_space=?");
      values.push(used_space);
    }

    if (fields.length === 0) {
      return null;
    }

    const stmt = db.prepare(
      `UPDATE users SET ${fields.join(", ")} WHERE id=? AND role != 'admin'`,
    );
    values.push(id);
    return stmt.run(...values);
  },

  delete: (id) => {
    const stmt = db.prepare(`DELETE FROM users WHERE id=? AND role !='admin'`);
    return stmt.run(id);
  },

  getAllUsers: () => {
    const stmt = db.prepare("SELECT * FROM users ORDER BY created_at DESC");
    return stmt.all();
  },
};

export default User;
