const express = require("express");
const prisma = require("../prismaClient");

const {
  authMiddleware,
  adminMiddleware
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalBuses = await prisma.bus.count();
    const totalLines = await prisma.busLine.count();
    const totalDrivers = await prisma.driver.count();
    const totalStops = await prisma.busStop.count();

    const buses = await prisma.bus.findMany({
      include: {
        line: true,
        driver: true
      },
      orderBy: {
        id: "asc"
      }
    });

    const drivers = await prisma.driver.findMany({
      orderBy: {
        id: "asc"
      }
    });

    const latestBuses = await prisma.bus.findMany({
      take: 5,
      orderBy: {
        id: "desc"
      },
      include: {
        line: true,
        driver: true
      }
    });

    const latestDrivers = await prisma.driver.findMany({
      take: 5,
      orderBy: {
        id: "desc"
      }
    });

    let latestLocations = [];

    try {
      latestLocations = await prisma.locationHistory.findMany({
        take: 8,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          bus: true
        }
      });
    } catch (error) {
      console.log("Histórico de localização ainda não disponível.");
      latestLocations = [];
    }

    const occupancy = {
      vazio: buses.filter((bus) => bus.occupancy === "Vazio").length,
      normal: buses.filter((bus) => bus.occupancy === "Normal").length,
      cheio: buses.filter((bus) => bus.occupancy === "Cheio").length
    };

    const operationalStatus = {
      emOperacao: buses.filter(
        (bus) => bus.operationalStatus === "Em operação"
      ).length,
      parado: buses.filter(
        (bus) => bus.operationalStatus === "Parado"
      ).length,
      manutencao: buses.filter(
        (bus) => bus.operationalStatus === "Manutenção"
      ).length,
      foraDeServico: buses.filter(
        (bus) => bus.operationalStatus === "Fora de serviço"
      ).length
    };

    const driverStatus = {
      ativo: drivers.filter((driver) => driver.status === "Ativo").length,
      afastado: drivers.filter((driver) => driver.status === "Afastado").length,
      inativo: drivers.filter((driver) => driver.status === "Inativo").length
    };

    const formattedLatestBuses = latestBuses.map((bus) => ({
      id: bus.id,
      plate: bus.plate,
      line: bus.lineName,
      occupancy: bus.occupancy,
      operationalStatus: bus.operationalStatus,
      driver: bus.driver ? bus.driver.name : "Sem motorista"
    }));

    const formattedLatestLocations = latestLocations.map((location) => ({
      id: location.id,
      busId: location.busId,
      plate: location.bus ? location.bus.plate : "Ônibus não encontrado",
      lat: location.lat,
      lng: location.lng,
      occupancy: location.occupancy,
      createdAt: location.createdAt
    }));

    return res.json({
      totals: {
        buses: totalBuses,
        lines: totalLines,
        drivers: totalDrivers,
        stops: totalStops
      },
      occupancy,
      operationalStatus,
      driverStatus,
      latest: {
        buses: formattedLatestBuses,
        drivers: latestDrivers,
        locations: formattedLatestLocations
      }
    });
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);

    return res.status(500).json({
      message: "Erro ao carregar informações do dashboard.",
      error: error.message
    });
  }
});

module.exports = router;