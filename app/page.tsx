
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { placesData } from "./places-data";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="map-loading">Загружаем карту Пекина...</div>,
});

const days = [
  { name: "3 января", color: "#e74c3c" },
  { name: "4 января", color: "#e67e22" },
  { name: "5 января", color: "#f1c40f" },
  { name: "6 января", color: "#3498db" },
  { name: "7 января", color: "#8e44ad" },
  { name: "8 января", color: "#16a085" },
  { name: "9 января", color: "#27ae60" },
  { name: "10 января", color: "#e84393" },
  { name: "11 января", color: "#795548" },
  { name: "Без даты", color: "#999999" },
];

export default function Home() {
  const [activeDay, setActiveDay] = useState("Все дни");

  const filteredPlaces =
    activeDay === "Все дни"
      ? placesData
      : placesData.filter((place) => place.day === activeDay);

  return (
    <main className="app">
      <aside className="sidebar">
        <div className="header">
          <div className="eyebrow">JANUARY 2027</div>
          <h1>Пекин</h1>
          <p>Наше большое путешествие по Китаю</p>
          <div className="places-count">
            {filteredPlaces.length} мест
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
              <span
                className="dot"
                style={{ backgroundColor: day.color }}
              />
              {day.name}
            </button>
          ))}
        </div>

        <div className="places-list">
          {filteredPlaces.map((place) => (
            <div className="place-item" key={place.id}>
              <div className="place-item-top">
                <h3>{place.name}</h3>
                <span className="place-day">{place.day}</span>
              </div>
              <p>{place.nameEn}</p>
              <span className="place-category">{place.category}</span>
            </div>
          ))}

          {filteredPlaces.length === 0 && (
            <div className="empty">
              <h2>Пока здесь пусто</h2>
              <p>В этот день места ещё не распределены.</p>
            </div>
          )}
        </div>
      </aside>

      <section className="map-area">
        <MapView />
      </section>
    </main>
  );
}
