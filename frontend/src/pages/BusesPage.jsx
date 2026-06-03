import { useEffect, useState } from "react";
import api from "../services/api";
import "./BusesPage.css";

function BusesPage() {
  const [buses, setBuses] = useState([]);
  const [lines, setLines] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [lineId, setLineId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [plate, setPlate] = useState("");
  const [lat, setLat] = useState("-20.4697");
  const [lng, setLng] = useState("-54.6201");
  const [occupancy, setOccupancy] = useState("Normal");
  const [operationalStatus, setOperationalStatus] = useState("Em operação");
  const [nextStop, setNextStop] = useState("");

  const [editingBusId, setEditingBusId] = useState(null);
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

  async function loadLines() {
    try {
      const response = await api.get("/lines");
      setLines(response.data);
    } catch (error) {
      console.error("Erro ao carregar linhas:", error);
      showMessage("Erro ao carregar linhas.", "error");
    }
  }

  async function loadDrivers() {
    try {
      const response = await api.get("/drivers");
      setDrivers(response.data);
    } catch (error) {
      console.error("Erro ao carregar motoristas:", error);
      showMessage("Erro ao carregar motoristas.", "error");
    }
  }

  useEffect(() => {
    loadBuses();
    loadLines();
    loadDrivers();
  }, []);

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  function formatPlate(value) {
    const cleanValue = value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 7);

    if (/^[A-Z]{3}\d{4}$/.test(cleanValue)) {
      return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
    }

    return cleanValue;
  }

  function validateForm() {
    const oldPlateRegex = /^[A-Z]{3}-\d{4}$/;
    const mercosulRegex = /^[A-Z]{3}\d[A-Z]\d{2}$/;

    const latNumber = Number(lat);
    const lngNumber = Number(lng);

    if (!lineId) {
      return "Selecione uma linha válida.";
    }

    if (!oldPlateRegex.test(plate) && !mercosulRegex.test(plate)) {
      return "Placa deve estar no formato ABC-1234 ou ABC1D23.";
    }

    if (Number.isNaN(latNumber) || latNumber < -90 || latNumber > 90) {
      return "Latitude deve ser um número entre -90 e 90.";
    }

    if (Number.isNaN(lngNumber) || lngNumber < -180 || lngNumber > 180) {
      return "Longitude deve ser um número entre -180 e 180.";
    }

    if (!["Vazio", "Normal", "Cheio"].includes(occupancy)) {
      return "Selecione uma lotação válida.";
    }

    if (
      !["Em operação", "Parado", "Manutenção", "Fora de serviço"].includes(
        operationalStatus
      )
    ) {
      return "Selecione um status operacional válido.";
    }

    if (nextStop.trim().length < 3) {
      return "Próxima parada precisa ter pelo menos 3 caracteres.";
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showMessage(validationError, "error");
      return;
    }

    const busData = {
      lineId: Number(lineId),
      driverId: driverId ? Number(driverId) : null,
      plate,
      lat: Number(lat),
      lng: Number(lng),
      occupancy,
      operationalStatus,
      nextStop: nextStop.trim()
    };

    try {
      if (editingBusId) {
        await api.put(`/buses/${editingBusId}`, busData);
        showMessage("Ônibus atualizado com sucesso!", "success");
      } else {
        await api.post("/buses", busData);
        showMessage("Ônibus cadastrado com sucesso!", "success");
      }

      clearForm();
      await loadBuses();

      setTimeout(() => {
        const table = document.querySelector(".table-card");
        if (table) {
          table.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao salvar ônibus:", error);

      showMessage(
        error.response?.data?.message || "Erro ao salvar ônibus.",
        "error"
      );
    }
  }

  function handleEdit(bus) {
    setEditingBusId(bus.id);
    setLineId(String(bus.lineId));
    setDriverId(bus.driverId ? String(bus.driverId) : "");
    setPlate(bus.plate);
    setLat(String(bus.lat));
    setLng(String(bus.lng));
    setOccupancy(bus.occupancy);
    setOperationalStatus(bus.operationalStatus || "Em operação");
    setNextStop(bus.nextStop);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este ônibus?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/buses/${id}`);
      showMessage("Ônibus excluído com sucesso!", "success");
      await loadBuses();
    } catch (error) {
      console.error("Erro ao excluir ônibus:", error);

      showMessage(
        error.response?.data?.message || "Erro ao excluir ônibus.",
        "error"
      );
    }
  }

  function clearForm() {
    setEditingBusId(null);
    setLineId("");
    setDriverId("");
    setPlate("");
    setLat("-20.4697");
    setLng("-54.6201");
    setOccupancy("Normal");
    setOperationalStatus("Em operação");
    setNextStop("");
  }

  return (
    <div className="buses-page">
      <div className="page-header">
        <div>
          <h1>Ônibus</h1>
          <p>Cadastre, edite e exclua ônibus do sistema.</p>
        </div>
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <form className="bus-form" onSubmit={handleSubmit}>
        <h2>{editingBusId ? "Editar Ônibus" : "Novo Ônibus"}</h2>

        <div className="form-grid">
          <div className="form-group">
            <label>Linha</label>
            <select
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              required
            >
              <option value="">Selecione uma linha</option>

              {lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.code} - {line.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Motorista</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
            >
              <option value="">Nenhum motorista</option>

              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Placa</label>
            <input
              type="text"
              placeholder="ABC-1234 ou ABC1D23"
              value={plate}
              onChange={(e) => setPlate(formatPlate(e.target.value))}
              maxLength="8"
              required
            />
          </div>

          <div className="form-group">
            <label>Latitude</label>
            <input
              type="number"
              step="any"
              min="-90"
              max="90"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <input
              type="number"
              step="any"
              min="-180"
              max="180"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Lotação</label>
            <select
              value={occupancy}
              onChange={(e) => setOccupancy(e.target.value)}
              required
            >
              <option value="Vazio">Vazio</option>
              <option value="Normal">Normal</option>
              <option value="Cheio">Cheio</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status operacional</label>
            <select
              value={operationalStatus}
              onChange={(e) => setOperationalStatus(e.target.value)}
              required
            >
              <option value="Em operação">Em operação</option>
              <option value="Parado">Parado</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Fora de serviço">Fora de serviço</option>
            </select>
          </div>

          <div className="form-group">
            <label>Próxima parada</label>
            <input
              type="text"
              placeholder="Ex: Praça Ary Coelho"
              value={nextStop}
              onChange={(e) => setNextStop(e.target.value)}
              minLength="3"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingBusId ? "Atualizar" : "Cadastrar"}
          </button>

          {editingBusId && (
            <button type="button" className="cancel-btn" onClick={clearForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-card">
        <h2>Ônibus cadastrados</h2>

        <table>
          <thead>
            <tr>
              <th>Linha</th>
              <th>Motorista</th>
              <th>Placa</th>
              <th>Lotação</th>
              <th>Status</th>
              <th>Próxima parada</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {buses.map((bus) => (
              <tr key={bus.id}>
                <td>{bus.line}</td>
                <td>{bus.driver?.name || "Sem motorista"}</td>
                <td>{bus.plate}</td>
                <td>
                  <span className={`occupancy ${bus.occupancy.toLowerCase()}`}>
                    {bus.occupancy}
                  </span>
                </td>
                <td>{bus.operationalStatus || "Em operação"}</td>
                <td>{bus.nextStop}</td>
                <td>{bus.lat}</td>
                <td>{bus.lng}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(bus)}
                  >
                    Editar
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(bus.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}

            {buses.length === 0 && (
              <tr>
                <td colSpan="9">Nenhum ônibus cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BusesPage;