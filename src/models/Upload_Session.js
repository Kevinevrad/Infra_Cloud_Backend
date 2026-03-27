import { v4 as uuidv4 } from "uuid";
import db from "../config/db.js";

const UploadSession = {
  create: ({ originalname, size, mimetype, userId }) => {
    const sessionId = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO upload_session (file_name, file_size,mimetype ,user_id,session_id) VALUES (?,?,?,?,?)`,
    );

    const session = stmt.run(originalname, size, mimetype, userId, sessionId);
    return {
      id: session.lastInsertRowid,
      idSession: sessionId,
    };
  },

  getSession: (id) => {
    const stmt = db.prepare(`SELECT * FROM upload_session WHERE session_id=?`);
    return stmt.get(id);
  },

  updateRow: (row, rowValue, idSession) => {
    // whitelist des colonnes autorisées
    const allowedFields = ["uploaded_chunks", "total_chunks", "status"];

    if (!allowedFields.includes(row)) {
      throw new Error("Colonne non autorisée");
    }

    const stmt = db.prepare(
      `UPDATE upload_session SET ${row} = ? WHERE session_id = ?`,
    );

    stmt.run(rowValue, idSession);
  },

  getRow: (row, sessionId) => {
    const stmt = db.prepare(
      `SELECT ${row} FROM upload_session WHERE session_id=?`,
    );
    return stmt.get(sessionId);
  },
};

export default UploadSession;
