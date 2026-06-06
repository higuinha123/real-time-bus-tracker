import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import api from "../services/api";
import "leaflet/dist/leaflet.css";
import "./HistoryPage.css";

const historyIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34]
});

function HistoryPage() {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState("");
  const [busInfo, setBusInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  async function loadBuses() {
    try {
      const response = await api.get("/buses");
      setBuses(response.data);
    } catch (error) {
      console.error("Erro ao carregar ônibus:", error);
      showMessage("Erro ao carregar ônibus.", "error");
    }
  }

  async function loadHistory(busId) {
    if (!busId) return;

    try {
      const response = await api.get(`/history/${busId}`);

      setBusInfo(response.data.bus);
      setHistory(response.data.history);

      if (response.data.history.length === 0) {
        showMessage("Este ônibus ainda não possui histórico.", "info");
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      showMessage(
        error.response?.data?.message || "Erro ao carregar histórico.",
        "error"
      );
    }
  }

  useEffect(() => {
    loadBuses();
  }, []);

  useEffect(() => {
    if (selectedBusId) {
      loadHistory(selectedBusId);
    } else {
      setBusInfo(null);
      setHistory([]);
    }
  }, [selectedBusId]);

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  async function handleClearHistory() {
    if (!selectedBusId) return;

    const confirmClear = window.confirm(
      "Tem certeza que deseja limpar o histórico deste ônibus?"
    );

    if (!confirmClear) return;

    try {
      await api.delete(`/history/${selectedBusId}`);

      setHistory([]);
      showMessage("Histórico limpo com sucesso.", "success");
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);

      showMessage(
        error.response?.data?.message || "Erro ao limpar histórico.",
        "error"
      );
    }
  }

  const positions = history.map((point) => [point.lat, point.lng]);

  const mapCenter =
    positions.length > 0
      ? positions[positions.length - 1]
      : [-20.4697, -54.6201];

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <h1>Histórico de Rotas</h1>
          <p>Visualize o trajeto percorrido pelos ônibus monitorados.</p>
        </div>

        <button
          className="history-refresh-btn"
          onClick={() => selectedBusId && loadHistory(selectedBusId)}
        >
          Atualizar histórico
        </button>
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <div className="history-controls">
        <div className="form-group">
          <label>Selecione o ônibus</label>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
          >
            <option value="">Escolha um ônibus</option>

            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.plate} - {bus.line}
              </option>
            ))}
          </select>
        </div>

        {selectedBusId && (
          <button className="clear-history-btn" onClick={handleClearHistory}>
            Limpar histórico
          </button>
        )}
      </div>

      {busInfo && (
        <div className="history-bus-summary">
          <div>
            <span>Placa</span>
            <strong>{busInfo.plate}</strong>
          </div>

          <div>
            <span>Linha</span>
            <strong>{busInfo.line}</strong>
          </div>

          <div>
            <span>Motorista</span>
            <strong>{busInfo.driver}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{busInfo.operationalStatus}</strong>
          </div>

          <div>
            <span>Pontos registrados</span>
            <strong>{history.length}</strong>
          </div>
        </div>
      )}

      <div className="history-content">
        <section className="history-map-card">
          <div className="history-map-header">
            <div>
              <h2>Trajeto no mapa</h2>
              <p>
                {history.length > 0
                  ? "A linha representa o caminho percorrido pelo ônibus."
                  : "Selecione um ônibus com histórico para visualizar o trajeto."}
              </p>
            </div>
          </div>

          <div className="history-map-wrapper">
            <MapContainer
              center={mapCenter}
              zoom={14}
              className="history-map"
              key={`${mapCenter[0]}-${mapCenter[1]}-${history.length}`}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {positions.length > 1 && (
                <Polyline positions={positions} weight={5} />
              )}

              {history.map((point, index) => (
                <Marker
                  key={point.id}
                  position={[point.lat, point.lng]}
                  icon={historyIcon}
                >
                  <Popup>
                    <strong>Ponto #{index + 1}</strong>
                    <br />
                    <strong>Latitude:</strong> {point.lat}
                    <br />
                    <strong>Longitude:</strong> {point.lng}
                    <br />
                    <strong>Lotação:</strong>{" "}
                    {point.occupancy || "Não informado"}
                    <br />
                    <strong>Data:</strong>{" "}
                    {new Date(point.createdAt).toLocaleString("pt-BR")}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </section>

        <aside className="history-list-card">
          <h2>Registros</h2>

          {history.length === 0 && (
            <p className="empty-text">
              Nenhum registro encontrado para este ônibus.
            </p>
          )}

          <div className="history-record-list">
            {history
              .slice()
              .reverse()
              .map((point, index) => (
                <div className="history-record" key={point.id}>
                  <div className="history-record-top">
                    <strong>Registro #{history.length - index}</strong>
                    <span>{point.occupancy || "Sem lotação"}</span>
                  </div>

                  <p>
                    <span>Latitude</span>
                    {point.lat}
                  </p>

                  <p>
                    <span>Longitude</span>
                    {point.lng}
                  </p>

                  <p>
                    <span>Data/Hora</span>
                    {new Date(point.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default HistoryPage;