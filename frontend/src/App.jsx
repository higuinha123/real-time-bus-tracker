import { useEffect, useState } from "react";
import api from "./services/api";
import socket from "./services/socket";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import LinesPage from "./pages/LinesPage";
import BusesPage from "./pages/BusesPage";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";

function App() {
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedLine, setSelectedLine] = useState("Todas");
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");

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
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="map-container">
        {currentPage === "dashboard" && <DashboardPage />}

        {currentPage === "map" && (
        <MapView buses={filteredBuses} stops={stops} />
        )}

        {currentPage === "lines" && <LinesPage />}

        {currentPage === "buses" && <BusesPage />}
      </main>
    </div>
  );
}

export default App;