const express = require("express");
const lines = require("../data/lines");

const {
  authMiddleware,
  adminMiddleware
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  res.json(lines);
});

router.post("/", authMiddleware, adminMiddleware, (req, res) => {
  const { code, name, description } = req.body;

  const newLine = {
    id: lines.length + 1,
    code,
    name,
    description
  };

  lines.push(newLine);

  res.status(201).json(newLine);
});

router.put("/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const lineIndex = lines.findIndex((line) => line.id === id);

  if (lineIndex === -1) {
    return res.status(404).json({ message: "Linha não encontrada." });
  }

  lines[lineIndex] = {
    ...lines[lineIndex],
    ...req.body
  };

  res.json(lines[lineIndex]);
});

router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const lineIndex = lines.findIndex((line) => line.id === id);

  if (lineIndex === -1) {
    return res.status(404).json({ message: "Linha não encontrada." });
  }

  const deletedLine = lines.splice(lineIndex, 1);

  res.json({
    message: "Linha removida com sucesso.",
    line: deletedLine[0]
  });
});

module.exports = router;