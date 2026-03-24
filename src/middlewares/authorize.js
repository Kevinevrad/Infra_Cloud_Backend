import db from "../config/db.js";
export const authorize = (roles = []) => {
  const adminExist = db
    .prepare(`SELECT COUNT(*) as count FROM users WHERE role=?`)
    .get("admin");

  return (req, res, next) => {
    if (adminExist.count === 0) {
      roles.push(roles[0]);
    } else if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Accès Réfusé (Admin Uniquement)",
      });
    }
    next();
  };
};
