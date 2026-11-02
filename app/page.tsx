"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { placesData } from "./places-data";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="map-loading">Загружаем карту Пекина...</div>,
});

const days = [
  { name: "3 января", color: "#E53935" },
  { name: "4 января", color: "#FB8C00" },
  { name: "5 января", color: "#FDD835" },
  { name: "6 января", color: "#1E88E5" },
  { name: "7 января", color: "#8E24AA" },
  { name: "8 января", color: "#00ACC1" },
  { name: "9 января", color: "#43A047" },
  { name: "10 января", color: "#EC407A" },
  { name: "11 января", color: "#795548" },
  { name: "Без даты", color: "#929292" },
];

export default function Home() {
  const [activeDay, setActiveDay] = useState("Все дни");
  const [search, setSearch] = useState("");

  const filteredPlaces = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return placesData.filter((place) => {
      const matchesDay =
        activeDay === "Все дни" || place.days.includes(activeDay);

      const searchable = [
        place.name,
        place.nameEn,
        place.nameZh,
        place.addressZh,
        place.category,
      ].join(" ").toLowerCase();

      return matchesDay && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [activeDay, search]);

  const mappedCount = filteredPlaces.filter(
    (place) => place.lat !== null && place.lng !== null
  ).length;

  return (
    <main className="app">
      <aside className="sidebar">
        <div className="header">
          <div className="eyebrow">JANUARY 2027</div>
          <h1>Пекин</h1>
          <p>Наше большое путешествие по Китаю</p>
          <div className="places-count">
            {filteredPlaces.length} мест · {mappedCount} на карте
          </div>
        </div>

        <div className="filters">
          <button
            className={activeDay === "Все дни" ? "active" : ""}
            onClick={() => setActiveDay("Все дни")}
          >
            Все дни
          </button>
          {days.map((day) => (
            <button
              key={day.name}
              className={activeDay === day.name ? "active" : ""}
              onClick={() => setActiveDay(day.name)}
            >
              <span className="dot" style={{ backgroundColor: day.color }} />
              {day.name}
            </button>
          ))}
        </div>

        <div style={{ padding: "0 16px 12px" }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Найти место на RU / EN / 中文"
            aria-label="Поиск по местам"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
              fontSize: 14,
            }}
          />
        </div>

        <div className="places-list">
          {filteredPlaces.map((place) => (
            <div className="place-item" key={place.id}>
              <div className="place-item-top">
                <h3>{place.name}</h3>
                <span className="place-day">{place.days.join(", ")}</span>
              </div>
              <p>{place.nameEn}</p>
              <span className="place-category">{place.category}</span>
              {place.lat === null || place.lng === null ? (
                <span style={{ display: "block", marginTop: 5, fontSize: 11, color: "#999" }}>
                  Координаты уточняются
                </span>
              ) : null}
            </div>
          ))}
          {filteredPlaces.length === 0 && (
            <div className="empty">
              <h2>Ничего не нашлось</h2>
              <p>Попробуй изменить запрос или выбрать другой день.</p>
            </div>
          )}
        </div>
      </aside>

      <section className="map-area">
        <MapView places={filteredPlaces} />
      </section>
    </main>
  );
}
