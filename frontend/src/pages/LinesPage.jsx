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
    loadLines();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const lineData = {
      code,
      name,
      description
    };

    try {
      if (editingLineId) {
        await api.put(`/lines/${editingLineId}`, lineData);
        setMessage("Linha atualizada com sucesso!");
      } else {
        await api.post("/lines", lineData);
        setMessage("Linha criada com sucesso!");
      }

      clearForm();
      loadLines();
    } catch (error) {
      console.error("Erro ao salvar linha:", error);
      setMessage("Erro ao salvar linha.");
    }
  }

  function handleEdit(line) {
    setEditingLineId(line.id);
    setCode(line.code);
    setName(line.name);
    setDescription(line.description);
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir esta linha?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/lines/${id}`);
      setMessage("Linha excluída com sucesso!");
      loadLines();
    } catch (error) {
      console.error("Erro ao excluir linha:", error);
      setMessage("Erro ao excluir linha.");
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

      {message && <div className="message">{message}</div>}

      <form className="line-form" onSubmit={handleSubmit}>
        <h2>{editingLineId ? "Editar Linha" : "Nova Linha"}</h2>

        <div className="form-group">
          <label>Código da linha</label>
          <input
            type="text"
            placeholder="Ex: 070"
            value={code}
            onChange={(e) => setCode(e.target.value)}
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
            required
          />
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea
            placeholder="Ex: Linha que passa pela região do General Osório"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(line)}
                  >
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