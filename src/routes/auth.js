import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

// * LOGIN ROUTE
router.post("/login", authController.login);

export default router;
