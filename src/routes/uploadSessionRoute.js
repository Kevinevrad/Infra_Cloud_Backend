import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { v4 as uuidv4 } from "uuid";
import db from "../config/db.js";
import upload from "../middlewares/multer.js";
import path from "path";
import fs from "fs";

import { fileURLToPath } from "url";
import uploadSessionController from "../controllers/uploadSessionController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// prettier-ignore
router.post("/init-session", verifyToken, upload.single("file"), uploadSessionController.init);

router.put(
  "/chunk/:sessionId",
  express.raw({ limit: "50mb", type: "*/*" }),
  // (req, res) => {
  //   const sessionId = req.params.sessionId;
  //   const chunkIndex = req.headers["chunk-index"];

  //   try {
  //     if (!chunkIndex) {
  //       return res.status(400).json({ message: "chunk-index manquant" });
  //     }

  //     const chunkDir = path.join(__dirname, "../storage/chunks", sessionId);

  //     if (!fs.existsSync(chunkDir)) {
  //       fs.mkdirSync(chunkDir, { recursive: true });
  //     }
  //     const chunkName = `chunk_${String(chunkIndex).padStart(6, "0")}`;
  //     const chunkPath = path.join(chunkDir, chunkName);
  //     fs.writeFileSync(chunkPath, req.body);

  //     res.json({
  //       message: "Chunk reçu",
  //       chunk: chunkName,
  //     });
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // },
  uploadSessionController.inProgress,
);

router.post("/complete/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  try {
    const [session] = db
      .prepare(`SELECT * FROM upload_session WHERE session_id = '${sessionId}'`)
      .all();

    if (!session) {
      return res.status(404).json({ message: "Session non trouvée" });
    }

    const chunkDir = path.join(__dirname, "../storage/chunks", sessionId);
    const filesDir = path.join(__dirname, "../storage/files");

    console.log(chunkDir);

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

    // 3️⃣ Créer un stream vers le fichier final
    const finalPath = path.join(filesDir, session.file_name);
    const writeStream = fs.createWriteStream(finalPath);

    for (const chunkName of chunks) {
      const chunkPath = path.join(chunkDir, chunkName);
      const data = fs.readFileSync(chunkPath);
      writeStream.write(data);
    }

    writeStream.end();

    db.prepare(
      `INSERT INTO files (file_name, path, file_size, mime_type, user_id) VALUES (?,?,?,?,?)`,
    ).run(
      session.file_name,
      finalPath,
      session.file_size,
      session.mimitype,
      session.user_id,
    );

    db.prepare(
      `UPDATE upload_session SET status = 'Completed' WHERE session_id = '${sessionId}'`,
    ).run();

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
});

export default router;
