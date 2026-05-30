import { useEffect, useState } from "react";
import api from "../services/api";
import "./BusesPage.css";

function BusesPage() {
  const [buses, setBuses] = useState([]);
  const [lines, setLines] = useState([]);

  const [lineId, setLineId] = useState("");
  const [plate, setPlate] = useState("");
  const [lat, setLat] = useState("-20.4697");
  const [lng, setLng] = useState("-54.6201");
  const [occupancy, setOccupancy] = useState("Normal");
  const [nextStop, setNextStop] = useState("");

  const [editingBusId, setEditingBusId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadBuses() {
    try {
      const response = await api.get("/buses");
      setBuses(response.data);
    } catch (error) {
      console.error("Erro ao carregar ônibus:", error);
      setMessage("Erro ao carregar ônibus.");
    }
  }

  async function loadLines() {
    try {
      const response = await api.get("/lines");
      setLines(response.data);
    } catch (error) {
      console.error("Erro ao carregar linhas:", error);
      setMessage("Erro ao carregar linhas.");
    }
  }

  useEffect(() => {
    loadBuses();
    loadLines();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const selectedLine = lines.find((line) => line.id === Number(lineId));

    if (!selectedLine) {
      setMessage("Selecione uma linha válida.");
      return;
    }

    const busData = {
      lineId: Number(lineId),
      line: `${selectedLine.code} - ${selectedLine.name}`,
      plate,
      lat: Number(lat),
      lng: Number(lng),
      occupancy,
      nextStop
    };

    try {
      if (editingBusId) {
        await api.put(`/buses/${editingBusId}`, busData);
        setMessage("Ônibus atualizado com sucesso!");
      } else {
        await api.post("/buses", busData);
        setMessage("Ônibus cadastrado com sucesso!");
      }

      clearForm();
      loadBuses();
    } catch (error) {
      console.error("Erro ao salvar ônibus:", error);
      setMessage("Erro ao salvar ônibus.");
    }
  }

  function handleEdit(bus) {
    setEditingBusId(bus.id);
    setLineId(String(bus.lineId));
    setPlate(bus.plate);
    setLat(String(bus.lat));
    setLng(String(bus.lng));
    setOccupancy(bus.occupancy);
    setNextStop(bus.nextStop);
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este ônibus?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/buses/${id}`);
      setMessage("Ônibus excluído com sucesso!");
      loadBuses();
    } catch (error) {
      console.error("Erro ao excluir ônibus:", error);
      setMessage("Erro ao excluir ônibus.");
    }
  }

  function clearForm() {
    setEditingBusId(null);
    setLineId("");
    setPlate("");
    setLat("-20.4697");
    setLng("-54.6201");
    setOccupancy("Normal");
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

      {message && <div className="message">{message}</div>}

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
            <label>Placa</label>
            <input
              type="text"
              placeholder="Ex: ABC-1234"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="form-group">
            <label>Latitude</label>
            <input
              type="number"
              step="any"
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
            <label>Próxima parada</label>
            <input
              type="text"
              placeholder="Ex: Praça Ary Coelho"
              value={nextStop}
              onChange={(e) => setNextStop(e.target.value)}
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
              <th>Placa</th>
              <th>Lotação</th>
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
                <td>{bus.plate}</td>
                <td>
                  <span className={`occupancy ${bus.occupancy.toLowerCase()}`}>
                    {bus.occupancy}
                  </span>
                </td>
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
                <td colSpan="7">Nenhum ônibus cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BusesPage;