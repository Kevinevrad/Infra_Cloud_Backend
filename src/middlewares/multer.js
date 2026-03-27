import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const uploadDir = path.join(process.cwd(), "./src/storage/uploads");
const allowedTypes = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
];

const allowedExtensions = [".zip", ".rar"];

// Vérifie si le dossier existe sinon le crée
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, callBack) {
    callBack(null, uploadDir);
  },

  filename: function (req, file, callBack) {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    callBack(null, uniqueSuffix + "-" + file.originalname);
  },
});

// FILE STORAGE CONFIGURATION
// const storage = multer.diskStorage({
//   destination: function (req, file, callBack) {
//     callBack(null, "./src/storage/uploads/"); // * Dossier de destination pour les fichiers uploadés
//   },

//   filename: function (req, file, callBack) {
//     const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
//     callBack(null, uniqueSuffix + "-" + file.originalname);
//   },
// });

// FILE FILTER CONFIGURATION
const fileFilter = (req, file, callBack) => {
  if (allowedTypes.includes(file.mimetype)) {
    callBack(null, true);
  } else {
    callBack(new Error("❌ Type de fichier non autorisé !"), false);
  }
  // callBack(null, true); // * Accepter tous les types de fichiers (à ajuster selon vos besoins)
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
export default upload;
