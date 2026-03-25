import FileBd from "../models/File.js";

const fileController = {
  upload: (req, res) => {
    try {
      const { userId } = req.user;

      if (!req.file) {
        return res.status(400).json({ message: "⚠️ No files uploaded !" });
      } else if (req.file.size > 100 * 1024 * 1024) {
        return res
          .status(400)
          .json({ message: "⚠️ File size exceeds 100MB limit !" });
      }

      const { originalname, path, size, mimetype } = req.file;
      const file = FileBd.create({
        originalname,
        path,
        size,
        mimetype,
        userId,
      });

      res.status(200).json({
        message: "✅ File update with succèss!",
        file,
      });
    } catch (error) {
      console.log(error);
    }
  },

  getFiles: (req, res) => {
    const { userId } = req.user;

    const files = FileBd.findByUserID(userId);

    if (!files) {
      return res.status(400).json({ error: "❌ No file found" });
    }

    res.status(200).json({
      files: files,
    });
  },

  downloadFile: (req, res) => {
    const fileId = parseInt(req.params.id);
    const { userId } = req.user;

    if (!Number.isInteger(fileId)) {
      // prettier-ignore
      return res.status(400).json({ error: "❌ ID incorrect", });
    }

    const file = FileBd.findByIds(fileId, userId);

    if (!file) {
      // prettier-ignore
      return res.status(404).json({ error: "❌ file not found", });
    }

    res.status(200).download(file.path);
  },
};

export default fileController;
