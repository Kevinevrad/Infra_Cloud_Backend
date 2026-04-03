import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "./src/storage/uploads");

const ALLOWED_EXTENSIONS = [".zip", ".rar"];

// Vérification du magic number (premiers octets du fichier)
// .zip commence par PK (50 4B)
// .rar commence par Rar! (52 61 72 21)
export const MAGIC_NUMBERS = {
  ".zip": { bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0 },
  ".rar": { bytes: [0x52, 0x61, 0x72, 0x21], offset: 0 },
};

// Vérifie si le dossier existe sinon le crée
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, callBack) {
    callBack(null, uploadDir);
  },

  filename: function (req, file, callBack) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    callBack(null, uniqueName);
  },
});

// FILE FILTER CONFIGURATION
const fileFilter = (req, file, callBack) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return callBack(
      new Error("Seuls les fichiers .zip et .rar sont acceptés"),
      false,
    );
  }

  callBack(null, true); // * Accepter tous les types de fichiers (à ajuster selon vos besoins)
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});
