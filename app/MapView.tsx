
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import type { ComponentType, PropsWithChildren } from "react";
import type { Place } from "./places";

type MapContainerFixedProps = PropsWithChildren<{
  center: LatLngExpression;
  zoom: number;
  scrollWheelZoom: boolean;
  className: string;
}>;

const MapContainerFixed =
  MapContainer as ComponentType<MapContainerFixedProps>;

const beijingCenter: LatLngExpression = [39.9042, 116.4074];

const dayColors: Record<string, string> = {
  "3 января": "#e74c3c",
  "4 января": "#e67e22",
  "5 января": "#f1c40f",
  "6 января": "#3498db",
  "7 января": "#8e44ad",
  "8 января": "#16a085",
  "9 января": "#27ae60",
  "10 января": "#e84393",
  "11 января": "#795548",
  "Без даты": "#999999",
};

const knownPlaces = [
  {
    aliases: ["beijing daxing", "大兴国际机场", "北京大兴国际机场"],
    lat: 39.510561,
    lng: 116.429172,
  },
  {
    aliases: ["forbidden city", "故宫博物院", "запретный город"],
    lat: 39.917839,
    lng: 116.397029,
  },
  {
    aliases: ["shichahai", "什刹海"],
    lat: 39.941893,
    lng: 116.385121,
  },
  {
    aliases: ["yandai", "烟袋斜街"],
    lat: 39.939329,
    lng: 116.394748,
  },
  {
    aliases: ["modernista"],
    lat: 39.944562,
    lng: 116.399734,
  },
  {
    aliases: ["jingshan", "景山公园", "парк цзиншань"],
    lat: 39.925875,
    lng: 116.396551,
  },
  {
    aliases: ["mutianyu", "慕田峪长城", "мутяньюй"],
    lat: 40.431668,
    lng: 116.565052,
  },
  {
    aliases: ["prince gong", "恭王府", "резиденция князя гуна"],
    lat: 39.937222,
    lng: 116.386315,
  },
  {
    aliases: ["huguosi", "护国寺小吃", "хугоси"],
    lat: 39.935090,
    lng: 116.374870,
  },
];

// Переводим координаты AMap в формат, подходящий для OpenStreetMap.
function gcj02ToWgs84(lat: number, lng: number) {
  const pi = Math.PI;
  const a = 6378245.0;
  const ee = 0.00669342162296594323;

  function transformLat(x: number, y: number) {
    let result =
      -100 +
      2 * x +
      3 * y +
      0.2 * y * y +
      0.1 * x * y +
      0.2 * Math.sqrt(Math.abs(x));

    result +=
      ((20 * Math.sin(6 * x * pi) +
        20 * Math.sin(2 * x * pi)) *
        2) /
      3;

    result +=
      ((20 * Math.sin(y * pi) +
        40 * Math.sin((y / 3) * pi)) *
        2) /
      3;

    result +=
      ((160 * Math.sin((y / 12) * pi) +
        320 * Math.sin((y * pi) / 30)) *
        2) /
      3;

    return result;
  }

  function transformLng(x: number, y: number) {
    let result =
      300 +
      x +
      2 * y +
      0.1 * x * x +
      0.1 * x * y +
      0.1 * Math.sqrt(Math.abs(x));

    result +=
      ((20 * Math.sin(6 * x * pi) +
        20 * Math.sin(2 * x * pi)) *
        2) /
      3;

    result +=
      ((20 * Math.sin(x * pi) +
        40 * Math.sin((x / 3) * pi)) *
        2) /
      3;

    result +=
      ((150 * Math.sin((x / 12) * pi) +
        300 * Math.sin((x / 30) * pi)) *
        2) /
      3;

    return result;
  }

  const dLat = transformLat(lng - 105, lat - 35);
  const dLng = transformLng(lng - 105, lat - 35);

  const radLat = (lat / 180) * pi;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;

  const sqrtMagic = Math.sqrt(magic);

  const deltaLat =
    (dLat * 180) /
    (((a * (1 - ee)) / (magic * sqrtMagic)) * pi);

  const deltaLng =
    (dLng * 180) /
    ((a / sqrtMagic) * Math.cos(radLat) * pi);

  return {
    lat: lat - deltaLat,
    lng: lng - deltaLng,
  };
}

function getCoordinates(place: Place) {
  const searchText = [
    place.name,
    place.nameEn,
    place.nameZh,
  ]
    .join(" ")
    .toLowerCase();

  const match = knownPlaces.find((known) =>
    known.aliases.some((alias) =>
      searchText.includes(alias.toLowerCase())
    )
  );

  if (!match) return null;

  return gcj02ToWgs84(match.lat, match.lng);
}

function getMarkerIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

type MapViewProps = {
  places: Place[];
};

export default function MapView({ places }: MapViewProps) {
  const placesWithCoordinates = places
    .map((place) => ({
      place,
      coordinates: getCoordinates(place),
    }))
    .filter(
      (
        item
      ): item is {
        place: Place;
        coordinates: { lat: number; lng: number };
      } => item.coordinates !== null
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

        {placesWithCoordinates.map(({ place, coordinates }) => {
          const color = dayColors[place.day] || "#999999";

          return (
            <Marker
              key={place.id}
              position={[coordinates.lat, coordinates.lng]}
              icon={getMarkerIcon(color)}
            >
              <Popup>
                <strong>{place.name}</strong>
                <br />
                {place.day}
              </Popup>
            </Marker>
          );
        })}
      </MapContainerFixed>
    </div>
  );
}
