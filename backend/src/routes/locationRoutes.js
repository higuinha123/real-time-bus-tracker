const express = require("express");
const prisma = require("../prismaClient");

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
    lastUpdate: bus.lastUpdate,
    driver: bus.driver,
    busLine: bus.line
  };
}

function createLocationRoutes(io) {
  router.post("/", async (req, res) => {
    try {
      const { busId, lat, lng, occupancy, nextStop } = req.body;

      if (!busId || lat === undefined || lng === undefined) {
        return res.status(400).json({
          message: "busId, lat e lng são obrigatórios."
        });
      }

      const bus = await prisma.bus.findUnique({
        where: {
          id: Number(busId)
        }
      });

      if (!bus) {
        return res.status(404).json({
          message: "Ônibus não encontrado."
        });
      }

      const updatedBus = await prisma.bus.update({
        where: {
          id: Number(busId)
        },
        data: {
          lat: Number(lat),
          lng: Number(lng),
          occupancy: occupancy || bus.occupancy,
          nextStop: nextStop || bus.nextStop,
          lastUpdate: new Date()
        },
        include: {
          line: true,
          driver: true
        }
      });

      await prisma.locationHistory.create({
        data: {
          busId: Number(busId),
          lat: Number(lat),
          lng: Number(lng),
          occupancy: occupancy || updatedBus.occupancy
        }
      });

      const buses = await prisma.bus.findMany({
        include: {
          line: true,
          driver: true
        },
        orderBy: {
          id: "asc"
        }
      });

      const formattedBuses = buses.map(formatBus);

      io.emit("busLocationUpdate", formattedBuses);

      io.emit("routeHistoryUpdate", {
        busId: Number(busId),
        point: {
          lat: Number(lat),
          lng: Number(lng)
        }
      });

      return res.json({
        message: "Localização atualizada com sucesso.",
        bus: formatBus(updatedBus)
      });
    } catch (error) {
      console.error("Erro ao atualizar localização:", error);

      return res.status(500).json({
        message: "Erro ao atualizar localização."
      });
    }
  });

  return router;
}

module.exports = createLocationRoutes;