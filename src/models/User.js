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
  createUser: ({ name, email, role, password }) => {
    const hashedPassword = bcrypt.hashSync(password, 9);
    const stmt = db.prepare(`
      INSERT INTO users (id,name, email, role, password)
      VALUES (?, ?, ?, ?,?)
    `);

    const result = stmt.run(
      uuidv4(),
      name,
      email,
      role || "user",
      hashedPassword,
    );
    return {
      name,
      email,
      role,
      password,
    };
  },

  //  * VERIFIER LE PASSWORD
  verifyPassword: (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
  },

  //  * UPDATE USER

  update: (id, { name, email, password }) => {
    const stmt = db.prepare(`UPDATE users SET name=?, email=?, WHERE id=?`);
    return stmt.run(id, name, email);
  },

  delete: (id) => {
    const stmt = db.prepare(`DELETE FROM users WHERE id=?`);
    return stmt.run(id);
  },
};

export default User;
