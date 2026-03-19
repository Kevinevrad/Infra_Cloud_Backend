import jwt from "jsonwebtoken";
import db from "../config/db.js";

// export const loginHandler = (req, res) => {
//   const { email, password } = req.body;

//   if (email === "" || password === "") {
//     return res.status(400).json({ error: "⚠️ Email & Password required !" });
//   }
//   if (!/^\S+@\S+\.\S+$/.test(email)) {
//     return res.status(400).json({ error: "⚠️ Invalid email format !" });
//   }
//   const [userFromDb] = db
//     .prepare(
//       `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`,
//     )
//     .all();

//   if (!userFromDb) {
//     console.log(userFromDb);
//     return res.status(500).json({ error: "❌ No such user exist !" });
//   }

//   // * GENERATING A JWT TOKEN
//   const playload = {
//     userId: userFromDb.id,
//     email: userFromDb.email,
//     role: userFromDb.role,
//   }; // * Payload of the token, can include user information and claims

//   const secretKey = process.env.JWT_SECRET;
//   const token = jwt.sign(playload, secretKey, { expiresIn: "30m" });

//   res.status(200).json({
//     message: "Login successful !",
//     token,
//     user: {
//       id: playload.userId,
//       email: playload.email,
//       role: playload.role,
//     },
//   });
// };

export const loginHandler = (req, res) => {
  try {
    const { email, password } = req.body;

    // ⚠️ ATTENTION : éviter l'injection SQL (à améliorer après)
    const userFromDb = db
      .prepare("SELECT * FROM users WHERE email = ? AND password = ?")
      .get(email, password);

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
    console.error("Login error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message, // optionnel (à enlever en prod)
    });
  }
};
