import express from "express";
import upload from "../middlewares/multer.js";
import uploadSessionController from "../controllers/uploadSessionController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
const { requireAuth, requireAdmin } = authMiddleware;
const router = express.Router();

// prettier-ignore
router.post("/init-session", requireAuth, upload.single("file"), uploadSessionController.init);

router.put(
  "/chunk/:sessionId",
  express.raw({ limit: "100mb", type: "*/*" }),
  uploadSessionController.inProgress,
);

router.post("/complete/:sessionId", uploadSessionController.completed);

export default router;
