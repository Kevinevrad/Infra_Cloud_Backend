import db from "../config/db.js";
import bcrypt from "bcryptjs";

const FileBd = {
  // * FIND FILE BY ID
  findByUserID: (id) => {
    const stmt = db.prepare(`SELECT * FROM files WHERE user_id=?`);
    return stmt.get(id);
  },

  findByIds: (idFile, userId) => {
    const stmt = db.prepare(`SELECT * FROM files WHERE id = ? AND user_id = ?`);
    return stmt.run(idFile, userId);
  },

  getAll: () => {
    const stmt = db.prepare(`SELECT * FROM files`);
    return stmt.get();
  },

  delete: (id) => {
    const stmt = db.prepare(`DELETE FROM files WHERE id=?`);
    return stmt.run(id);
  },

  update: (id, { file_name }) => {
    const stmt = db.prepare(`UPDATE files SET file_name=?, WHERE id=?`);
    return stmt.run(id, file_name);
  },

  create: ({ file_name, path, file_size, mime_type, user_id }) => {
    const stmt = db.prepare(
      `INSERT INTO files (file_name,path,file_size,mime_type,user_id)
       VALUES (?,?,?,?)`,
    );
    const result = stmt.run(file_name, path, file_size, mime_type, user_id);
    return {
      id: result.lastInsertRowid,
      file_name,
      path,
      file_size,
      mime_type,
      user_id,
    };
  },
};

export default FileBd;
