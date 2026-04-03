// import fs from "fs";

// import { MAGIC_NUMBERS, upload } from "../middlewares/multer.js";

// const checkMagicNumber = (filePath, ext) => {
//   const magic = MAGIC_NUMBERS[ext];
//   console.log("EXT :", ext); // ✅ vérifiez l'extension reçue
//   console.log("MAGIC :", magic);
//   if (!magic) return false;

//   // Lire uniquement les premiers octets nécessaires
//   const buffer = Buffer.alloc(magic.length);
//   const fd = fs.openSync(filePath, "r");
//   fs.readSync(fd, buffer, 0, magic.length, 0);
//   fs.closeSync(fd);

//   return buffer.equals(magic);
// };

import fs from "fs";
import { MAGIC_NUMBERS } from "../middlewares/multer.js"; // ✅ named import

const checkMagicNumber = (filePath, ext) => {
  const magic = MAGIC_NUMBERS[ext];
  if (!magic) return true;

  const { bytes, offset = 0 } = magic;
  const buffer = Buffer.alloc(bytes.length);
  const fd = fs.openSync(filePath, "r");
  fs.readSync(fd, buffer, 0, bytes.length, offset);
  fs.closeSync(fd);

  console.log("Attendu :", Buffer.from(bytes).toString("hex"));
  console.log("Lu      :", buffer.toString("hex"));

  return buffer.equals(Buffer.from(bytes));
};

export default checkMagicNumber;

// export default checkMagicNumber;
