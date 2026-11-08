import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IconButton } from "./UI";
const center = [47.8262, 13.04];
const wheelchair =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="4" r="2"/><path d="m15 8-3 5h5l3 5M12 8l-3 3M10 14a5 5 0 1 0 6 6"/></svg>';
export default function MapView({ locations, selected, onSelect, notify }) {
  const container = useRef();
  const map = useRef();
  const markers = useRef();
  const tile = useRef();
  const callbacks = useRef({ onSelect, notify });
  callbacks.current = { onSelect, notify };
  const [offline, setOffline] = useState(false);
  const [tilesReady, setTilesReady] = useState(false);
  useEffect(() => {
    const instance = L.map(container.current, {
      zoomControl: false,
      attributionControl: true,
      fadeAnimation: false,
      // Gentler, finer-grained scroll zoom instead of jumping a full level per tick.
      zoomSnap: 0.25,
      wheelPxPerZoomLevel: 140,
      wheelDebounceTime: 30,
      bounceAtZoomLimits: false,
    }).setView(center, 16);
    map.current = instance;
    instance.createPane("fallback");
    instance.getPane("fallback").style.zIndex = "100";
    L.imageOverlay(
      "/demo-map.svg",
      [
        [47.814, 13.021],
        [47.838, 13.059],
      ],
      { opacity: 1, pane: "fallback" },
    ).addTo(instance);
    tile.current = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    ).addTo(instance);
    const useFallback = () => {
      if (instance.hasLayer(tile.current)) {
        instance.removeLayer(tile.current);
        setOffline(true);
      }
    };
    const fallbackTimer = setTimeout(useFallback, 7000);
    tile.current.on("load", () => {
      clearTimeout(fallbackTimer);
      setTilesReady(true);
    });
    tile.current.on("tileerror", () => {
      clearTimeout(fallbackTimer);
      useFallback();
    });
    instance.attributionControl.setPrefix(false);
    markers.current = L.layerGroup().addTo(instance);
    L.circleMarker(center, {
      radius: 8,
      fillColor: "#2464d0",
      color: "#fff",
      weight: 3,
      fillOpacity: 1,
    })
      .addTo(instance)
      .bindTooltip("Demo starting point");
    L.circle(center, {
      radius: 45,
      color: "#3674d6",
      fillOpacity: 0.09,
      weight: 1,
    }).addTo(instance);
    const resize = new ResizeObserver(() => instance.invalidateSize());
    resize.observe(container.current);
    return () => {
      clearTimeout(fallbackTimer);
      resize.disconnect();
      instance.remove();
    };
  }, []);
  useEffect(() => {
    if (!markers.current) return;
    markers.current.clearLayers();
    locations.forEach((place) => {
      const el = document.createElement("div");
      el.className = `map-pin ${selected === place.id ? "selected" : ""}`;
      const badge = document.createElement("span");
      badge.className = "pin-score";
      badge.innerHTML = wheelchair;
      const score = document.createElement("strong");
      score.textContent = place.score.toFixed(1);
      badge.append(score);
      const name = document.createElement("span");
      name.className = "pin-name";
      name.textContent = place.name;
      el.append(badge, name);
      if (place.reports.length) {
        const alert = document.createElement("span");
        alert.className = "pin-alert";
        alert.textContent = "!";
        el.append(alert);
      }
      const marker = L.marker([place.lat, place.lng], {
        icon: L.divIcon({
          html: el,
          className: "access-marker",
          iconSize: [180, 40],
          iconAnchor: [40, 40],
        }),
        keyboard: true,
        title: `${place.name}, ${place.score} out of 5`,
        alt: place.name,
        zIndexOffset: selected === place.id ? 1000 : 0,
      }).addTo(markers.current);
      marker.on("click", () => callbacks.current.onSelect(place.id));
      marker
        .getElement()
        ?.setAttribute(
          "aria-label",
          `Open ${place.name}, accessibility ${place.score} out of 5`,
        );
    });
  }, [locations, selected]);
  useEffect(() => {
    const place = locations.find((l) => l.id === selected);
    if (!place || !map.current) return;
    const instance = map.current;
    const point = instance.project([place.lat, place.lng], 16);
    if (window.innerWidth <= 760) {
      const height = instance.getSize().y;
      // Keep the selected pin between the search bar and the 70%-height sheet.
      const visibleTarget = Math.max(145, height * 0.21);
      point.y += height / 2 - visibleTarget;
    }
    instance.setView(instance.unproject(point, 16), 16, { animate: false });
  }, [selected, locations]);
  const locate = () => {
    if (!navigator.geolocation)
      return callbacks.current.notify(
        "Location is unavailable. Showing the demo neighborhood.",
      );
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.current.setView([latitude, longitude], 16);
        L.circleMarker([latitude, longitude], { radius: 8, color: "#174298" })
          .addTo(map.current)
          .bindTooltip("Your location");
        callbacks.current.notify(
          "Your location is shown. Demo places remain in Salzburg.",
        );
      },
      () =>
        callbacks.current.notify(
          "Location could not be accessed. You can still explore the demo places.",
        ),
      { timeout: 8000 },
    );
  };
  return (
    <div className="map-shell">
      <div
        ref={container}
        className="map-canvas"
        aria-label="Map of accessible places"
      />
      <div className="map-status">
        <span className="status-dot" />
        {offline
          ? "Illustrated demo map"
          : tilesReady
            ? "Salzburg, Austria"
            : "Loading street map…"}
      </div>
      <div className="map-controls">
        <IconButton
          icon="Plus"
          label="Zoom in"
          onClick={() => map.current.zoomIn()}
        />
        <IconButton
          icon="Minus"
          label="Zoom out"
          onClick={() => map.current.zoomOut()}
        />
        <span />
        <IconButton
          icon="LocateFixed"
          label="Use my location"
          onClick={locate}
        />
        <IconButton
          icon="Layers"
          label={offline ? "Show street map" : "Show demo map"}
          onClick={() => {
            if (offline) tile.current.addTo(map.current);
            else map.current.removeLayer(tile.current);
            setOffline(!offline);
          }}
        />
        <IconButton
          icon="Compass"
          label="Back to demo neighborhood"
          onClick={() => map.current.setView(center, 16)}
        />
      </div>
    </div>
  );
}
