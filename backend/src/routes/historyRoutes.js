const express = require("express");
const prisma = require("../prismaClient");

const {
  authMiddleware,
  adminMiddleware
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:busId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const busId = Number(req.params.busId);

    if (!busId) {
      return res.status(400).json({
        message: "ID do ônibus inválido."
      });
    }

    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        line: true,
        driver: true
      }
    });

    if (!bus) {
      return res.status(404).json({
        message: "Ônibus não encontrado."
      });
    }

    const history = await prisma.locationHistory.findMany({
      where: { busId },
      orderBy: {
        createdAt: "asc"
      }
    });

    return res.json({
      bus: {
        id: bus.id,
        plate: bus.plate,
        line: bus.lineName,
        occupancy: bus.occupancy,
        operationalStatus: bus.operationalStatus,
        nextStop: bus.nextStop,
        lastUpdate: bus.lastUpdate,
        driver: bus.driver ? bus.driver.name : "Sem motorista"
      },
      history
    });
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);

    return res.status(500).json({
      message: "Erro ao buscar histórico de rotas."
    });
  }
});

router.delete("/:busId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const busId = Number(req.params.busId);

    if (!busId) {
      return res.status(400).json({
        message: "ID do ônibus inválido."
      });
    }

    const bus = await prisma.bus.findUnique({
      where: { id: busId }
    });

    if (!bus) {
      return res.status(404).json({
        message: "Ônibus não encontrado."
      });
    }

    await prisma.locationHistory.deleteMany({
      where: { busId }
    });

    return res.json({
      message: "Histórico removido com sucesso."
    });
  } catch (error) {
    console.error("Erro ao limpar histórico:", error);

    return res.status(500).json({
      message: "Erro ao limpar histórico de rotas."
    });
  }
});

module.exports = router;