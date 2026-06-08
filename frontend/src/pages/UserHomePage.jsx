import { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";
import MapView from "../components/MapView";
import "./UserHomePage.css";

function UserHomePage({ user, onLogout }) {
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedLine, setSelectedLine] = useState("Todas");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  async function loadBuses() {
    try {
      const response = await api.get("/buses");
      setBuses(response.data);
    } catch (error) {
      console.error("Erro ao carregar ônibus:", error);
      setMessage("Não foi possível carregar os ônibus agora.");
    }
  }

  async function loadStops() {
    try {
      const response = await api.get("/stops");
      setStops(response.data);
    } catch (error) {
      console.error("Erro ao carregar pontos:", error);
      setMessage("Não foi possível carregar os pontos de parada agora.");
    }
  }

  useEffect(() => {
    loadBuses();
    loadStops();

    socket.on("busLocationUpdate", (updatedBuses) => {
      setBuses(updatedBuses);
    });

    return () => {
      socket.off("busLocationUpdate");
    };
  }, []);

  const availableLines = [
    "Todas",
    ...new Set(buses.map((bus) => bus.line).filter(Boolean))
  ];

  const filteredBuses = buses.filter((bus) => {
    const matchesLine =
      selectedLine === "Todas" || bus.line === selectedLine;

    const searchText = search.toLowerCase();

    const matchesSearch =
      bus.line?.toLowerCase().includes(searchText) ||
      bus.plate?.toLowerCase().includes(searchText) ||
      bus.nextStop?.toLowerCase().includes(searchText);

    return matchesLine && matchesSearch;
  });

  const filteredStops =
    selectedLine === "Todas"
      ? stops
      : stops.filter((stop) => {
          const stopLine = stop.line
            ? `${stop.line.code} - ${stop.line.name}`
            : "";

          return stopLine === selectedLine;
        });

  function getBusSignal(bus) {
    if (!bus.lastUpdate) return "Offline";

    const lastUpdate = new Date(bus.lastUpdate).getTime();
    const now = Date.now();
    const seconds = (now - lastUpdate) / 1000;

    return seconds <= 30 ? "Online" : "Offline";
  }

  return (
    <div className="user-home-page">
      <header className="user-hero">
        <div>
          <span className="user-eyebrow">Bus Tracker</span>
          <h1>Olá, {user.name}</h1>
          <p>
            Acompanhe a localização dos ônibus em tempo real, veja a lotação
            e consulte a próxima parada.
          </p>
        </div>

        <button className="user-logout-btn" onClick={onLogout}>
          Sair
        </button>
      </header>

      {message && <div className="message error">{message}</div>}

      <section className="user-search-card">
        <div className="user-search-title">
          <h2>Encontre sua linha</h2>
          <p>Busque por linha, placa ou próxima parada.</p>
        </div>

        <div className="user-filters">
          <input
            type="text"
            placeholder="Ex: 205, Nova Bahia, Terminal Centro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
          >
            {availableLines.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="user-stats-grid">
        <div className="user-stat-card">
          <span>Ônibus visíveis</span>
          <strong>{filteredBuses.length}</strong>
        </div>

        <div className="user-stat-card">
          <span>Linhas disponíveis</span>
          <strong>{availableLines.length - 1}</strong>
        </div>

        <div className="user-stat-card">
          <span>Pontos exibidos</span>
          <strong>{filteredStops.length}</strong>
        </div>

        <div className="user-stat-card">
          <span>Online agora</span>
          <strong>
            {filteredBuses.filter((bus) => getBusSignal(bus) === "Online").length}
          </strong>
        </div>
      </section>

      <main className="user-content">
        <section className="user-map-card">
          <div className="user-section-header">
            <div>
              <h2>Mapa em tempo real</h2>
              <p>
                {selectedLine === "Todas"
                  ? "Mostrando todos os ônibus disponíveis."
                  : `Mostrando a linha ${selectedLine}.`}
              </p>
            </div>
          </div>

          <div className="user-map-wrapper">
            <MapView
              buses={filteredBuses}
              stops={filteredStops}
              routeHistory={[]}
            />
          </div>
        </section>

        <aside className="user-bus-panel">
          <div className="user-section-header">
            <div>
              <h2>Ônibus encontrados</h2>
              <p>Veja a situação atual dos veículos.</p>
            </div>
          </div>

          {filteredBuses.length === 0 && (
            <p className="user-empty">
              Nenhum ônibus encontrado com esses filtros.
            </p>
          )}

          <div className="user-bus-list">
            {filteredBuses.map((bus) => (
              <article className="user-bus-card" key={bus.id}>
                <div className="user-bus-top">
                  <div>
                    <strong>{bus.line}</strong>
                    <span>Placa {bus.plate}</span>
                  </div>

                  <span
                    className={`user-signal-badge ${
                      getBusSignal(bus) === "Online" ? "online" : "offline"
                    }`}
                  >
                    {getBusSignal(bus)}
                  </span>
                </div>

                <div className="user-bus-details">
                  <div>
                    <span>Lotação</span>
                    <strong>{bus.occupancy}</strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>{bus.operationalStatus}</strong>
                  </div>

                  <div>
                    <span>Próxima parada</span>
                    <strong>{bus.nextStop}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default UserHomePage;