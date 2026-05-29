//teste servidor node (FR) express

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const buses = require("./data/buses");
const stops = require("./data/stops");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("API do Bus Tracker funcionando!");
});

app.get("/api/buses", (req, res) => {
  res.json(buses);
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
});

setInterval(moveBuses, 2000);

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});