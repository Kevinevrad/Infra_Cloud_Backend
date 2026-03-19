import db from "../config/db.js";

const getFilesController = (req, res) => {
  const user = req.user;

  const files = db
    .prepare(`SELECT * FROM files WHERE user_id = '${user.userId}'`)
    .all();

  if (!files) {
    return res.status(400).json({ error: "❌ No file found" });
  }

  res.status(200).json({
    files: files,
  });
};

export default getFilesController;
