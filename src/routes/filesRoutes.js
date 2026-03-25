import express from "express";
import upload from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import fileController from "../controllers/fileController.js";

const router = express.Router();

// * ROUTE POUR LE UPLOAD DE FICHIERS
// prettier-ignore
router.post("/upload", verifyToken, upload.single("file"), fileController.upload);

// * ROUTE POUR RÉCUPÉRER TOUS LES FICHIERS
router.get("/", verifyToken, fileController.getFiles);

// * ROUTE POUR TELECHARGER UN FICHIER SPECIFIQUE
router.get("/:id/download", verifyToken, fileController.downloadFile);

export default router;
