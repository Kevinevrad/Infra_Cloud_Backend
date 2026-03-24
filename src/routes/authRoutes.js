import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

import authController from "../controllers/authController.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();

// * GET USER ----------------------------------------------
router.get("/me", verifyToken, authController.getMe);

// * LOGIN ROUTE
router.post("/login", authController.login);

// * CREATE USER
// prettier-ignore
router.post("/register",verifyToken,authorize(["admin"]),authController.register,);

// * LOGOUT ROUTE
router.post("/logout", verifyToken, authController.logout);

export default router;
