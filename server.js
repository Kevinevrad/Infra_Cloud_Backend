import express from "express";
import { createServer } from "node:http";
import dotenv, { config } from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import uploadRoutes from "./src/routes/filesRoutes.js";
import uploadSessionRoute from "./src/routes/uploadSessionRoute.js";
import db from "./src/config/db.js";
import cors from "cors";

const sqlRequest = `SELECT * FROM files`;
const files = db.prepare(sqlRequest).all();

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // * Middleware pour parser le JSON dans les requêtes entrantes
app.use(express.urlencoded({ extended: true }));

const server = createServer(app);
app.use("/api/auth", authRoutes); // * Protéger les routes d'authentification avec le middleware d'authentification

app.use("/api/files", uploadRoutes); // * Protéger les routes d'upload de fichiers avec le middleware d'authentification

// * UPLOAD SESSION ROUTES
app.use("/api/files", uploadSessionRoute);

server.listen(process.env.PORT, (req, res) => {
  console.log("SERVER LANCER AVEC SUCCESS SUR LE PORT :", process.env.PORT);
});
