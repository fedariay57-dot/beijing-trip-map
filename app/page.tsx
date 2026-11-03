
"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import {
  Search,
  X,
  MapPin,
  Copy,
  ExternalLink,
  SlidersHorizontal,
  LocateFixed,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { placesData } from "./places-data";
import type { Place } from "./places";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="map-loading">Загружаем карту Пекина...</div>,
});

const days = [
  "Все дни", "3 января", "4 января", "5 января", "6 января",
  "7 января", "8 января", "9 января", "10 января", "11 января", "Без даты"
];

const categoryIcons: Record<string, string> = {
  "транспорт": "🚇",
  "отель": "🏨",
  "еда": "🥢",
  "улицы и кварталы": "🏮",
  "история и храмы": "⛩️",
  "музеи": "🏛️",
  "аквапарки": "🏊",
  "SPA и термы": "♨️",
  "шопинг": "🛍️",
  "парки": "🌳",
  "природа": "🌿",
  "архитектура и город": "🏙️",
  "бары": "🍸",
  "парки развлечений": "🎢",
  "аттракционы": "🎡"
};

type MobilePanelState = "collapsed" | "list" | "detail";

export default function Home() {
  const [activeDay, setActiveDay] = useState("Все дни");
  const [activeCategory, setActiveCategory] = useState("Все категории");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Place | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [onlyMapped, setOnlyMapped] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanelState>("collapsed");

  const touchStartY = useRef<number | null>(null);
  const skipHandleClick = useRef(false);

  const categories = useMemo(
    () => [
      "Все категории",
      ...Array.from(
        new Set(placesData.map(p => p.category).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, "ru"))
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();

    return placesData.filter(p => {
      const dayOk = activeDay === "Все дни" || p.days.includes(activeDay);
      const categoryOk =
        activeCategory === "Все категории" || p.category === activeCategory;

      const queryOk =
        !q ||
        [p.name, p.nameEn, p.nameZh, p.addressZh, p.category]
          .join(" ")
          .toLocaleLowerCase()
          .includes(q);

      const mapOk = !onlyMapped || (p.lat != null && p.lng != null);

      return dayOk && categoryOk && queryOk && mapOk;
    });
  }, [activeDay, activeCategory, search, onlyMapped]);

  const mappedCount = filtered.filter(
    p => p.lat != null && p.lng != null
  ).length;

  const selectPlace = (place: Place) => {
    setSelected(place);
    setMobilePanel("detail");
  };

  const closeSelected = () => {
    setSelected(null);
    setMobilePanel("list");
  };

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Буфер обмена может быть недоступен в некоторых браузерах.
    }
  };

  const cycleMobilePanel = () => {
    if (mobilePanel === "collapsed") {
      setMobilePanel("list");
    } else if (mobilePanel === "list") {
      setMobilePanel(selected ? "detail" : "collapsed");
    } else {
      setMobilePanel("list");
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    touchStartY.current = event.clientY;
    skipHandleClick.current = false;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (touchStartY.current === null) return;

    const difference = event.clientY - touchStartY.current;
    touchStartY.current = null;

    if (Math.abs(difference) < 35) return;

    skipHandleClick.current = true;

    if (difference < 0) {
      // Движение вверх: раскрываем панель.
      setMobilePanel(selected ? "detail" : "list");
    } else {
      // Движение вниз: сворачиваем панель.
      if (mobilePanel === "detail") {
        setMobilePanel("list");
      } else {
        setMobilePanel("collapsed");
      }
    }
  };

  const handlePointerCancel = () => {
    touchStartY.current = null;
  };

  const resetFilters = () => {
    setActiveDay("Все дни");
    setActiveCategory("Все категории");
    setSearch("");
    setOnlyMapped(false);
  };

  return (
    <main className="app-shell">
      <aside className={`sidebar mobile-sheet--${mobilePanel}`}>
        <button
          className="mobile-sheet-handle"
          onClick={() => {
            if (skipHandleClick.current) {
              skipHandleClick.current = false;
              return;
            }
            cycleMobilePanel();
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          aria-label="Изменить высоту панели"
        >
          <span className="sheet-grabber" />
          <span className="sheet-handle-content">
            <span>
              {mobilePanel === "detail" && selected
                ? selected.name
                : `Места · ${filtered.length} найдено`}
            </span>
            {mobilePanel === "collapsed" ? (
              <ChevronUp size={19} />
            ) : (
              <ChevronDown size={19} />
            )}
          </span>
        </button>

        <header className="sidebar-header">
          <div className="eyebrow">JANUARY 2027 · TRIP PLANNER</div>
          <div className="heading-row">
            <div>
              <h1>Пекин</h1>
              <p>Карта нашего путешествия</p>
            </div>
            <div className="total-badge">
              <strong>{placesData.length}</strong>
              <span>мест</span>
            </div>
          </div>
        </header>

        <div className="search-box">
          <Search size={19} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Найти место на трёх языках..."
          />
          {search && (
            <button
              className="icon-button"
              onClick={() => setSearch("")}
              aria-label="Очистить поиск"
            >
              <X size={17} />
            </button>
          )}
        </div>

        <section className="filter-section">
          <div className="section-heading">
            <span>Дни поездки</span>
            <button
              className="text-button"
              onClick={() => setActiveDay("Все дни")}
            >
              Сбросить
            </button>
          </div>
          <div className="day-filters">
            {days.map(day => (
              <button
                key={day}
                className={`day-chip ${activeDay === day ? "active" : ""}`}
                onClick={() => setActiveDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-section">
          <button
            className="section-heading filter-toggle"
            onClick={() => setShowFilters(v => !v)}
          >
            <span>
              <SlidersHorizontal size={15} />
              Категории и отображение
            </span>
            <span>{showFilters ? "−" : "+"}</span>
          </button>

          {showFilters && (
            <div className="advanced-filters">
              <label className="select-label">Категория</label>
              <select
                value={activeCategory}
                onChange={e => setActiveCategory(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={onlyMapped}
                  onChange={e => setOnlyMapped(e.target.checked)}
                />
                Только места с метками на карте
              </label>
            </div>
          )}
        </section>

        {selected && (
          <section className="selected-card">
            <div className="selected-top">
              <span className="selected-label">ВЫБРАННОЕ МЕСТО</span>
              <button
                className="icon-button"
                onClick={closeSelected}
                aria-label="Вернуться к списку"
                title="Вернуться к списку"
              >
                <ArrowLeft size={17} />
              </button>
            </div>

            <h2>{selected.name}</h2>
            <p className="english-name">{selected.nameEn}</p>

            <div className="chinese-row">
              <span>{selected.nameZh}</span>
              <button
                onClick={() => copyText(selected.nameZh)}
                title="Скопировать китайское название"
              >
                <Copy size={15} />
              </button>
            </div>

            {selected.addressZh && (
              <div className="chinese-row address-row">
                <span>{selected.addressZh}</span>
                <button
                  onClick={() => copyText(selected.addressZh)}
                  title="Скопировать адрес"
                >
                  <Copy size={15} />
                </button>
              </div>
            )}

            <p className="selected-description">{selected.description}</p>

            {selected.price && (
              <p className="price-line">
                Примерная цена: <b>{selected.price} ¥</b>
              </p>
            )}

            <div className="selected-meta">
              <span>{selected.days.join(" · ")}</span>
              <span>
                {categoryIcons[selected.category] || "📍"} {selected.category}
              </span>
            </div>

            {selected.lat == null || selected.lng == null ? (
              <div className="no-coordinates">
                <MapPin size={16} />
                Точная метка пока не установлена. Открой место в AMap, чтобы
                посмотреть расположение.
              </div>
            ) : (
              <div className="coordinate-note">
                <LocateFixed size={15} />
                Метка есть на карте
              </div>
            )}

            {selected.amapUrl && (
              <a
                className="amap-button"
                href={selected.amapUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={16} />
                Открыть в AMap
              </a>
            )}
          </section>
        )}

        <div className="results-heading">
          <div>
            <strong>Места</strong>
            <span>{filtered.length} найдено · {mappedCount} на карте</span>
          </div>
          <button className="text-button" onClick={resetFilters}>
            Сбросить всё
          </button>
        </div>

        <div className="places-results">
          {filtered.map(place => (
            <button
              key={place.id}
              className={`result-item ${
                selected?.id === place.id ? "selected" : ""
              }`}
              onClick={() => selectPlace(place)}
            >
              <span className="result-icon">
                {categoryIcons[place.category] || "📍"}
              </span>

              <span className="result-copy">
                <strong>{place.name}</strong>
                <small>{place.nameEn}</small>
                <span className="result-tags">
                  {place.days.join(" · ")} <i>·</i> {place.category}
                </span>
              </span>

              <span
                className={`pin-status ${
                  place.lat != null && place.lng != null ? "has-pin" : ""
                }`}
                title={
                  place.lat != null && place.lng != null
                    ? "Есть метка"
                    : "Координаты не найдены"
                }
              >
                <MapPin size={15} />
              </span>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="empty-results">
              Ничего не найдено. Попробуй другое название или сбрось фильтры.
            </div>
          )}
        </div>

        <footer className="sidebar-footer">
          <span>
            <i className="legend-dot mapped" /> Метка установлена
          </span>
          <span>
            <i className="legend-dot missing" /> Нет координат
          </span>
        </footer>
      </aside>

      <section className="map-panel">
        <MapView
          places={filtered}
          selectedPlace={selected}
          onSelect={selectPlace}
        />
      </section>
    </main>
  );
}
