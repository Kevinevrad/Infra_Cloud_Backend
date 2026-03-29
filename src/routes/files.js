import express from "express";
import fileController from "../controllers/fileController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const { requireAuth, requireAdmin } = authMiddleware;

import multer from "../middlewares/multer.js";
const { upload } = multer;

const router = express.Router();
// * ROUTE POUR LE UPLOAD DE FICHIERS

router.use(requireAuth);
// prettier-ignore
router.post("/", upload.single("file"), fileController.uploadFile);

// * ROUTE POUR RÉCUPÉRER TOUS LES FICHIERS
router.get("/", fileController.getFiles);

// * ROUTE POUR TELECHARGER UN FICHIER SPECIFIQUE
router.get("/:id/download", requireAuth, fileController.downloadFile);

router.delete("/:id", fileController.deleteFile);

export default router;
