import { useEffect, useState } from "react";
import api from "../services/api";
import "./DashboardPage.css";

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [message, setMessage] = useState("");

  async function loadDashboardData() {
    try {
      const response = await api.get("/dashboard/stats");
      setDashboard(response.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setMessage("Erro ao carregar informações do dashboard.");
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (!dashboard) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Carregando informações do sistema...</p>
          </div>
        </div>

        {message && <div className="message error">{message}</div>}
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard Administrativo</h1>
          <p>Visão geral do sistema de rastreamento em tempo real.</p>
        </div>
      </div>

      {message && <div className="message error">{message}</div>}

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span>Ônibus cadastrados</span>
          <strong>{dashboard.totals.buses}</strong>
        </div>

        <div className="dashboard-card">
          <span>Linhas cadastradas</span>
          <strong>{dashboard.totals.lines}</strong>
        </div>

        <div className="dashboard-card">
          <span>Motoristas</span>
          <strong>{dashboard.totals.drivers}</strong>
        </div>

        <div className="dashboard-card">
          <span>Pontos de parada</span>
          <strong>{dashboard.totals.stops}</strong>
        </div>
      </div>

      <div className="dashboard-section-grid">
        <div className="dashboard-section">
          <h2>Lotação dos ônibus</h2>

          <div className="mini-stats">
            <div>
              <span>Vazios</span>
              <strong>{dashboard.occupancy.vazio}</strong>
            </div>

            <div>
              <span>Normais</span>
              <strong>{dashboard.occupancy.normal}</strong>
            </div>

            <div>
              <span>Cheios</span>
              <strong>{dashboard.occupancy.cheio}</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Status operacional</h2>

          <div className="mini-stats">
            <div>
              <span>Em operação</span>
              <strong>{dashboard.operationalStatus.emOperacao}</strong>
            </div>

            <div>
              <span>Parados</span>
              <strong>{dashboard.operationalStatus.parado}</strong>
            </div>

            <div>
              <span>Manutenção</span>
              <strong>{dashboard.operationalStatus.manutencao}</strong>
            </div>

            <div>
              <span>Fora de serviço</span>
              <strong>{dashboard.operationalStatus.foraDeServico}</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Status dos motoristas</h2>

          <div className="mini-stats">
            <div>
              <span>Ativos</span>
              <strong>{dashboard.driverStatus.ativo}</strong>
            </div>

            <div>
              <span>Afastados</span>
              <strong>{dashboard.driverStatus.afastado}</strong>
            </div>

            <div>
              <span>Inativos</span>
              <strong>{dashboard.driverStatus.inativo}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Últimos ônibus cadastrados</h2>

        <div className="dashboard-table-card">
          <table>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Linha</th>
                <th>Motorista</th>
                <th>Lotação</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.latest.buses.map((bus) => (
                <tr key={bus.id}>
                  <td>{bus.plate}</td>
                  <td>{bus.line}</td>
                  <td>{bus.driver}</td>
                  <td>{bus.occupancy}</td>
                  <td>{bus.operationalStatus}</td>
                </tr>
              ))}

              {dashboard.latest.buses.length === 0 && (
                <tr>
                  <td colSpan="5">Nenhum ônibus cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Últimos motoristas cadastrados</h2>

        <div className="dashboard-table-card">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>CNH</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.latest.drivers.map((driver) => (
                <tr key={driver.id}>
                  <td>{driver.name}</td>
                  <td>{driver.phone}</td>
                  <td>{driver.license}</td>
                  <td>{driver.status}</td>
                </tr>
              ))}

              {dashboard.latest.drivers.length === 0 && (
                <tr>
                  <td colSpan="4">Nenhum motorista cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Últimas localizações recebidas</h2>

        <div className="dashboard-table-card">
          <table>
            <thead>
              <tr>
                <th>Ônibus</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Lotação</th>
                <th>Data/Hora</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.latest.locations.map((location) => (
                <tr key={location.id}>
                  <td>{location.plate}</td>
                  <td>{location.lat}</td>
                  <td>{location.lng}</td>
                  <td>{location.occupancy || "Não informado"}</td>
                  <td>{new Date(location.createdAt).toLocaleString("pt-BR")}</td>
                </tr>
              ))}

              {dashboard.latest.locations.length === 0 && (
                <tr>
                  <td colSpan="5">Nenhuma localização recebida ainda.</td>
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