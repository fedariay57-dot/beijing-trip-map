 "use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression, DivIcon } from "leaflet";
import L from "leaflet";
import type { ComponentType, PropsWithChildren } from "react";
import type { Place } from "./places";

const beijingCenter: LatLngExpression = [39.9042, 116.4074];

type FixedProps = PropsWithChildren<{
  center: LatLngExpression;
  zoom: number;
  scrollWheelZoom: boolean;
  className: string;
}>;

const FixedMap = MapContainer as ComponentType<FixedProps>;

const dayColors: Record<string, string> = {
  "3 января": "#e45b55", "4 января": "#e99a45", "5 января": "#d5b43e",
  "6 января": "#4c8fce", "7 января": "#9270bd", "8 января": "#36a69a",
  "9 января": "#58a66b", "10 января": "#d66a9c", "11 января": "#927c6d",
  "Без даты": "#888888",
};

const categoryIcons: Record<string, string> = {
  "транспорт": "🚇", "отель": "🏨", "еда": "🥢", "улицы и кварталы": "🏮",
  "история и храмы": "⛩️", "маленькие находки": "✨", "парки развлечений": "🎢",
  "аттракционы": "🎡", "музеи": "🏛️", "аквапарки": "🏊", "SPA и термы": "♨️",
  "шопинг": "🛍️", "парки": "🌳", "природа": "🌿", "архитектура и город": "🏙️",
  "бары": "🍸",
};

function markerIcon(place: Place, selected: boolean): DivIcon {
  const color = dayColors[place.day] || "#888";
  const symbol = categoryIcons[place.category] || "📍";
  return L.divIcon({
    className: "place-marker-wrap",
    html: `<div class="place-marker ${selected ? "is-selected" : ""}" style="--marker-color:${color}"><span>${symbol}</span></div>`,
    iconSize: [38, 46],
    iconAnchor: [19, 42],
    popupAnchor: [0, -38],
  });
}

function MapFocus({ place }: { place: Place | null }) {
  const map = useMap();
  useEffect(() => {
    if (place?.lat != null && place?.lng != null) {
      map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 15), { duration: 0.7 });
    }
  }, [place, map]);
  return null;
}

type Props = {
  places: Place[];
  selectedPlace: Place | null;
  onSelect: (place: Place) => void;
};

export default function MapView({ places, selectedPlace, onSelect }: Props) {
  const mappedPlaces = places.filter((p) => p.lat != null && p.lng != null);
  return (
    <div className="map-container">
      <FixedMap center={beijingCenter} zoom={11} scrollWheelZoom={true} className="leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocus place={selectedPlace} />
        {mappedPlaces.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat as number, place.lng as number]}
            icon={markerIcon(place, selectedPlace?.id === place.id)}
            eventHandlers={{ click: () => onSelect(place) }}
          >
            <Popup className="place-popup">
              <div className="popup-content">
                <strong>{place.name}</strong>
                <span>{place.nameEn}</span>
                <span className="popup-zh">{place.nameZh}</span>
                <p>{place.description}</p>
                {place.price && <b>Примерная цена: {place.price} ¥</b>}
                {place.amapUrl && <a href={place.amapUrl} target="_blank" rel="noreferrer">Открыть в AMap ↗</a>}
              </div>
            </Popup>
          </Marker>
        ))}
      </FixedMap>
      <div className="map-counter">{mappedPlaces.length} меток на карте · {places.length - mappedPlaces.length} без координат</div>
    </div>
  );
}
