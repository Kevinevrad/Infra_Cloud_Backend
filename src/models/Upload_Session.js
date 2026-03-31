import { v4 as uuidv4 } from "uuid";
import db from "../config/db.js";

const UploadSession = {
  create: ({ file_name, total_chunks, file_size, mimetype, userId }) => {
    const session_id = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO upload_session (file_name, total_chunks, file_size, mimetype, user_id, session_id) VALUES (?,?,?,?,?,?)`,
    );

    // prettier-ignore
    const session = stmt.run( file_name, total_chunks, file_size, mimetype,userId, session_id);
    return {
      session_id,
      file_name,
      total_chunks,
      file_size,
      mimetype,
      user_id: userId,
      uploaded_chunks: 0,
      status: "in_progress",
    };
  },

  getSession: (id, userId) => {
    const stmt = db.prepare(
      `SELECT * FROM upload_session WHERE session_id=? AND user_id=? AND status='in_progress'`,
    );
    return stmt.get(id, userId);
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
