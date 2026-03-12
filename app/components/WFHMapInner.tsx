// components/WFHMapInner.tsx
"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useMemo, useEffect } from "react";

type Absensi = {
  id: number;
  employeeId: number | string;
  name: string;
  departmentId: number | string;
  date: string;
  time: string;
  status: string;
  foto?: string;
  longitude: number;
  latitude: number;
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function FitBounds({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [bounds, map]);
  return null;
}

export default function WFHMapInner({ data }: { data: Absensi[] }) {
  const dataWFH = useMemo(
    () =>
      (data ?? []).filter(
        row =>
          row.status === "WFH" &&
          typeof row.latitude === "number" &&
          typeof row.longitude === "number"
      ),
    [data]
  );

  const center: [number, number] = useMemo(
    () =>
      dataWFH.length > 0
        ? [dataWFH[0].latitude, dataWFH[0].longitude]
        : [-6.225013, 107.009900],
    [dataWFH]
  );

  const bounds: [number, number][] = useMemo(
    () => dataWFH.map(row => [row.latitude, row.longitude] as [number, number]),
    [dataWFH]
  );

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: "100%", width: "100%", borderRadius: 12, minHeight: 200 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bounds.length > 0 && <FitBounds bounds={bounds} />}
      {dataWFH.map(row => (
        <Marker key={row.id} position={[row.latitude, row.longitude]}>
          <Popup>
            <div style={{ textAlign: "center", minWidth: 120 }}>
              <strong>{row.name}</strong>
              <br />
              Jam: {row.time} <br />
              {row.foto && (
                <img
                  src={row.foto}
                  alt="Absen"
                  style={{
                    width: 72,
                    height: 72,
                    objectFit: "cover",
                    display: "block",
                    margin: "8px auto 0",
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                />
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
