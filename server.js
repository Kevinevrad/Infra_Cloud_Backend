import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { createAdminIfNotExists } from "./src/seed/adminSeed.js";
import cors from "cors";

// * Importer les routes
import auth from "./src/routes/auth.js";
import admin from "./src/routes/admin.js";
import files from "./src/routes/files.js";

dotenv.config();
const app = express();

// * Accepter la liaison avec le frontend side
app.use(cors());
// * -----------------------------------------

// * Middleware pour parser le JSON dans les requêtes entrantes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// * ----------------------------------------------------------

const server = createServer(app);

// * Protéger les routes d'authentification avec le middleware d'authentification
app.use("/api/auth", auth);
app.use("/api/admin", admin);
// * ----------------------------------------------------------------------------

// * Protéger les routes d'upload de fichiers avec le middleware d'authentification
app.use("/api/files", files);
// * --------------------------------------------------------------------------------

// * UPLOAD SESSION ROUTES
// app.use("/api/files", uploadSessionRoute);

// Gestionnaire d'erreur multer
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ error: "Fichier trop volumineux (max 100 Mo)" });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Erreur serveur" });
});
// CREATE ADMIN BY DEFAULT IF NOT EXISTS
createAdminIfNotExists();
server.listen(process.env.PORT, (req, res) => {
  console.log("SERVER LANCER AVEC SUCCESS SUR LE PORT :", process.env.PORT);
});
