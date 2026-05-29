import { useEffect, useState } from "react";
import api from "./services/api";
import socket from "./services/socket";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedLine, setSelectedLine] = useState("Todas");

  useEffect(() => {
    async function loadData() {
      const stopsResponse = await api.get("/stops");
      setStops(stopsResponse.data);
    }

    loadData();

    socket.on("busLocationUpdate", (updatedBuses) => {
      setBuses(updatedBuses);
    });

    return () => {
      socket.off("busLocationUpdate");
    };
  }, []);

  const filteredBuses =
    selectedLine === "Todas"
      ? buses
      : buses.filter((bus) => bus.line === selectedLine);

  return (
    <div className="app">
      <Sidebar
        buses={buses}
        selectedLine={selectedLine}
        setSelectedLine={setSelectedLine}
      />

      <main className="map-container">
        <MapView buses={filteredBuses} stops={stops} />
      </main>
    </div>
  );
}

export default App;