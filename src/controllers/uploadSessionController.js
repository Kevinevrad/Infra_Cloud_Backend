import path from "path";
import UploadSession from "../models/Upload_Session.js";
import { fileURLToPath } from "url";
import fs from "fs";
import FileBd from "../models/File.js";

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
    try {
      const sessionId = req.params.sessionId;
      const chunkIndex = req.headers["chunk-index"];
      if (!chunkIndex) {
        return res.status(400).json({ message: "chunk-index manquant" });
      }

      if (!req.body || !(req.body instanceof Buffer)) {
        return res.status(400).json({ message: "Chunk invalide" });
      }

      // prettier-ignore
      const chunkDir = path.join(__dirname,"../storage/chunks", sessionId);
      if (!fs.existsSync(chunkDir)) {
        fs.mkdirSync(chunkDir, { recursive: true });
      }

      const chunkName = `chunk_${String(chunkIndex).padStart(6, "0")}`;
      const chunkPath = path.join(chunkDir, chunkName);
      fs.writeFileSync(chunkPath, req.body);

      // let uplodloedChunks = UploadSession.getRow("uploaded_chunks", sessionId);
      // uplodloedChunks += 1;

      let nbre = fs.readdirSync(chunkDir).length;
      UploadSession.updateRow("uploaded_chunks", nbre, sessionId);
      UploadSession.updateRow("status", "In Progesss", sessionId);

      console.log(UploadSession.getSession(sessionId));
      res.json({
        message: "Chunk reçu",
        chunk: chunkName,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  completed: (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = UploadSession.getSession(sessionId);
      const { file_name, file_size, mimetype, user_id } = session;

      if (!session) {
        return res.status(404).json({ message: "Session non trouvée" });
      }

      const chunkDir = path.join(__dirname, "../storage/chunks", sessionId);
      const filesDir = path.join(__dirname, "../storage/files");

      if (!fs.existsSync(chunkDir)) {
        return res.status(400).json({ message: "Aucun chunk trouvé" });
      }

      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir, { recursive: true });
      }

      // 2️⃣ Lire tous les chunks et les trier
      const chunks = fs
        .readdirSync(chunkDir)
        .filter((f) => f.startsWith("chunk_"))
        .sort();

      const chunksLength = chunks.length;

      for (const chunkName of chunks) {
        const chunkPath = path.join(chunkDir, chunkName);
        const data = fs.readFileSync(chunkPath);
        writeStream.write(data);
      }

      writeStream.end();

      FileBd.create({ file_name, finalPath, file_size, mimetype, user_id });
      UploadSession.updateRow("status", "Completed", sessionId);

      // 6️⃣ Supprimer les chunks (optionnel)
      fs.rmSync(chunkDir, { recursive: true, force: true });
      console.log(session);

      res.status(200).json({
        session: session,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  },
};

export default uploadSessionController;
