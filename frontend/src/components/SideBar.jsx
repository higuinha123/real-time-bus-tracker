function Sidebar({ buses, selectedLine, setSelectedLine }) {
  const lines = ["Todas", ...new Set(buses.map((bus) => bus.line))];

  return (
    <aside className="sidebar">
      <h2>Bus Tracker</h2>

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

      {buses.map((bus) => (
        <div className="bus-card" key={bus.id}>
          <strong>{bus.line}</strong>
          <p>Placa: {bus.plate}</p>
          <p>Lotação: {bus.occupancy}</p>
          <p>Próxima parada: {bus.nextStop}</p>
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;