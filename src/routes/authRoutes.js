import express from "express";
import { loginHandler } from "../controllers/usersControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import bcrypt from "bcryptjs";
import { createUser } from "../config/utils.js";
import db from "../config/db.js";

const router = express.Router();

// * Route de connexion
router.post("/login", loginHandler);

router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "User info retrieved successfully !",
    user: req.user, // * The user information is attached to the request object by the authMiddleware
  });
});

// * CREATE USER
router.post("/register", async (req, res) => {
  const allUsers = db.prepare("SELECT * FROM users").all();
  const { name, email, role, password } = req.body;

  if (!name || !email || !password) {
    return res.status(401).json({
      error: "❌ NO DATA SEND!",
    });
  }
  const hashPassword = await bcrypt.hash(password, 9);
  createUser(name, email, role, hashPassword, allUsers, db);

  res.status(200).json({
    message: "✅ User Created",
  });
});

export default router;
