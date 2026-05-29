const jwt = require("jsonwebtoken");

const JWT_SECRET = "segredo_super_secreto";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não informado." });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido." });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Acesso negado. Apenas administradores podem executar esta ação."
    });
  }

  next();
}

module.exports = {
  authMiddleware,
  adminMiddleware,
  JWT_SECRET
};