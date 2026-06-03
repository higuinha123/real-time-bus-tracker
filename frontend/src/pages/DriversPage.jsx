import { useEffect, useState } from "react";
import api from "../services/api";
import "./DriversPage.css";

function DriversPage() {
  const [drivers, setDrivers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [status, setStatus] = useState("Ativo");

  const [editingDriverId, setEditingDriverId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

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
    loadDrivers();
  }, []);

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  function formatPhone(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 11);

    if (numbers.length <= 2) {
      return numbers;
    }

    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }

  function formatLicense(value) {
    return value.replace(/\D/g, "").slice(0, 11);
  }

  function validateForm() {
    const onlyLetters = /^[A-Za-zÀ-ÿ\s]+$/;
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    const licenseRegex = /^\d{11}$/;

    if (name.trim().length < 3) {
      return "O nome precisa ter pelo menos 3 letras.";
    }

    if (!onlyLetters.test(name.trim())) {
      return "O nome deve conter apenas letras e espaços.";
    }

    if (!phoneRegex.test(phone)) {
      return "O telefone deve estar no formato (67) 99999-9999.";
    }

    if (!licenseRegex.test(license)) {
      return "A CNH deve ter exatamente 11 números.";
    }

    if (!["Ativo", "Afastado", "Inativo"].includes(status)) {
      return "Selecione um status válido.";
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

    const driverData = {
      name: name.trim(),
      phone,
      license,
      status
    };

    try {
      if (editingDriverId) {
        await api.put(`/drivers/${editingDriverId}`, driverData);
        showMessage("Motorista atualizado com sucesso!", "success");
      } else {
        await api.post("/drivers", driverData);
        showMessage("Motorista cadastrado com sucesso!", "success");
      }

      clearForm();
      await loadDrivers();

      setTimeout(() => {
        const table = document.querySelector(".table-card");
        if (table) {
          table.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao salvar motorista:", error);

      showMessage(
        error.response?.data?.message || "Erro ao salvar motorista.",
        "error"
      );
    }
  }

  function handleEdit(driver) {
    setEditingDriverId(driver.id);
    setName(driver.name);
    setPhone(driver.phone);
    setLicense(driver.license);
    setStatus(driver.status);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este motorista?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/drivers/${id}`);
      showMessage("Motorista excluído com sucesso!", "success");
      await loadDrivers();
    } catch (error) {
      console.error("Erro ao excluir motorista:", error);

      showMessage(
        error.response?.data?.message || "Erro ao excluir motorista.",
        "error"
      );
    }
  }

  function clearForm() {
    setEditingDriverId(null);
    setName("");
    setPhone("");
    setLicense("");
    setStatus("Ativo");
  }

  return (
    <div className="drivers-page">
      <div className="page-header">
        <div>
          <h1>Motoristas</h1>
          <p>Cadastre, edite e gerencie os motoristas do sistema.</p>
        </div>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <form className="driver-form" onSubmit={handleSubmit}>
        <h2>{editingDriverId ? "Editar Motorista" : "Novo Motorista"}</h2>

        <div className="form-grid">
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              placeholder="Ex: João Pereira"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="text"
              placeholder="(67) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              maxLength="15"
              required
            />
          </div>

          <div className="form-group">
            <label>CNH</label>
            <input
              type="text"
              placeholder="Digite os 11 números da CNH"
              value={license}
              onChange={(e) => setLicense(formatLicense(e.target.value))}
              maxLength="11"
              required
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Ativo">Ativo</option>
              <option value="Afastado">Afastado</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingDriverId ? "Atualizar" : "Cadastrar"}
          </button>

          {editingDriverId && (
            <button type="button" className="cancel-btn" onClick={clearForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-card">
        <h2>Motoristas cadastrados</h2>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>CNH</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.name}</td>
                <td>{driver.phone}</td>
                <td>{driver.license}</td>
                <td>
                  <span
                    className={`driver-status ${driver.status.toLowerCase()}`}
                  >
                    {driver.status}
                  </span>
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(driver)}
                  >
                    Editar
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(driver.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}

            {drivers.length === 0 && (
              <tr>
                <td colSpan="5">Nenhum motorista cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DriversPage;