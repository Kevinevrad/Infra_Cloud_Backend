import { MAX } from "uuid";
import FileBd from "../models/File.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import checkMagicNumber from "../utils/checkMagicsNumbers.js";
import db from "../config/db.js";

const fileController = {
  uploadFile: (req, res) => {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const isValid = checkMagicNumber(file.path, ext);
    if (!isValid) {
      // Supprimer le fichier corrompu ou falsifié
      fs.unlinkSync(file.path);
      return res.status(400).json({
        error: "Le contenu du fichier ne correspond pas à son extension",
      });
    }

    // Vérification du quota
    const user = db
      .prepare(`SELECT quota, used_space FROM users WHERE id = ?`)
      .get(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    if (user.quota > 0 && user.used_space + file.size > user.quota) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        error: "Quota dépassé",
        quota: user.quota,
        used: user.used_space,
        available: user.quota - user.used_space,
        fileSize: file.size,
      });
    }

    // Sauvegarder les métadonnées en base
    const filedata = FileBd.create({
      file_name: file.originalname,
      stored_name: file.filename,
      path: file.path,
      file_size: file.size,
      mime_type: file.mimetype,
      ext: ext,
      user_id: req.user.userId,
    });

    // Mettre à jour l'espace utilisé
    User.updateRow(req.user.userId, {
      used_space: user.used_space + filedata.file_size,
    });

    res.status(201).json({
      message: "Fichier uploadé avec succès",
      file: filedata,
    });
  },

  getFiles: (req, res) => {
    const files = FileBd.getAll(req.user.userId);

    if (!files) {
      return res.status(400).json({ error: "❌ No file found" });
    }

    res.status(200).json({
      files,
    });
  },

  downloadFile: (req, res) => {
    const fileId = req.params.id;
    const { userId } = req.user;

    const file = FileBd.findByIds(fileId, userId);
    console.log(file);

    if (!file) {
      // prettier-ignore
      return res.status(404).json({ error: "❌ file not found", });
    }

    // Vérifier que le fichier existe bien sur le disque
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ error: "Fichier manquant sur le disque" });
    }

    res.download(file.path, file.file_name);
  },

  deleteFile: (req, res) => {
    const fileId = req.params.id;
    const file = FileBd.findByIds(fileId, req.user.id);

    if (!file) {
      return res.status(404).json({ error: "Fichier introuvable" });
    }

    // Supprimer du disque
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Supprimer de la base
    FileBd.delete(fileId);
    User.updateRow(req.user.id, {
      used_space: MAX(0, User.getById(req.user.id).used_space - file.file_size),
    });

    res.json({ message: "Fichier supprimé" });
  },
};

export default fileController;
