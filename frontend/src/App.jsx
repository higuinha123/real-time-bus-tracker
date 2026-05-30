import { useEffect, useState } from "react";
import api from "./services/api";
import socket from "./services/socket";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import "./App.css";

function App() {
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedLine, setSelectedLine] = useState("Todas");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

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
        user={user}
        onLogout={handleLogout}
      />

      <main className="map-container">
        <MapView buses={filteredBuses} stops={stops} />
      </main>
    </div>
  );
}

export default App;