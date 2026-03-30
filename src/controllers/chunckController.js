import db from "../config/db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import checkMagicNumber from "../utils/checkMagicsNumbers.js";

//  Modeles et utilitaires
import User from "../models/User.js";
import FileBd from "../models/File.js";
import UploadSession from "../models/Upload_Session.js";
import { log } from "console";

// Utilitaires ---------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_EXTENSIONS = [".zip", ".rar"];
const CHUNK_DIR = path.join(__dirname, "../storage/chunks/");
const UPLOAD_DIR = path.join(__dirname, "../storage/uploads");

const chunkController = {
  // ─────────────────────────────────────────
  // 1. Initialiser une session d'upload
  // ─────────────────────────────────────────
  init: (req, res) => {
    try {
      const { userId } = req.user;
      const { file_name, file_size, mimetype, total_chunks } = req.body;
      console.log("DIRNAME", CHUNK_DIR);

      if (!file_name || !file_size || !total_chunks) {
        //  prettier-ignore
        return res.status(400).json({ error: 'file_name, file_size et total_chunks sont requis' });
      }

      const ext = path.extname(file_name).toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return res
          .status(400)
          .json({ error: "Extension de fichier non autorisée" });
      }

      if (total_chunks < 1 || total_chunks > 10000) {
        return res.status(400).json({ error: "Nombre de chunks invalide" });
      }

      // Vérification du quota avant même de commencer
      const user = User.findByID(userId);

      if (user.quota > 0 && user.used_space + file_size > user.quota) {
        return res.status(400).json({
          error: "Quota dépassé",
          available: user.quota - user.used_space,
          fileSize: file_size,
        });
      }

      const newSession = UploadSession.create({
        file_name,
        total_chunks,
        file_size,
        mimetype,
        userId,
      });

      // Créer le dossier pour les chunks de cette session
      if (!fs.existsSync(CHUNK_DIR)) {
        fs.mkdirSync(CHUNK_DIR, { recursive: true });
      }

      const sessionDir = path.join(CHUNK_DIR, newSession.idSession);

      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }

      res.status(200).json({
        message: `Session créée — envoyez ${total_chunks} chunks`,
        newSession,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  },

  // ─────────────────────────────────────────
  // 2. Recevoir un chunk
  // ─────────────────────────────────────────

  inProgress: (req, res) => {
    const { sessionId } = req.params;
    const chunkIndex = parseInt(req.headers["x-chunk-index"]);
    const totalChunks = parseInt(req.headers["x-total-chunks"]);

    if (isNaN(chunkIndex) || chunkIndex < 0) {
      return res
        .status(400)
        .json({ error: "x-chunk-index manquant ou invalide" });
    }

    // Récupérer la session
    const session = UploadSession.getSession(sessionId, req.user.userId);

    if (!session) {
      return res.status(404).json({ error: "Session introuvable ou expirée" });
    }

    // Écrire le chunk sur le disque
    // Le nom est paddé (000001, 000002...) pour garantir l'ordre lors de l'assemblage
    const chunkName = `chunk_${String(chunkIndex).padStart(6, "0")}`;
    const chunkPath = path.join(CHUNK_DIR, sessionId, chunkName);

    const writeStream = fs.createWriteStream(chunkPath);
    req.pipe(writeStream);

    writeStream.on("finish", () => {
      // Incrémenter le compteur de chunks reçus
      UploadSession.updateRow(
        "uploaded_chunks",
        session.uploaded_chunks + 1,
        sessionId,
      );

      res.json({
        message: `Chunk ${chunkIndex + 1}/${session.total_chunks} reçu`,
        chunkIndex,
      });
    });

    writeStream.on("error", () => {
      res.status(500).json({ error: "Erreur lors de la sauvegarde du chunk" });
    });
  },

  completed: async (req, res) => {
    const sessionId = req.params.sessionId;
    const userId = req.user.userId;

    const session = UploadSession.getSession(sessionId, userId);

    if (!session) {
      return res.status(404).json({ message: "Session non trouvée" });
    }

    // Vérifier que tous les chunks sont bien arrivés
    if (session.uploaded_chunks !== session.total_chunks) {
      return res.status(400).json({
        error: "Tous les chunks ne sont pas encore reçus",
        reçus: session.uploaded_chunks,
        attendus: session.total_chunks,
      });
    }

    const ext = path.extname(session.file_name).toLowerCase();
    const storedName = `${uuidv4()}${ext}`;
    const finalPath = path.join(UPLOAD_DIR, storedName);
    const sessionDir = path.join(CHUNK_DIR, sessionId);

    try {
      // Récupérer les chunks triés par nom (l'ordre est garanti par le padding)
      const chunkFiles = fs.readdirSync(sessionDir).sort();

      // Assembler chunk par chunk dans le fichier final
      const writeStream = fs.createWriteStream(finalPath);

      for (const chunkFile of chunkFiles) {
        const chunkPath = path.join(sessionDir, chunkFile);
        const data = fs.readFileSync(chunkPath);
        writeStream.write(data);
      }
      writeStream.end();

      await new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      // Vérification du magic number sur le fichier assemblé
      const isValid = checkMagicNumber(finalPath, ext);
      if (!isValid) {
        fs.unlinkSync(finalPath);
        fs.rmSync(sessionDir, { recursive: true });

        // prettier-ignore
        UploadSession.updateRow("status", "failed", sessionId);
        return res
          .status(400)
          .json({ error: "Le fichier assemblé est invalide ou corrompu" });
      }

      // Vérification de la taille réelle vs déclarée
      const realSize = fs.statSync(finalPath).size;

      // Vérification quota une dernière fois avec la taille réelle

      const user = User.findByID(req.user.userId);
      if (user.quota > 0 && user.used_space + realSize > user.quota) {
        fs.unlinkSync(finalPath);
        fs.rmSync(sessionDir, { recursive: true });
        return res
          .status(400)
          .json({ error: "Quota dépassé après assemblage" });
      }

      // Enregistrer en base
      // prettier-ignore
      const result =  FileBd.create({
        file_name: session.file_name,
        stored_name: storedName,
        size: realSize,
        ext: ext,

      });

      // Mettre à jour le quota utilisé
      // prettier-ignore
      User.updateRow(userId, { used_space: user.used_space + realSize });

      // Marquer la session comme terminée
      // prettier-ignore
      UploadSession.updateRow("status", "completed", sessionId);

      // Nettoyer les chunks temporaires
      fs.rmSync(sessionDir, { recursive: true });

      res.status(201).json({
        message: "Fichier assemblé avec succès",
        file: {
          id: result.lastInsertRowid,
          name: session.file_name,
          stored_name: storedName,
          size: realSize,
          ext,
        },
      });
    } catch (error) {
      // Nettoyage en cas d'erreur
      if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
      if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true });

      // Marquer comme échouée
      // prettier-ignore
      UploadSession.updateRow("status", "failed", sessionId);

      res.status(500).json({ error: "Erreur lors de l'assemblage du fichier" });
    }
  },

  cancelUpload: (req, res) => {
    const { sessionId } = req.params;
    const { userId } = req.user;

    // prettier-ignore
    const session =  UploadSession.getSession(sessionId,  userId);

    if (!session) {
      return res.status(404).json({ error: "Session introuvable" });
    }

    // Supprimer les chunks du disque
    const sessionDir = path.join(CHUNK_DIR, sessionId);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true });
    }

    // Marquer comme échouée
    // prettier-ignore
    UploadSession.updateRow("status", "failed", sessionId);

    res.json({ message: "Session annulée, chunks supprimés" });
  },
};

export default chunkController;
