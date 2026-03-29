import path from "path";
import db from "../db.js";
import UploadSession from "../models/UploadSession.js";

const ALLOWED_EXTENSIONS = [".zip", ".rar"];
const CHUNK_DIR = path.join(__dirname, "../../storage/chunks");
const UPLOAD_DIR = path.join(__dirname, "../../storage/uploads");

const chunkController = {
  // ─────────────────────────────────────────
  // 1. Initialiser une session d'upload
  // ─────────────────────────────────────────
  init: (req, res) => {
    try {
      const { userId } = req.user;
      const { originalname, size, mimetype, total_chunks } = req.body;

      if (!originalname || !size || !total_chunks) {
        //  prettier-ignore
        return res.status(400).json({ error: 'file_name, total_size et total_chunks sont requis' });
      }

      const ext = path.extname(originalname).toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return res
          .status(400)
          .json({ error: "Extension de fichier non autorisée" });
      }

      if (total_chunks < 1 || total_chunks > 10000) {
        return res.status(400).json({ error: "Nombre de chunks invalide" });
      }

      // Vérification du quota avant même de commencer
      const user = db
        .prepare("SELECT quota used_space FROM users WHERE id = ?")
        .get(req.user.userId);

      if (user.quota > 0 && user.used_space + size > user.quota) {
        return res.status(400).json({
          error: "Quota dépassé",
          available: user.quota - user.used_space,
          fileSize: size,
        });
      }

      const newSession = UploadSession.create({
        originalname,
        total_chunks,
        size,
        mimetype,
        userId,
      });

      // Créer le dossier pour les chunks de cette session
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

    //   Recuperer la session pour vérifier le total_chunks attendu
    const session = UploadSession.getSession(sessionId, req.user.userId);

    if (!session) {
      return res.status(404).json({ error: "Session introuvable ou expirée" });
    }

    // Écrire le chunk sur le disque
    // Le nom est paddé (000001, 000002...) pour garantir l'ordre lors de l'assemblage
    const chunkName = `chunk_${String(chunkIndex).padStart(6, "0")}`;
    const chunkPath = path.join(CHUNK_DIR, sessionId, chunkName);

    if (!req.body || !(req.body instanceof Buffer)) {
      return res.status(400).json({ message: "Chunk invalide" });
    }

    // prettier-ignore
    const chunkDir = path.join(__dirname,"../storage/chunks", sessionId);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(chunkPath);
    req.pipe(writeStream);

    writeStream.on("finish", () => {
      // Mettre à jour le nombre de chunks reçus
      const uploadedChunks = fs.readdirSync(chunkDir).length;
      UploadSession.updateRow("uploaded_chunks", uploadedChunks, sessionId);
    });

    fs.writeFileSync(chunkPath, req.body);

    res.status(200).json({
      message: `Chunk ${chunkIndex + 1}/${session.total_chunks} reçu`,
      chunkIndex,
    });

    writeStream.on("error", () => {
      res.status(500).json({ error: "Erreur lors de la sauvegarde du chunk" });
    });
  },

  completed: (req, res) => {
    const { sessionId } = req.params;
    const session = UploadSession.getSession(sessionId, req.user.userId);

    if (!session) {
      return res.status(404).json({ message: "Session non trouvée" });
    }

    // Vérifier que tous les chunks sont bien arrivés
    if (session.uploaded_chunks !== session.total_chunks) {
      return res.status(400).json({
        error: "Tous les chunks ne sont pas encore reçus",
        received: session.uploaded_chunks,
        expected: session.total_chunks,
      });
    }

    const ext = path.extname(session.original_name).toLowerCase();
    const storedName = `${uuidv4()}${ext}`;
    const finalPath = path.join(UPLOAD_DIR, storedName);
    const sessionDir = path.join(CHUNK_DIR, sessionId);

    // const { file_name, file_size, mimetype, user_id } = session;
    // const chunkDir = path.join(__dirname, "../storage/chunks", sessionId);
    // const filesDir = path.join(__dirname, "../storage/files");

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

    const finalPath = path.join(filesDir, session.file_name);
    const chunksLength = chunks.length;
    console.log(chunksLength);

    // ✅ Créer le write stream
    const writeStream = fs.createWriteStream(finalPath);

    for (const chunkName of chunks) {
      const chunkPath = path.join(chunkDir, chunkName);
      const data = fs.readFileSync(chunkPath);
      writeStream.write(data);
    }

    writeStream.end();

    FileBd.create({ file_name, finalPath, file_size, mimetype, user_id });

    // 6️⃣ Supprimer les chunks (optionnel)
    fs.rmSync(chunkDir, { recursive: true, force: true });

    UploadSession.updateRow("status", "Completed", sessionId);
    res.status(200).json({
      session: session,
    });

    res.status(500).json({
      error: error.message,
    });
  },
};
