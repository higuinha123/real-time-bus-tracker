const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const prisma = require("./prismaClient");

const authRoutes = require("./routes/authRoutes");
const busRoutes = require("./routes/busRoutes");
const lineRoutes = require("./routes/lineRoutes");
const driverRoutes = require("./routes/driverRoutes");
const stopRoutes = require("./routes/stopRoutes");
const createSimulationRoutes = require("./routes/simulationRoutes");
const createLocationRoutes = require("./routes/locationRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

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

app.use("/api/auth", authRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/lines", lineRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/stops", stopRoutes);
app.use("/api/simulation", createSimulationRoutes(io));
app.use("/api/location", createLocationRoutes(io));

app.get("/", (req, res) => {
  res.send("API do Bus Tracker funcionando!");
});

io.on("connection", async (socket) => {
  console.log("Cliente conectado:", socket.id);

  try {
    const buses = await prisma.bus.findMany({
      include: {
        line: true,
        driver: true
      },
      orderBy: {
        id: "asc"
      }
    });

    socket.emit("busLocationUpdate", buses.map(formatBus));
  } catch (error) {
    console.error("Erro ao enviar ônibus pelo socket:", error);
  }

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});