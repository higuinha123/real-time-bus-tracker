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

  const menuItems = [
    {
      id: "dashboard",
      label: "Painel",
      icon: "📊",
      adminOnly: true
    },
    {
      id: "monitoring",
      label: "Monitoramento",
      icon: "📡",
      adminOnly: true
    },
    {
      id: "map",
      label: "Mapa",
      icon: "🗺️",
      adminOnly: false
    },
    {
      id: "lines",
      label: "Linhas",
      icon: "🧭",
      adminOnly: true
    },
    {
      id: "buses",
      label: "Ônibus",
      icon: "🚍",
      adminOnly: true
    },
    {
      id: "drivers",
      label: "Motoristas",
      icon: "👨‍✈️",
      adminOnly: true
    },
    {
      id: "stops",
      label: "Pontos",
      icon: "📍",
      adminOnly: true
    },

    {
        id: "history",
        label: "Histórico",
        icon: "🛣️",
       adminOnly: true
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && user.role !== "admin") return false;
    return true;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">🚌</div>

        <div className="brand-text">
          <h2>Bus Tracker</h2>
          <span>Painel de mobilidade</span>
        </div>
      </div>

      <div className="user-box">
        <div className="user-profile">
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="user-info">
            <strong>{user.name}</strong>
            <p>{user.role === "admin" ? "Administrador" : "Usuário comum"}</p>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          Sair da conta
        </button>
      </div>

      <nav className="sidebar-menu">
        {visibleMenuItems.map((item) => (
          <button
            key={item.id}
            className={currentPage === item.id ? "active" : ""}
            onClick={() => setCurrentPage(item.id)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {currentPage === "map" && (
        <section className="sidebar-panel">
          <div className="sidebar-section-title">
            <span>Filtros</span>
          </div>

          <label>Filtrar por linha</label>

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

          <div className="sidebar-section-title">
            <span>Ônibus ativos</span>
            <small>{buses.length}</small>
          </div>

          {buses.length === 0 && (
            <p className="sidebar-empty">Nenhum ônibus ativo no momento.</p>
          )}

          <div className="sidebar-bus-list">
            {buses.map((bus) => (
              <div className="bus-card" key={bus.id}>
                <div className="bus-card-header">
                  <strong>{bus.line}</strong>

                  <span
                    className={`mini-badge ${
                      bus.occupancy ? bus.occupancy.toLowerCase() : "normal"
                    }`}
                  >
                    {bus.occupancy}
                  </span>
                </div>

                <p>
                  <span>Placa</span>
                  {bus.plate}
                </p>

                <p>
                  <span>Próxima parada</span>
                  {bus.nextStop}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}

export default Sidebar;