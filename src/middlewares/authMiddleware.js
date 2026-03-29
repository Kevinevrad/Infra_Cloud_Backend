import jwt from "jsonwebtoken";

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization; // * Get the Authorization header from the request

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "⚠️ Authorization header missing or malformed !" });
  }

  const token = authHeader && authHeader.split(" ")[1]; // * Extract the token from the "Bearer <token>" format
  // * Debugging log to check the token and auth header values;

  if (!token) {
    return res.status(401).json({ message: "⚠️ Token missing !" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // * Attach the decoded token payload to the request object
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: error.message || "⚠️ Invalid token !" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Accès réservé à l'administrateur" });
  }
  next();
};

export default { requireAuth, requireAdmin };
