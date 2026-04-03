import db from "../config/db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import checkMagicNumber from "../utils/checkMagicsNumbers.js";
import { log } from "console";

import UploadSession from "../models/Upload_Session.js";

// Utilitaires ---------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_EXTENSIONS = [".zip", ".rar"];
const CHUNK_DIR = path.join(__dirname, "../../storage/chunks");
const UPLOAD_DIR = path.join(__dirname, "../../storage/uploads");

const chunkController = {
  init: (req, res) => {
    // ─────────────────────────────────────────
    // 1. Initialiser une session d'upload
    // ─────────────────────────────────────────

    console.log("req.body reçu :", req.body);

    const { file_name, file_size, total_chunks } = req.body;

    if (!file_name || !file_size || !total_chunks) {
      return res
        .status(400)
        .json({ error: "file_name, file_size et total_chunks sont requis" });
    }

    const ext = path.extname(file_name).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return res
        .status(400)
        .json({ error: "Seuls les fichiers .zip et .rar sont acceptés" });
    }

    if (total_chunks < 1 || total_chunks > 10000) {
      return res.status(400).json({ error: "Nombre de chunks invalide" });
    }

    // Vérification du quota avant de commencer
    const user = req.user;

    log("Utilisateur :", user);
    if (user.quota > 0 && user.used_space + file_size > user.quota) {
      return res.status(400).json({
        error: "Quota insuffisant pour ce fichier",
        available: user.quota - user.used_space,
        fileSize: file_size,
      });
    }

    const sessionId = uuidv4();
    const sessionDir = path.join(CHUNK_DIR, sessionId);
    fs.mkdirSync(sessionDir, { recursive: true });

    db.prepare(
      `
    INSERT INTO upload_session
      (user_id, session_id, file_name, file_size, total_chunks)
    VALUES (?, ?, ?, ?, ?)
  `,
    ).run(req.user.userId, sessionId, file_name, file_size, total_chunks);

    res.status(201).json({
      sessionId,
      message: `Session créée — envoyez ${total_chunks} chunks`,
    });
  },

  // ─────────────────────────────────────────
  // 2. Recevoir un chunk
  // ─────────────────────────────────────────

  inProgress: (req, res) => {
    const { sessionId } = req.params;
    const chunkIndex = parseInt(req.headers["x-chunk-index"]);

    if (isNaN(chunkIndex) || chunkIndex < 0) {
      return res
        .status(400)
        .json({ error: "Header x-chunk-index manquant ou invalide" });
    }

    // Récupérer la session
    const session = UploadSession.getSession(sessionId, req.user.userId);

    //   db.prepare(
    //     `
    //   SELECT * FROM upload_session
    //   WHERE session_id = ? AND user_id = ? AND status = 'in_progress'
    // `,
    //   ).get(sessionId, req.user.userId);

    log("Session trouvée :", session);

    if (!session) {
      return res.status(404).json({ error: "Session introuvable ou expirée" });
    }

    // Vérifier que ce chunk n'a pas déjà été reçu
    const chunkName = `chunk_${String(chunkIndex).padStart(6, "0")}`;
    const chunkPath = path.join(CHUNK_DIR, sessionId, chunkName);

    if (fs.existsSync(chunkPath)) {
      return res.status(409).json({ error: `Chunk ${chunkIndex} déjà reçu` });
    }

    // Écrire le chunk sur le disque
    const writeStream = fs.createWriteStream(chunkPath);
    req.pipe(writeStream);

    writeStream.on("finish", () => {
      // Incrémenter le compteur
      db.prepare(
        `
      UPDATE upload_session
      SET uploaded_chunks = uploaded_chunks + 1
      WHERE session_id = ?
    `,
      ).run(sessionId);

      // Récupérer le compteur mis à jour
      const updated = db
        .prepare(
          `
      SELECT uploaded_chunks, total_chunks FROM upload_session
      WHERE session_id = ?
    `,
        )
        .get(sessionId);

      res.json({
        message: `Chunk ${chunkIndex + 1}/${updated.total_chunks} reçu`,
        received: updated.uploaded_chunks,
        total: updated.total_chunks,
        chunkIndex,
      });
    });

    writeStream.on("error", () => {
      res.status(500).json({ error: "Erreur lors de la sauvegarde du chunk" });
    });
  },

  completed: async (req, res) => {
    const { sessionId } = req.params;

    const session = db
      .prepare(
        `
    SELECT * FROM upload_session
    WHERE session_id = ? AND user_id = ? AND status = 'in_progress'
  `,
      )
      .get(sessionId, req.user.userId);

    if (!session) {
      return res
        .status(404)
        .json({ error: "Session introuvable ou déjà terminée" });
    }

    // Vérifier que tous les chunks sont arrivés
    if (session.uploaded_chunks !== session.total_chunks) {
      return res.status(400).json({
        error: "Tous les chunks ne sont pas encore reçus",
        received: session.uploaded_chunks,
        expected: session.total_chunks,
      });
    }

    const ext = path.extname(session.file_name).toLowerCase();
    const storedName = `${uuidv4()}${ext}`;
    const finalPath = path.join(UPLOAD_DIR, storedName);
    const sessionDir = path.join(CHUNK_DIR, sessionId);

    try {
      // Récupérer les chunks triés par nom
      const chunkFiles = fs.readdirSync(sessionDir).sort();

      if (chunkFiles.length !== session.total_chunks) {
        return res.status(400).json({
          error: "Nombre de fichiers chunks incorrect sur le disque",
          onDisk: chunkFiles.length,
          expected: session.total_chunks,
        });
      }

      // Assembler les chunks dans le fichier final
      const writeStream = fs.createWriteStream(finalPath);

      for (const chunkFile of chunkFiles) {
        const chunkPath = path.join(sessionDir, chunkFile);
        const data = fs.readFileSync(chunkPath);
        writeStream.write(data);
      }

      writeStream.end();

      // Attendre la fin de l'écriture
      await new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      // Vérification du magic number
      const isValid = checkMagicNumber(finalPath, ext);
      if (!isValid) {
        fs.unlinkSync(finalPath);
        fs.rmSync(sessionDir, { recursive: true });
        db.prepare(
          `
        UPDATE upload_session SET status = 'failed' WHERE session_id = ?
      `,
        ).run(sessionId);
        return res
          .status(400)
          .json({ error: "Le fichier assemblé est invalide ou corrompu" });
      }

      // Taille réelle du fichier assemblé
      const realSize = fs.statSync(finalPath).size;

      // Vérification quota finale avec la taille réelle
      const user = db
        .prepare(`SELECT quota, used_space FROM users WHERE id = ?`)
        .get(req.user.userId);
      if (user.quota > 0 && user.used_space + realSize > user.quota) {
        fs.unlinkSync(finalPath);
        fs.rmSync(sessionDir, { recursive: true });
        db.prepare(
          `
        UPDATE upload_session SET status = 'failed' WHERE session_id = ?
      `,
        ).run(sessionId);
        return res
          .status(400)
          .json({ error: "Quota dépassé après assemblage" });
      }

      // Enregistrer le fichier en base
      const result = db
        .prepare(
          `
      INSERT INTO files (owner_id, original_name, stored_name, path, size, ext)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
        )
        .run(
          req.user.userId,
          session.file_name,
          storedName,
          finalPath,
          realSize,
          ext,
        );

      // Mettre à jour l'espace utilisé
      db.prepare(
        `
      UPDATE users SET used_space = used_space + ? WHERE id = ?
    `,
      ).run(realSize, req.user.userId);

      // Marquer la session comme terminée
      db.prepare(
        `
      UPDATE upload_session SET status = 'complete' WHERE session_id = ?
    `,
      ).run(sessionId);

      // Nettoyer les chunks temporaires
      fs.rmSync(sessionDir, { recursive: true });

      res.status(201).json({
        message: "Fichier assemblé avec succès",
        file: {
          id: result.lastInsertRowid,
          original_name: session.file_name,
          size: realSize,
          ext,
        },
      });
    } catch (err) {
      console.error("Erreur assemblage :", err);

      if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
      if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true });

      db.prepare(
        `
      UPDATE upload_session SET status = 'failed' WHERE session_id = ?
    `,
      ).run(sessionId);

      res.status(500).json({ error: "Erreur lors de l'assemblage du fichier" });
    }
  },

  cancelUpload: (req, res) => {
    const { sessionId } = req.params;

    const session = db
      .prepare(
        `
    SELECT * FROM upload_session
    WHERE session_id = ? AND user_id = ?
  `,
      )
      .get(sessionId, req.user.id);

    if (!session) {
      return res.status(404).json({ error: "Session introuvable" });
    }

    const sessionDir = path.join(CHUNK_DIR, sessionId);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true });
    }

    db.prepare(
      `
    UPDATE upload_session SET status = 'failed' WHERE session_id = ?
  `,
    ).run(sessionId);

    res.json({ message: "Session annulée, chunks supprimés" });
  },
};

export default chunkController;
