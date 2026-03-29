import User from "../models/User.js";

const adminController = {
  listUsers: (req, res) => {
    const users = User.getAllUsers();
    return res.status(200).json({ success: true, users });
  },

  createUser: (req, res) => {
    try {
      let { name, email, role, password, quota } = req.body;

      if (!name || !email || !password || quota === undefined) {
        return res.status(400).json({
          error:
            "Tous les champs sont obligatoires (name, email, password, quota) !",
        });
      }

      if (quota < 0) {
        return res
          .status(400)
          .json({ error: "Le quota ne peut pas être négatif" });
      }

      // Vérification de l'unicité de l'email
      const existingUser = User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Cet email est déjà utilisé" });
      }

      const quotaValue = Math.floor(quota * 1020 * 1024 * 1024);

      // NEW USER
      const newUser = User.createUser(
        { name, email, role, password },
        quotaValue,
      );

      res.status(201).json({
        message: "✅ User Created",
        newUser,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateQuota: (res, req) => {
    const { id } = req.params;
    const { quota } = req.body;

    if (quota === undefined || quota < 0) {
      return res.status(400).json({
        error: "Le champ 'quota' est requis et ne peut pas être négatif",
      });
    }

    const quotaValue = Math.floor(quota * 1020 * 1024 * 1024);
    const user = User.findByID(id);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const updatedUser = User.update(id, { quota: quotaValue });

    return res.status(200).json({
      message: "✅ Quota mis à jour avec succès",
      user: updatedUser,
    });
  },

  deleteUser: (req, res) => {
    const { id } = req.params;
    const user = User.findByID(id);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const result = User.delete(id);
    return res
      .status(200)
      .json({ message: "✅ Utilisateur supprimé avec succès" });
  },
};

export default adminController;
