import express from "express";
import { loginHandler } from "../controllers/usersControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// * Route de connexion
router.post("/login", loginHandler);

router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "User info retrieved successfully !",
    user: req.user, // * The user information is attached to the request object by the authMiddleware
  });
});

export default router;
