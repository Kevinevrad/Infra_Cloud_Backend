import express from "express";
import fileController from "../controllers/fileController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import chunkController from "../controllers/chunckController.js";

const { requireAuth, requireAdmin } = authMiddleware;

import { upload } from "../middlewares/multer.js";

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

// Upload chunked (semaine 5)
router.post("/init", chunkController.init);
router.put(
  "/chunk/:sessionId",
  express.raw({ limit: "100mb", type: "*/*" }),
  chunkController.inProgress,
);
router.post("/complete/:sessionId", chunkController.completed);
router.delete("/cancel/:sessionId", chunkController.cancelUpload);
export default router;
