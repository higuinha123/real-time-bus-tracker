import { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";
import MapView from "../components/MapView";
import "./MonitoringPage.css";

function MonitoringPage() {
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeHistory, setRouteHistory] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState("");
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  async function loadBuses() {
    try {
      const response = await api.get("/buses");
      setBuses(response.data);
    } catch (error) {
      console.error("Erro ao carregar ônibus:", error);
      setMessage("Erro ao carregar ônibus.");
    }
  }

  async function loadStops() {
    try {
      const response = await api.get("/stops");
      setStops(response.data);
    } catch (error) {
      console.error("Erro ao carregar pontos:", error);
      setMessage("Erro ao carregar pontos de parada.");
    }
  }

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function getSecondsSinceLastUpdate(bus) {
    if (!bus.lastUpdate) return null;

    const lastUpdateTime = new Date(bus.lastUpdate).getTime();
    const differenceInSeconds = Math.floor((currentTime - lastUpdateTime) / 1000);

    return differenceInSeconds;
  }

  function isBusOnline(bus) {
    const seconds = getSecondsSinceLastUpdate(bus);

    if (seconds === null) return false;

    return seconds <= 30;
  }

  function formatLastUpdate(bus) {
    const seconds = getSecondsSinceLastUpdate(bus);

    if (seconds === null) {
      return "Sem sinal";
    }

    if (seconds <= 1) {
      return "Agora";
    }

    if (seconds < 60) {
      return `Há ${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);

    return `Há ${minutes}min`;
  }

  const selectedBus = selectedBusId
    ? buses.find((bus) => bus.id === Number(selectedBusId))
    : null;

  const filteredBuses = selectedBus ? [selectedBus] : buses;

  const onlineBuses = buses.filter(isBusOnline);
  const offlineBuses = buses.filter((bus) => !isBusOnline(bus));

  return (
    <div className="monitoring-page">
      <div className="monitoring-header">
        <div>
          <h1>Monitoramento em Tempo Real</h1>
          <p>Acompanhe ônibus, motoristas, lotação e conexão dos veículos.</p>
        </div>

        <button
          className="refresh-btn"
          onClick={() => {
            loadBuses();
            loadStops();
          }}
        >
          Atualizar dados
        </button>
      </div>

      {message && <div className="message error">{message}</div>}

      <div className="monitoring-summary">
        <div className="summary-card">
          <span>Ônibus monitorados</span>
          <strong>{buses.length}</strong>
        </div>

        <div className="summary-card">
          <span>Online</span>
          <strong>{onlineBuses.length}</strong>
        </div>

        <div className="summary-card">
          <span>Offline</span>
          <strong>{offlineBuses.length}</strong>
        </div>

        <div className="summary-card">
          <span>Em operação</span>
          <strong>
            {buses.filter((bus) => bus.operationalStatus === "Em operação").length}
          </strong>
        </div>
      </div>

      <div className="monitoring-content">
        <section className="monitoring-map-card">
          <div className="map-card-header">
            <div>
              <h2>Mapa ao vivo</h2>
              <p>
                {selectedBus
                  ? `Visualizando ônibus ${selectedBus.plate}`
                  : "Visualizando todos os ônibus"}
              </p>
            </div>

            <select
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
            >
              <option value="">Todos os ônibus</option>

              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.plate} - {bus.line}
                </option>
              ))}
            </select>
          </div>

          <div className="monitoring-map-wrapper">
            <MapView
              buses={filteredBuses}
              stops={stops}
              routeHistory={routeHistory}
            />
          </div>
        </section>

        <aside className="monitoring-list-card">
          <h2>Ônibus ativos</h2>

          {buses.length === 0 && (
            <p className="empty-text">Nenhum ônibus cadastrado.</p>
          )}

          <div className="bus-monitoring-list">
            {buses.map((bus) => (
              <button
                key={bus.id}
                className={`monitoring-bus-card ${
                  Number(selectedBusId) === bus.id ? "selected" : ""
                }`}
                onClick={() => setSelectedBusId(String(bus.id))}
              >
                <div className="bus-card-top">
                  <strong>{bus.plate}</strong>

                  <span
                    className={`online-badge ${
                      isBusOnline(bus) ? "online" : "offline"
                    }`}
                  >
                    {isBusOnline(bus) ? "Online" : "Offline"}
                  </span>
                </div>

                <p>{bus.line}</p>

                <div className="bus-info-grid">
                  <span>Motorista</span>
                  <strong>{bus.driver?.name || "Sem motorista"}</strong>

                  <span>Lotação</span>
                  <strong>{bus.occupancy}</strong>

                  <span>Status operacional</span>
                  <strong>{bus.operationalStatus}</strong>

                  <span>Próxima parada</span>
                  <strong>{bus.nextStop}</strong>

                  <span>Última atualização</span>
                  <strong>{formatLastUpdate(bus)}</strong>
                </div>
              </button>
            ))}
          </div>

          {selectedBusId && (
            <button
              className="clear-selection-btn"
              onClick={() => setSelectedBusId("")}
            >
              Ver todos novamente
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

export default MonitoringPage;