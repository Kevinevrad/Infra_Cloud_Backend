import express from "express";
import adminController from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const { requireAuth, requireAdmin } = authMiddleware;

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.post("/users", adminController.createUser);
router.get("/users", adminController.listUsers);
router.patch("/users/:id/quota", adminController.updateQuota);
router.delete("/users/:id", adminController.deleteUser);

export default router;
