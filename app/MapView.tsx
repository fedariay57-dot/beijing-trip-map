"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression, DivIcon } from "leaflet";
import L from "leaflet";
import type { ComponentType, PropsWithChildren } from "react";
import type { Place } from "./places";

const beijingCenter: LatLngExpression = [39.9042, 116.4074];

type MapContainerFixedProps = PropsWithChildren<{
  center: LatLngExpression;
  zoom: number;
  scrollWheelZoom: boolean;
  className: string;
}>;

const MapContainerFixed =
  MapContainer as ComponentType<MapContainerFixedProps>;

type MapViewProps = {
  places: Place[];
};

const dayColors: Record<string, string> = {
  "3 января": "#E53935",
  "4 января": "#FB8C00",
  "5 января": "#FDD835",
  "6 января": "#1E88E5",
  "7 января": "#8E24AA",
  "8 января": "#00ACC1",
  "9 января": "#43A047",
  "10 января": "#EC407A",
  "11 января": "#795548",
  "Без даты": "#929292",
};

const categoryIcons: Record<string, string> = {
  "транспорт": "🚇",
  "отель": "🏨",
  "еда": "🥢",
  "улицы и кварталы": "🏮",
  "история и храмы": "⛩️",
  "маленькие находки": "✨",
  "парки развлечений": "🎢",
  "аттракционы": "🎡",
  "музеи": "🏛️",
  "аквапарки": "🏊",
  "SPA и термы": "♨️",
  "шопинг": "🛍️",
  "парки": "🌳",
  "природа": "🌿",
  "архитектура и город": "🏙️",
};

function makeMarkerIcon(place: Place): DivIcon {
  const color = dayColors[place.day] || "#777777";
  const symbol = categoryIcons[place.category] || "📍";

  return L.divIcon({
    className: "custom-place-marker",
    html: `<div style="
      width:34px;height:34px;border-radius:50% 50% 50% 8px;
      transform:rotate(-45deg);background:${color};
      border:2px solid #fff;box-shadow:0 2px 8px #0005;
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:16px;line-height:1">${symbol}</span></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 34],
    popupAnchor: [0, -32],
  });
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
}

export default function MapView({ places }: MapViewProps) {
  const mappedPlaces = places.filter(
    (place) => place.lat !== null && place.lng !== null
  );

  return (
    <div className="map-container">
      <MapContainerFixed
        center={beijingCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mappedPlaces.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat as number, place.lng as number]}
            icon={makeMarkerIcon(place)}
          >
            <Popup minWidth={250} maxWidth={290}>
              <div style={{ fontFamily: "Arial, sans-serif", color: "#252525" }}>
                <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25, marginBottom: 4 }}>
                  {place.name}
                </div>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 7 }}>
                  {place.nameEn}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                  <span style={{ fontSize: 15 }}>{place.nameZh}</span>
                  <button
                    type="button"
                    onClick={() => copyText(place.nameZh)}
                    style={{ border: "1px solid #ddd", borderRadius: 6, padding: "4px 7px", background: "#fff", cursor: "pointer", fontSize: 11 }}
                  >
                    Копировать
                  </button>
                </div>
                {place.addressZh && (
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                    {place.addressZh}
                    <button
                      type="button"
                      onClick={() => copyText(place.addressZh)}
                      style={{ display: "block", marginTop: 4, border: "1px solid #ddd", borderRadius: 6, padding: "4px 7px", background: "#fff", cursor: "pointer", fontSize: 11 }}
                    >
                      Копировать адрес
                    </button>
                  </div>
                )}
                {place.description && (
                  <p style={{ fontSize: 13, lineHeight: 1.4, margin: "7px 0" }}>
                    {place.description}
                  </p>
                )}
                {place.price && (
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 7 }}>
                    Цена: {place.price}
                  </div>
                )}
                <div style={{ marginTop: 9, fontSize: 11, color: "#777" }}>
                  {place.days.join(" · ")} · {place.category}
                </div>
                {!place.lat || !place.lng ? null : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainerFixed>

      <div style={{
        position: "absolute", zIndex: 500, left: 12, bottom: 12,
        padding: "7px 10px", borderRadius: 8, background: "#fff",
        boxShadow: "0 1px 6px #0002", fontSize: 12, color: "#444"
      }}>
        На карте: {mappedPlaces.length} из {places.length} мест
      </div>
    </div>
  );
}
