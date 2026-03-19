import db from "../config/db.js";

const downloadFileController = (req, res) => {
  const fileId = parseInt(req.params.id);

  if (!Number.isInteger(fileId)) {
    // prettier-ignore
    return res.status(400).json({ error: "❌ ID incorrect", });
  }

  const file = db
    .prepare(`SELECT * FROM files WHERE id = ? AND user_id = ?`)
    .get([req.params.id, req.user.userId]);

  if (!file) {
    // prettier-ignore
    return res.status(404).json({ error: "❌ file not found", });
  }

  res.status(200).download(file.path);
};

export default downloadFileController;
