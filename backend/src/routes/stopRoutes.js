const express = require("express");
const prisma = require("../prismaClient");

const {
  authMiddleware,
  adminMiddleware
} = require("../middlewares/authMiddleware");

const {
  validateName,
  validateCoordinate
} = require("../utils/validators");

const router = express.Router();

function validateStop({ name, lat, lng }) {
  const nameError = validateName(name, "Nome do ponto");
  if (nameError) return nameError;

  const latError = validateCoordinate(lat, "Latitude");
  if (latError) return latError;

  const lngError = validateCoordinate(lng, "Longitude");
  if (lngError) return lngError;

  const latNumber = Number(lat);
  const lngNumber = Number(lng);

  if (latNumber < -90 || latNumber > 90) {
    return "Latitude deve estar entre -90 e 90.";
  }

  if (lngNumber < -180 || lngNumber > 180) {
    return "Longitude deve estar entre -180 e 180.";
  }

  return null;
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const stops = await prisma.busStop.findMany({
      include: {
        line: true
      },
      orderBy: {
        id: "asc"
      }
    });

    return res.json(stops);
  } catch (error) {
    console.error("Erro ao buscar pontos:", error);
    return res.status(500).json({ message: "Erro ao buscar pontos." });
  }
});

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, lat, lng, lineId } = req.body;

    const validationError = validateStop({ name, lat, lng });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (lineId) {
      const lineExists = await prisma.busLine.findUnique({
        where: { id: Number(lineId) }
      });

      if (!lineExists) {
        return res.status(400).json({ message: "Linha não encontrada." });
      }
    }

    const stop = await prisma.busStop.create({
      data: {
        name: name.trim(),
        lat: Number(lat),
        lng: Number(lng),
        lineId: lineId ? Number(lineId) : null
      },
      include: {
        line: true
      }
    });

    return res.status(201).json(stop);
  } catch (error) {
    console.error("Erro ao criar ponto:", error);
    return res.status(500).json({ message: "Erro ao criar ponto." });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID do ponto inválido." });
    }

    const { name, lat, lng, lineId } = req.body;

    const validationError = validateStop({ name, lat, lng });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const stopExists = await prisma.busStop.findUnique({
      where: { id }
    });

    if (!stopExists) {
      return res.status(404).json({ message: "Ponto não encontrado." });
    }

    if (lineId) {
      const lineExists = await prisma.busLine.findUnique({
        where: { id: Number(lineId) }
      });

      if (!lineExists) {
        return res.status(400).json({ message: "Linha não encontrada." });
      }
    }

    const updatedStop = await prisma.busStop.update({
      where: { id },
      data: {
        name: name.trim(),
        lat: Number(lat),
        lng: Number(lng),
        lineId: lineId ? Number(lineId) : null
      },
      include: {
        line: true
      }
    });

    return res.json(updatedStop);
  } catch (error) {
    console.error("Erro ao atualizar ponto:", error);
    return res.status(500).json({ message: "Erro ao atualizar ponto." });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID do ponto inválido." });
    }

    const stopExists = await prisma.busStop.findUnique({
      where: { id }
    });

    if (!stopExists) {
      return res.status(404).json({ message: "Ponto não encontrado." });
    }

    await prisma.busStop.delete({
      where: { id }
    });

    return res.json({ message: "Ponto removido com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir ponto:", error);
    return res.status(500).json({ message: "Erro ao excluir ponto." });
  }
});

module.exports = router;