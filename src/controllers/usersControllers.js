import jwt from "jsonwebtoken";
import db from "../config/db.js";
import bcrypt from "bcryptjs";

export const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFromDb = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    const isMatch = await bcrypt.compare(password, userFromDb.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    // 🔹 Vérification utilisateur
    if (!userFromDb) {
      return res.status(401).json({
        success: false,
        message: "❌ No such user exist !",
      });
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
      error: "Email ou Password incorrect ", // optionnel (à enlever en prod)
    });
  }
};
