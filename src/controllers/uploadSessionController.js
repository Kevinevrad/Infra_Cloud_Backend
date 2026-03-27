import path from "path";
import UploadSession from "../models/Upload_Session.js";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadSessionController = {
  init: (req, res) => {
    try {
      const { userId } = req.user;
      const { originalname, size, mimetype } = req.file;

      if (!originalname || !size) {
        return res
          .status(400)
          .json({ error: "❌ File name & File size are required !" });
      }

      const newSession = UploadSession.create({
        originalname,
        size,
        mimetype,
        userId,
      });

      res.status(200).json({
        newSession,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  },

  inProgress: (req, res) => {
    const sessionId = req.params.sessionId;
    const chunkIndex = req.headers["chunk-index"];

    try {
      if (!chunkIndex) {
        return res.status(400).json({ message: "chunk-index manquant" });
      }

      const chunkDir = path.join(__dirname, "../storage/chunks", sessionId);

      if (!fs.existsSync(chunkDir)) {
        fs.mkdirSync(chunkDir, { recursive: true });
      }
      const chunkName = `chunk_${String(chunkIndex).padStart(6, "0")}`;
      const chunkPath = path.join(chunkDir, chunkName);
      fs.writeFileSync(chunkPath, req.body);

      res.json({
        message: "Chunk reçu",
        chunk: chunkName,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default uploadSessionController;
