import { useEffect, useState } from "react";
import api from "../services/api";
import "./StopsPage.css";

function StopsPage() {
  const [stops, setStops] = useState([]);
  const [lines, setLines] = useState([]);

  const [name, setName] = useState("");
  const [lat, setLat] = useState("-20.4697");
  const [lng, setLng] = useState("-54.6201");
  const [lineId, setLineId] = useState("");

  const [editingStopId, setEditingStopId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  async function loadStops() {
    try {
      const response = await api.get("/stops");
      setStops(response.data);
    } catch (error) {
      console.error("Erro ao carregar pontos:", error);
      showMessage("Erro ao carregar pontos.", "error");
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

  useEffect(() => {
    loadStops();
    loadLines();
  }, []);

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  function validateForm() {
    const onlyLettersNumbers = /^[A-Za-zÀ-ÿ0-9\s.,ºª-]+$/;

    const latNumber = Number(lat);
    const lngNumber = Number(lng);

    if (name.trim().length < 3) {
      return "O nome do ponto precisa ter pelo menos 3 caracteres.";
    }

    if (!onlyLettersNumbers.test(name.trim())) {
      return "O nome do ponto contém caracteres inválidos.";
    }

    if (Number.isNaN(latNumber) || latNumber < -90 || latNumber > 90) {
      return "Latitude deve ser um número entre -90 e 90.";
    }

    if (Number.isNaN(lngNumber) || lngNumber < -180 || lngNumber > 180) {
      return "Longitude deve ser um número entre -180 e 180.";
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

    const stopData = {
      name: name.trim(),
      lat: Number(lat),
      lng: Number(lng),
      lineId: lineId ? Number(lineId) : null
    };

    try {
      if (editingStopId) {
        await api.put(`/stops/${editingStopId}`, stopData);
        showMessage("Ponto atualizado com sucesso!", "success");
      } else {
        await api.post("/stops", stopData);
        showMessage("Ponto cadastrado com sucesso!", "success");
      }

      clearForm();
      await loadStops();

      setTimeout(() => {
        const table = document.querySelector(".table-card");
        if (table) {
          table.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao salvar ponto:", error);

      showMessage(
        error.response?.data?.message || "Erro ao salvar ponto.",
        "error"
      );
    }
  }

  function handleEdit(stop) {
    setEditingStopId(stop.id);
    setName(stop.name);
    setLat(String(stop.lat));
    setLng(String(stop.lng));
    setLineId(stop.lineId ? String(stop.lineId) : "");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este ponto?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/stops/${id}`);
      showMessage("Ponto excluído com sucesso!", "success");
      await loadStops();
    } catch (error) {
      console.error("Erro ao excluir ponto:", error);

      showMessage(
        error.response?.data?.message || "Erro ao excluir ponto.",
        "error"
      );
    }
  }

  function clearForm() {
    setEditingStopId(null);
    setName("");
    setLat("-20.4697");
    setLng("-54.6201");
    setLineId("");
  }

  return (
    <div className="stops-page">
      <div className="page-header">
        <div>
          <h1>Pontos de Parada</h1>
          <p>Cadastre, edite e gerencie os pontos de parada do sistema.</p>
        </div>
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <form className="stop-form" onSubmit={handleSubmit}>
        <h2>{editingStopId ? "Editar Ponto" : "Novo Ponto"}</h2>

        <div className="form-grid">
          <div className="form-group">
            <label>Nome do ponto</label>
            <input
              type="text"
              placeholder="Ex: Terminal General Osório"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Linha vinculada</label>
            <select value={lineId} onChange={(e) => setLineId(e.target.value)}>
              <option value="">Nenhuma linha</option>

              {lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.code} - {line.name}
                </option>
              ))}
            </select>
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
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingStopId ? "Atualizar" : "Cadastrar"}
          </button>

          {editingStopId && (
            <button type="button" className="cancel-btn" onClick={clearForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-card">
        <h2>Pontos cadastrados</h2>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Linha</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {stops.map((stop) => (
              <tr key={stop.id}>
                <td>{stop.name}</td>
                <td>
                  {stop.line
                    ? `${stop.line.code} - ${stop.line.name}`
                    : "Sem linha"}
                </td>
                <td>{stop.lat}</td>
                <td>{stop.lng}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(stop)}>
                    Editar
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(stop.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}

            {stops.length === 0 && (
              <tr>
                <td colSpan="5">Nenhum ponto cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StopsPage;