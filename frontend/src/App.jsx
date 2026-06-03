import { useEffect, useState } from "react";
import api from "./services/api";
import socket from "./services/socket";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import LinesPage from "./pages/LinesPage";
import BusesPage from "./pages/BusesPage";
import DashboardPage from "./pages/DashboardPage";
import DriversPage from "./pages/DriversPage";
import StopsPage from "./pages/StopsPage";
import "./App.css";

function App() {
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeHistory, setRouteHistory] = useState([]);
  const [selectedLine, setSelectedLine] = useState("Todas");
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  async function loadBuses() {
    try {
      const response = await api.get("/buses");
      setBuses(response.data);
    } catch (error) {
      console.error("Erro ao carregar ônibus no App:", error);
    }
  }

  async function loadStops() {
    try {
      const response = await api.get("/stops");
      setStops(response.data);
    } catch (error) {
      console.error("Erro ao carregar pontos no App:", error);
    }
  }

  useEffect(() => {
    if (!user) return;

    loadBuses();
    loadStops();

    socket.on("busLocationUpdate", (updatedBuses) => {
      setBuses(updatedBuses);
    });

    socket.on("routeHistoryUpdate", (data) => {
      setRouteHistory((previousHistory) => [
        ...previousHistory,
        data.point
      ]);
    });

    return () => {
      socket.off("busLocationUpdate");
      socket.off("routeHistoryUpdate");
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    if (currentPage === "map") {
      loadBuses();
      loadStops();
    }
  }, [currentPage, user]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setBuses([]);
    setStops([]);
    setRouteHistory([]);
    setCurrentPage("dashboard");
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
          <MapView
            buses={filteredBuses}
            stops={stops}
            routeHistory={routeHistory}
          />
        )}

        {currentPage === "lines" && <LinesPage />}

        {currentPage === "buses" && <BusesPage />}

        {currentPage === "drivers" && <DriversPage />}

        {currentPage === "stops" && <StopsPage />}
      </main>
    </div>
  );
}

export default App;