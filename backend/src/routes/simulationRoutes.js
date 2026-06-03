const express = require("express");
const prisma = require("../prismaClient");

const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

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

function createSimulationRoutes(io) {
  router.post("/start", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { busId, startLat, startLng, endLat, endLng, steps = 20, interval = 1000 } = req.body;

      const required = [busId, startLat, startLng, endLat, endLng];

      if (required.some((value) => value === undefined || value === null || value === "")) {
        return res.status(400).json({
          message: "busId, startLat, startLng, endLat e endLng são obrigatórios."
        });
      }

      const bus = await prisma.bus.findUnique({
        where: { id: Number(busId) }
      });

      if (!bus) {
        return res.status(404).json({ message: "Ônibus não encontrado." });
      }

      await prisma.locationHistory.deleteMany({
        where: { busId: Number(busId) }
      });

      res.json({ message: "Simulação iniciada com sucesso." });

      let currentStep = 0;

      const totalSteps = Number(steps);
      const delay = Number(interval);

      const latStep = (Number(endLat) - Number(startLat)) / totalSteps;
      const lngStep = (Number(endLng) - Number(startLng)) / totalSteps;

      const simulation = setInterval(async () => {
        try {
          currentStep++;

          const newLat = Number(startLat) + latStep * currentStep;
          const newLng = Number(startLng) + lngStep * currentStep;

          const updatedBus = await prisma.bus.update({
            where: { id: Number(busId) },
            data: {
              lat: newLat,
              lng: newLng
            },
            include: {
              line: true,
              driver: true
            }
          });

          await prisma.locationHistory.create({
            data: {
              busId: Number(busId),
              lat: newLat,
              lng: newLng,
              occupancy: updatedBus.occupancy
            }
          });

          const buses = await prisma.bus.findMany({
            include: {
              line: true,
              driver: true
            },
            orderBy: { id: "asc" }
          });

          io.emit("busLocationUpdate", buses.map(formatBus));

          io.emit("routeHistoryUpdate", {
            busId: Number(busId),
            point: {
              lat: newLat,
              lng: newLng
            }
          });

          if (currentStep >= totalSteps) {
            clearInterval(simulation);
          }
        } catch (error) {
          console.error("Erro durante simulação:", error);
          clearInterval(simulation);
        }
      }, delay);
    } catch (error) {
      console.error("Erro ao iniciar simulação:", error);
      return res.status(500).json({ message: "Erro ao iniciar simulação." });
    }
  });

  return router;
}

module.exports = createSimulationRoutes;