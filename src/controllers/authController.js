import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(password);

      const userFromDb = User.findByEmail(email);
      console.log(userFromDb);

      // 🔹 Vérification utilisateur
      if (!userFromDb) {
        return res.status(401).json({
          success: false,
          message: "❌ No such user exist !",
        });
      }
      const isMatch = User.verifyPassword(password, userFromDb.password);

      if (!isMatch) {
        return res.status(401).json({ error: "Mot de passe incorrect" });
      }

      // 🔹 Génération du token JWT
      const payload = {
        userId: userFromDb.id,
        email: userFromDb.email,
        role: userFromDb.role,
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
          email: payload.email,
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

  register: async (req, res) => {
    try {
      let { name, email, role, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          error: "Champs obligatoires manquants",
        });
      }

      // ROLES SECURISATIONS
      const allowRoles = ["user", "admin"];
      if (role && !allowRoles.includes(role)) {
        return res.status(400).json({ error: "Rôle invalide" });
      }

      // NEW USER
      const newUser = User.createUser({ name, email, role, password });

      res.status(201).json({
        message: "✅ User Created",
        newUser,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
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
