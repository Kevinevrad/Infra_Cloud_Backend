import { createAdminIfNotExists } from "./src/seed/adminSeed.js";
import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import uploadRoutes from "./src/routes/filesRoutes.js";
import uploadSessionRoute from "./src/routes/uploadSessionRoute.js";
import cors from "cors";

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
app.use("/api/auth", authRoutes);
// * ----------------------------------------------------------------------------

// * Protéger les routes d'upload de fichiers avec le middleware d'authentification
app.use("/api/files", uploadRoutes);
// * --------------------------------------------------------------------------------

// * UPLOAD SESSION ROUTES
app.use("/api/files", uploadSessionRoute);
createAdminIfNotExists();

server.listen(process.env.PORT, (req, res) => {
  console.log("SERVER LANCER AVEC SUCCESS SUR LE PORT :", process.env.PORT);
});
