const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const users = require("../data/users");
const { JWT_SECRET } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(401).json({ message: "E-mail ou senha inválidos." });
  }

  const passwordIsValid = bcrypt.compareSync(password, user.password);

  if (!passwordIsValid) {
    return res.status(401).json({ message: "E-mail ou senha inválidos." });
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );

  return res.json({
    message: "Login realizado com sucesso.",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = router;