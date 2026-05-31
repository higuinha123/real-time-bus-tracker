const express = require("express");
const prisma = require("../prismaClient");

const {
  authMiddleware,
  adminMiddleware
} = require("../middlewares/authMiddleware");

const {
  validatePlate,
  validateCoordinate,
  validateStatus
} = require("../utils/validators");

const router = express.Router();

const VALID_OCCUPANCIES = ["Vazio", "Normal", "Cheio"];
const VALID_OPERATIONAL_STATUSES = [
  "Em operação",
  "Parado",
  "Manutenção",
  "Fora de serviço"
];

function formatBus(bus) {
  return {
    id: bus.id,
    lineId: bus.lineId,
    driverId: bus.driverId,
    line: bus.lineName,
    plate: bus.plate,
    lat: bus.lat,
    lng: bus.lng,
    occupancy: bus.occupancy,
    nextStop: bus.nextStop,
    operationalStatus: bus.operationalStatus,
    driver: bus.driver,
    busLine: bus.line
  };
}

function validateBus(data) {
  if (!data.lineId || Number.isNaN(Number(data.lineId))) {
    return "Selecione uma linha válida.";
  }

  const plateError = validatePlate(data.plate);
  if (plateError) return plateError;

  const latError = validateCoordinate(data.lat, "Latitude");
  if (latError) return latError;

  const lngError = validateCoordinate(data.lng, "Longitude");
  if (lngError) return lngError;

  const occupancyError = validateStatus(
    data.occupancy,
    VALID_OCCUPANCIES,
    "Lotação"
  );
  if (occupancyError) return occupancyError;

  const operationalStatusError = validateStatus(
    data.operationalStatus || "Em operação",
    VALID_OPERATIONAL_STATUSES,
    "Status operacional"
  );
  if (operationalStatusError) return operationalStatusError;

  if (!data.nextStop || data.nextStop.trim().length < 3) {
    return "Próxima parada precisa ter pelo menos 3 caracteres.";
  }

  return null;
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        line: true,
        driver: true
      },
      orderBy: { id: "asc" }
    });

    return res.json(buses.map(formatBus));
  } catch (error) {
    console.error("Erro ao buscar ônibus:", error);
    return res.status(500).json({ message: "Erro ao buscar ônibus." });
  }
});

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      lineId,
      driverId,
      plate,
      lat,
      lng,
      occupancy,
      nextStop,
      operationalStatus
    } = req.body;

    const validationError = validateBus({
      lineId,
      plate,
      lat,
      lng,
      occupancy,
      nextStop,
      operationalStatus
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const lineExists = await prisma.busLine.findUnique({
      where: { id: Number(lineId) }
    });

    if (!lineExists) {
      return res.status(400).json({ message: "Linha não encontrada." });
    }

    if (driverId) {
      const driverExists = await prisma.driver.findUnique({
        where: { id: Number(driverId) }
      });

      if (!driverExists) {
        return res.status(400).json({ message: "Motorista não encontrado." });
      }
    }

    const normalizedPlate = plate.trim().toUpperCase();

    const existingBus = await prisma.bus.findUnique({
      where: { plate: normalizedPlate }
    });

    if (existingBus) {
      return res.status(400).json({
        message: "Já existe um ônibus cadastrado com essa placa."
      });
    }

    const newBus = await prisma.bus.create({
      data: {
        lineId: Number(lineId),
        driverId: driverId ? Number(driverId) : null,
        lineName: `${lineExists.code} - ${lineExists.name}`,
        plate: normalizedPlate,
        lat: Number(lat),
        lng: Number(lng),
        occupancy,
        nextStop: nextStop.trim(),
        operationalStatus: operationalStatus || "Em operação"
      },
      include: {
        line: true,
        driver: true
      }
    });

    return res.status(201).json(formatBus(newBus));
  } catch (error) {
    console.error("Erro ao criar ônibus:", error);
    return res.status(500).json({ message: "Erro ao criar ônibus." });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID do ônibus inválido." });
    }

    const {
      lineId,
      driverId,
      plate,
      lat,
      lng,
      occupancy,
      nextStop,
      operationalStatus
    } = req.body;

    const validationError = validateBus({
      lineId,
      plate,
      lat,
      lng,
      occupancy,
      nextStop,
      operationalStatus
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const busExists = await prisma.bus.findUnique({
      where: { id }
    });

    if (!busExists) {
      return res.status(404).json({ message: "Ônibus não encontrado." });
    }

    const lineExists = await prisma.busLine.findUnique({
      where: { id: Number(lineId) }
    });

    if (!lineExists) {
      return res.status(400).json({ message: "Linha não encontrada." });
    }

    if (driverId) {
      const driverExists = await prisma.driver.findUnique({
        where: { id: Number(driverId) }
      });

      if (!driverExists) {
        return res.status(400).json({ message: "Motorista não encontrado." });
      }
    }

    const normalizedPlate = plate.trim().toUpperCase();

    const existingBusWithSamePlate = await prisma.bus.findFirst({
      where: {
        plate: normalizedPlate,
        NOT: { id }
      }
    });

    if (existingBusWithSamePlate) {
      return res.status(400).json({
        message: "Já existe outro ônibus cadastrado com essa placa."
      });
    }

    const updatedBus = await prisma.bus.update({
      where: { id },
      data: {
        lineId: Number(lineId),
        driverId: driverId ? Number(driverId) : null,
        lineName: `${lineExists.code} - ${lineExists.name}`,
        plate: normalizedPlate,
        lat: Number(lat),
        lng: Number(lng),
        occupancy,
        nextStop: nextStop.trim(),
        operationalStatus: operationalStatus || "Em operação"
      },
      include: {
        line: true,
        driver: true
      }
    });

    return res.json(formatBus(updatedBus));
  } catch (error) {
    console.error("Erro ao atualizar ônibus:", error);
    return res.status(500).json({ message: "Erro ao atualizar ônibus." });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID do ônibus inválido." });
    }

    const busExists = await prisma.bus.findUnique({
      where: { id },
      include: { locations: true }
    });

    if (!busExists) {
      return res.status(404).json({ message: "Ônibus não encontrado." });
    }

    if (busExists.locations.length > 0) {
      await prisma.locationHistory.deleteMany({
        where: { busId: id }
      });
    }

    await prisma.bus.delete({
      where: { id }
    });

    return res.json({ message: "Ônibus removido com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir ônibus:", error);
    return res.status(500).json({ message: "Erro ao excluir ônibus." });
  }
});

module.exports = router;