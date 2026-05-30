function Sidebar({
  buses,
  selectedLine,
  setSelectedLine,
  user,
  onLogout,
  currentPage,
  setCurrentPage
}) {
  const lines = ["Todas", ...new Set(buses.map((bus) => bus.line))];

  return (
    <aside className="sidebar">
      <h2>Bus Tracker</h2>

      <div className="user-box">
        <strong>{user.name}</strong>
        <p>{user.role === "admin" ? "Administrador" : "Usuário comum"}</p>
        <button onClick={onLogout}>Sair</button>
      </div>

      <nav className="sidebar-menu">
        {user.role === "admin" && (
          <button
            className={currentPage === "dashboard" ? "active" : ""}
            onClick={() => setCurrentPage("dashboard")}
          >
            Dashboard
          </button>
        )}

        <button
          className={currentPage === "map" ? "active" : ""}
          onClick={() => setCurrentPage("map")}
        >
          Mapa
        </button>

        {user.role === "admin" && (
          <>
            <button
              className={currentPage === "lines" ? "active" : ""}
              onClick={() => setCurrentPage("lines")}
            >
              Linhas
            </button>

            <button
              className={currentPage === "buses" ? "active" : ""}
              onClick={() => setCurrentPage("buses")}
            >
              Ônibus
            </button>
          </>
        )}
      </nav>

      {currentPage === "map" && (
        <>
          <label>Filtrar por linha:</label>

          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
          >
            {lines.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>

          <h3>Ônibus ativos</h3>

          {buses.length === 0 && <p>Nenhum ônibus ativo no momento.</p>}

          {buses.map((bus) => (
            <div className="bus-card" key={bus.id}>
              <strong>{bus.line}</strong>
              <p>Placa: {bus.plate}</p>
              <p>Lotação: {bus.occupancy}</p>
              <p>Próxima parada: {bus.nextStop}</p>
            </div>
          ))}
        </>
      )}
    </aside>
  );
}

export default Sidebar;