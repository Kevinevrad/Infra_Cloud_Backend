import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = User.findByEmail(email);

      // 🔹 Vérification utilisateur
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({
          success: false,
          error: "❌ Email ou mot de passe incorrect !",
        });
      }
      const isMatch = User.verifyPassword(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: "Mot de passe incorrect" });
      }

      // 🔹 Génération du token JWT
      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const secretKey = process.env.JWT_SECRET;

      const token = jwt.sign(payload, secretKey, {
        expiresIn: "30m",
      });

      // 🔹 Réponse succès
      return res.status(200).json({
        success: true,
        message: "Login successful !",
        token,
        user: {
          id: payload.userId,
          nom: user.name,
          email: payload.email,
          quota: user.quota,
          espace_utilise: user.space_used,
          role: payload.role,
        },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
    }
  },

  logout: async (req, res) => {
    res.status(200).json({
      message: "Déconnexion réussie",
    });
  },

  getMe: (req, res) => {
    res.status(200).json({
      message: "User info retrieved successfully !",
      user: req.user, // * The user information is attached to the request object by the authMiddleware
    });
  },
};

export default authController;
