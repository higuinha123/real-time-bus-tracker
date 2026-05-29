const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const buses = require("./data/buses");
const stops = require("./data/stops");

const authRoutes = require("./routes/authRoutes");
const busRoutes = require("./routes/busRoutes");
const lineRoutes = require("./routes/lineRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/lines", lineRoutes);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.get("/", (req, res) => {
  res.send("API do Bus Tracker funcionando!");
});

app.get("/api/stops", (req, res) => {
  res.json(stops);
});

function moveBuses() {
  buses.forEach((bus) => {
    bus.lat += (Math.random() - 0.5) * 0.001;
    bus.lng += (Math.random() - 0.5) * 0.001;
  });

  io.emit("busLocationUpdate", buses);
}

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.emit("busLocationUpdate", buses);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

setInterval(moveBuses, 2000);

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});