import { useEffect, useState } from "react";
import api from "../services/api";
import "./LinesPage.css";

function LinesPage() {
  const [lines, setLines] = useState([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingLineId, setEditingLineId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

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
    loadLines();
  }, []);

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  function formatCode(value) {
    return value.replace(/\D/g, "").slice(0, 3);
  }

  function validateForm() {
    const codeRegex = /^\d{3}$/;
    const onlyLetters = /^[A-Za-zÀ-ÿ\s]+$/;

    if (!codeRegex.test(code)) {
      return "O código da linha deve ter exatamente 3 números. Exemplo: 070.";
    }

    if (name.trim().length < 3) {
      return "O nome da linha precisa ter pelo menos 3 letras.";
    }

    if (!onlyLetters.test(name.trim())) {
      return "O nome da linha deve conter apenas letras e espaços.";
    }

    if (description.trim().length < 5) {
      return "A descrição precisa ter pelo menos 5 caracteres.";
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

    const lineData = {
      code,
      name: name.trim(),
      description: description.trim()
    };

    try {
      if (editingLineId) {
        await api.put(`/lines/${editingLineId}`, lineData);
        showMessage("Linha atualizada com sucesso!", "success");
      } else {
        await api.post("/lines", lineData);
        showMessage("Linha criada com sucesso!", "success");
      }

      clearForm();
      await loadLines();
    } catch (error) {
      console.error("Erro ao salvar linha:", error);
      showMessage(
        error.response?.data?.message || "Erro ao salvar linha.",
        "error"
      );
    }
  }

  function handleEdit(line) {
    setEditingLineId(line.id);
    setCode(line.code);
    setName(line.name);
    setDescription(line.description);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir esta linha?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/lines/${id}`);
      showMessage("Linha excluída com sucesso!", "success");
      await loadLines();
    } catch (error) {
      console.error("Erro ao excluir linha:", error);
      showMessage(
        error.response?.data?.message || "Erro ao excluir linha.",
        "error"
      );
    }
  }

  function clearForm() {
    setEditingLineId(null);
    setCode("");
    setName("");
    setDescription("");
  }

  return (
    <div className="lines-page">
      <div className="page-header">
        <div>
          <h1>Linhas de Ônibus</h1>
          <p>Cadastre, edite e exclua linhas do sistema.</p>
        </div>
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <form className="line-form" onSubmit={handleSubmit}>
        <h2>{editingLineId ? "Editar Linha" : "Nova Linha"}</h2>

        <div className="form-group">
          <label>Código da linha</label>
          <input
            type="text"
            placeholder="Ex: 070"
            value={code}
            onChange={(e) => setCode(formatCode(e.target.value))}
            maxLength="3"
            required
          />
        </div>

        <div className="form-group">
          <label>Nome da linha</label>
          <input
            type="text"
            placeholder="Ex: General Osório"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength="3"
            required
          />
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea
            placeholder="Ex: Linha que passa pela região do General Osório"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength="5"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit">
            {editingLineId ? "Atualizar" : "Cadastrar"}
          </button>

          {editingLineId && (
            <button type="button" className="cancel-btn" onClick={clearForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-card">
        <h2>Linhas cadastradas</h2>

        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <td>{line.code}</td>
                <td>{line.name}</td>
                <td>{line.description}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(line)}>
                    Editar
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(line.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}

            {lines.length === 0 && (
              <tr>
                <td colSpan="4">Nenhuma linha cadastrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LinesPage;