import express from "express";
import upload from "../config/multer.js";
import db from "../config/db.js";
import { uploadHandler } from "../controllers/uploadControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import downloadFileController from "../controllers/downloadFileController.js";
import getFilesController from "../controllers/getFilesController.js";

const router = express.Router();

// * ROUTE POUR LE UPLOAD DE FICHIERS
router.post("/upload", verifyToken, upload.single("file"), uploadHandler);

// * ROUTE POUR RÉCUPÉRER TOUS LES FICHIERS
router.get("/", verifyToken, getFilesController);

// * ROUTE POUR TELECHARGER UN FICHIER SPECIFIQUE
router.get("/:id/download", verifyToken, downloadFileController);

export default router;
