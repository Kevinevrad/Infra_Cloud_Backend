import db from "../config/db.js";

const uploadHandler = async (req, res) => {
  const { userId } = req.user;

  if (!req.file) {
    return res.status(400).json({ message: "⚠️ No files uploaded !" });
  } else if (req.file.size > 100 * 1024 * 1024) {
    return res
      .status(400)
      .json({ message: "⚠️ File size exceeds 100MB limit !" });
  }

  const insertFile = db.prepare(
    "INSERT INTO files (file_name,path,file_size,mime_type,user_id) VALUES(?,?,?,?,?)",
  );

  insertFile.run(
    req.file.originalname,
    req.file.path,
    req.file.size,
    req.file.mimetype,
    userId,
  );

  res.json({
    message: "✅ Upload de fichier réussi !",
    file: req.file,
  });
};

export { uploadHandler };
