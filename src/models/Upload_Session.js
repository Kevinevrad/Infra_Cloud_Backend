import { v4 as uuidv4 } from "uuid";
import db from "../config/db.js";

const UploadSession = {
  create: ({ originalname, size, mimetype, userId }) => {
    const sessionId = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO upload_session (file_name, file_size,mimetype,user_id,session_id) VALUES (?,?,?,?,?)`,
    );

    const session = stmt.run(originalname, size, mimetype, userId, sessionId);
    return {
      id: session.lastInsertRowid,
      idSession: sessionId,
    };
  },
};

export default UploadSession;
