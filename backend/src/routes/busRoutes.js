const express = require("express");
const buses = require("../data/buses");

const {
  authMiddleware,
  adminMiddleware
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  res.json(buses);
});

router.post("/", authMiddleware, adminMiddleware, (req, res) => {
  const { lineId, line, plate, lat, lng, occupancy, nextStop } = req.body;

  const newBus = {
    id: buses.length + 1,
    lineId,
    line,
    plate,
    lat,
    lng,
    occupancy,
    nextStop
  };

  buses.push(newBus);

  res.status(201).json(newBus);
});

router.put("/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const busIndex = buses.findIndex((bus) => bus.id === id);

  if (busIndex === -1) {
    return res.status(404).json({ message: "Ônibus não encontrado." });
  }

  buses[busIndex] = {
    ...buses[busIndex],
    ...req.body
  };

  res.json(buses[busIndex]);
});

router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const busIndex = buses.findIndex((bus) => bus.id === id);

  if (busIndex === -1) {
    return res.status(404).json({ message: "Ônibus não encontrado." });
  }

  const deletedBus = buses.splice(busIndex, 1);

  res.json({
    message: "Ônibus removido com sucesso.",
    bus: deletedBus[0]
  });
});

module.exports = router;