import { useEffect, useState } from "react";
import api from "../services/api";
import "./DashboardPage.css";

function DashboardPage() {
  const [buses, setBuses] = useState([]);
  const [lines, setLines] = useState([]);
  const [message, setMessage] = useState("");

  async function loadDashboardData() {
    try {
      const busesResponse = await api.get("/buses");
      const linesResponse = await api.get("/lines");

      setBuses(busesResponse.data);
      setLines(linesResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setMessage("Erro ao carregar informações do dashboard.");
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalBuses = buses.length;
  const totalLines = lines.length;
  const emptyBuses = buses.filter((bus) => bus.occupancy === "Vazio").length;
  const normalBuses = buses.filter((bus) => bus.occupancy === "Normal").length;
  const fullBuses = buses.filter((bus) => bus.occupancy === "Cheio").length;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral do sistema de rastreamento em tempo real.</p>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span>Ônibus cadastrados</span>
          <strong>{totalBuses}</strong>
        </div>

        <div className="dashboard-card">
          <span>Linhas cadastradas</span>
          <strong>{totalLines}</strong>
        </div>

        <div className="dashboard-card">
          <span>Vazios</span>
          <strong>{emptyBuses}</strong>
        </div>

        <div className="dashboard-card">
          <span>Normais</span>
          <strong>{normalBuses}</strong>
        </div>

        <div className="dashboard-card">
          <span>Cheios</span>
          <strong>{fullBuses}</strong>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Últimos ônibus cadastrados</h2>

        <div className="dashboard-table-card">
          <table>
            <thead>
              <tr>
                <th>Linha</th>
                <th>Placa</th>
                <th>Lotação</th>
                <th>Próxima parada</th>
              </tr>
            </thead>

            <tbody>
              {buses.slice(0, 5).map((bus) => (
                <tr key={bus.id}>
                  <td>{bus.line}</td>
                  <td>{bus.plate}</td>
                  <td>{bus.occupancy}</td>
                  <td>{bus.nextStop}</td>
                </tr>
              ))}

              {buses.length === 0 && (
                <tr>
                  <td colSpan="4">Nenhum ônibus cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;