import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const stopIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

function MapView({ buses, stops, routeHistory }) {
  return (
    <MapContainer
      center={[-20.4697, -54.6201]}
      zoom={14}
      className="map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {routeHistory && routeHistory.length > 1 && (
        <Polyline
          positions={routeHistory.map((point) => [point.lat, point.lng])}
          weight={5}
        />
      )}

      {stops.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.lat, stop.lng]}
          icon={stopIcon}
        >
          <Popup>
            <strong>📍 Ponto:</strong> {stop.name}
            <br />
            <strong>Linha:</strong>{" "}
            {stop.line
              ? `${stop.line.code} - ${stop.line.name}`
              : "Sem linha"}
            <br />
            <strong>Latitude:</strong> {stop.lat}
            <br />
            <strong>Longitude:</strong> {stop.lng}
          </Popup>
        </Marker>
      ))}

      {buses.map((bus) => (
        <Marker
          key={bus.id}
          position={[bus.lat, bus.lng]}
          icon={busIcon}
        >
          <Popup>
            <strong>🚌 Linha:</strong> {bus.line}
            <br />
            <strong>Placa:</strong> {bus.plate}
            <br />
            <strong>Motorista:</strong>{" "}
            {bus.driver?.name || "Sem motorista"}
            <br />
            <strong>Lotação:</strong> {bus.occupancy}
            <br />
            <strong>Status:</strong> {bus.operationalStatus}
            <br />
            <strong>Próxima parada:</strong> {bus.nextStop}
            <br />
            <strong>Latitude:</strong> {bus.lat}
            <br />
            <strong>Longitude:</strong> {bus.lng}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;