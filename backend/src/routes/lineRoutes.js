const express = require("express");
const prisma = require("../prismaClient");

const {
  authMiddleware,
  adminMiddleware
} = require("../middlewares/authMiddleware");

const {
  validateLineCode,
  validateName,
  validateDescription
} = require("../utils/validators");

const router = express.Router();

function validateLine({ code, name, description }) {
  const codeError = validateLineCode(code);
  if (codeError) return codeError;

  const nameError = validateName(name, "Nome da linha");
  if (nameError) return nameError;

  const descriptionError = validateDescription(description);
  if (descriptionError) return descriptionError;

  return null;
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const lines = await prisma.busLine.findMany({
      orderBy: { id: "asc" }
    });

    return res.json(lines);
  } catch (error) {
    console.error("Erro ao buscar linhas:", error);
    return res.status(500).json({ message: "Erro ao buscar linhas." });
  }
});

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { code, name, description } = req.body;

    const validationError = validateLine({ code, name, description });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingLine = await prisma.busLine.findFirst({
      where: { code: code.trim() }
    });

    if (existingLine) {
      return res.status(400).json({
        message: "Já existe uma linha cadastrada com esse código."
      });
    }

    const newLine = await prisma.busLine.create({
      data: {
        code: code.trim(),
        name: name.trim(),
        description: description.trim()
      }
    });

    return res.status(201).json(newLine);
  } catch (error) {
    console.error("Erro ao criar linha:", error);
    return res.status(500).json({ message: "Erro ao criar linha." });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID da linha inválido." });
    }

    const { code, name, description } = req.body;

    const validationError = validateLine({ code, name, description });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const lineExists = await prisma.busLine.findUnique({
      where: { id }
    });

    if (!lineExists) {
      return res.status(404).json({ message: "Linha não encontrada." });
    }

    const existingLineWithSameCode = await prisma.busLine.findFirst({
      where: {
        code: code.trim(),
        NOT: { id }
      }
    });

    if (existingLineWithSameCode) {
      return res.status(400).json({
        message: "Já existe outra linha cadastrada com esse código."
      });
    }

    const updatedLine = await prisma.busLine.update({
      where: { id },
      data: {
        code: code.trim(),
        name: name.trim(),
        description: description.trim()
      }
    });

    return res.json(updatedLine);
  } catch (error) {
    console.error("Erro ao atualizar linha:", error);
    return res.status(500).json({ message: "Erro ao atualizar linha." });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID da linha inválido." });
    }

    const lineExists = await prisma.busLine.findUnique({
      where: { id },
      include: { buses: true, stops: true }
    });

    if (!lineExists) {
      return res.status(404).json({ message: "Linha não encontrada." });
    }

    if (lineExists.buses.length > 0) {
      return res.status(400).json({
        message: "Não é possível excluir esta linha porque existem ônibus vinculados a ela."
      });
    }

    if (lineExists.stops.length > 0) {
      return res.status(400).json({
        message: "Não é possível excluir esta linha porque existem pontos vinculados a ela."
      });
    }

    await prisma.busLine.delete({
      where: { id }
    });

    return res.json({ message: "Linha removida com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir linha:", error);
    return res.status(500).json({ message: "Erro ao excluir linha." });
  }
});

module.exports = router;