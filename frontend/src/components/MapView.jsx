import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

const stopIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

function MapView({ buses, stops }) {
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

      {stops.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.lat, stop.lng]}
          icon={stopIcon}
        >
          <Popup>
            <strong>Ponto:</strong> {stop.name}
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
            <strong>Linha:</strong> {bus.line} <br />
            <strong>Placa:</strong> {bus.plate} <br />
            <strong>Lotação:</strong> {bus.occupancy} <br />
            <strong>Próxima parada:</strong> {bus.nextStop}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;