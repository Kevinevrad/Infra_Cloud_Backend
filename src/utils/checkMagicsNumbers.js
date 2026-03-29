import fs from "fs";
import multer from "../middlewares/multer.js";
const { MAGIC_NUMBERS } = multer;

const checkMagicNumber = (filePath, ext) => {
  const magic = MAGIC_NUMBERS[ext];
  if (!magic) return false;

  // Lire uniquement les premiers octets nécessaires
  const buffer = Buffer.alloc(magic.length);
  const fd = fs.openSync(filePath, "r");
  fs.readSync(fd, buffer, 0, magic.length, 0);
  fs.closeSync(fd);

  return buffer.equals(magic);
};

export default checkMagicNumber;
