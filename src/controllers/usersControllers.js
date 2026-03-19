import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const loginHandler = (req, res) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    return res.status(400).json({ error: "⚠️ Email & Password required !" });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "⚠️ Invalid email format !" });
  }
  const [userFromDb] = db
    .prepare(
      `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`,
    )
    .all();

  // if (!userFromDb) {
  //   // *
  // }

  // * GENERATING A JWT TOKEN
  const playload = {
    userId: userFromDb.id,
    email: userFromDb.email,
    role: userFromDb.role,
  }; // * Payload of the token, can include user information and claims

  const secretKey = process.env.JWT_SECRET;
  const token = jwt.sign(playload, secretKey, { expiresIn: "30m" });

  res.status(200).json({
    message: "Login successful !",
    token,
    user: {
      id: playload.userId,
      email: playload.email,
      role: playload.role,
    },
  });
};
