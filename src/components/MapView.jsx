import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api, isMock } from "../api/client";
import { IconButton, wheelchairLabel } from "./UI";
const center = isMock ? [47.8262, 13.04] : [47.9186, 13.7995];
const STREET_MIN_ZOOM = 14;
// Licence terms: this credit must stay visible whenever the street layer is shown.
const STREET_CREDIT =
  '<a href="https://portal.ttf.nexyo.io/products?id=8beab1aa-496d-4791-bc13-788e3b85e2c8">Street data: Hackathon Veterans</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>';
const OSM_CREDIT =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
function streetStyle({ properties: p }) {
  const color =
    p.highway === "steps" || p.wheelchair === "no"
      ? "#c62828"
      : p.wheelchair === "limited"
        ? "#b26a00"
        : p.wheelchair === "yes" || p.wheelchair === "designated"
          ? "#2e7d32"
          : "#5b7fb5";
  const known = color !== "#5b7fb5";
  return {
    color,
    weight: known ? 4 : 2,
    opacity: known ? 0.9 : 0.45,
    fill: false,
  };
}
function streetDetails(properties) {
  const details = document.createElement("div");
  Object.entries(properties).forEach(([key, value]) => {
    const line = document.createElement("div");
    line.textContent = `${key.replaceAll("_", " ")}: ${value}`;
    details.append(line);
  });
  return details;
}
const wheelchair =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="4" r="2"/><path d="m15 8-3 5h5l3 5M12 8l-3 3M10 14a5 5 0 1 0 6 6"/></svg>';
const PIN_GAP = 4;
const PIN_POINTER = 6;
// Which pin wins when two would overlap: live issues, then reviews, then known access.
const pinRank = ({ place }) =>
  (place.reports.length ? 4000 : 0) +
  (place.reviewCount ? 2000 : 0) +
  (place.wheelchairAccess && place.wheelchairAccess !== "unknown" ? 1000 : 0) +
  (place.facts?.length ?? 0);
function rankPins(pins) {
  // Measured here because a hidden pin has no size later.
  pins.forEach((pin) => {
    pin.left = pin.el.offsetLeft;
    pin.top = pin.el.offsetTop;
    pin.width = pin.el.offsetWidth;
    pin.height = pin.el.offsetHeight + PIN_POINTER;
  });
  return pins.sort(
    (a, b) => Number(b.selected) - Number(a.selected) || pinRank(b) - pinRank(a),
  );
}
function declutterPins(instance, pins) {
  const zoom = instance.getZoom();
  const shown = [];
  pins.forEach((pin) => {
    const point = instance.project(pin.marker.getLatLng(), zoom);
    const left = point.x - 40 + pin.left - PIN_GAP;
    const top = point.y - 40 + pin.top - PIN_GAP;
    const box = {
      left,
      top,
      right: left + pin.width + PIN_GAP * 2,
      bottom: top + pin.height + PIN_GAP * 2,
    };
    const free = !shown.some(
      (other) =>
        box.left < other.right &&
        box.right > other.left &&
        box.top < other.bottom &&
        box.bottom > other.top,
    );
    pin.marker.getElement().style.display = free ? "" : "none";
    if (free) shown.push(box);
  });
}
export default function MapView({ locations, selected, onSelect, notify }) {
  const container = useRef();
  const map = useRef();
  const markers = useRef();
  const pins = useRef([]);
  const tile = useRef();
  const callbacks = useRef({ onSelect, notify });
  callbacks.current = { onSelect, notify };
  const [offline, setOffline] = useState(false);
  const [tilesReady, setTilesReady] = useState(false);
  const [showStreets, setShowStreets] = useState(!isMock);
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
      { maxZoom: 19 },
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
    // Added to the map, not the tiles: the street layer needs it even on the fallback map.
    instance.attributionControl.addAttribution(OSM_CREDIT);
    markers.current = L.layerGroup().addTo(instance);
    instance.on("zoomend", () => declutterPins(instance, pins.current));
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
    if (!showStreets) return;
    const instance = map.current;
    const streets = L.geoJSON(null, {
      attribution: STREET_CREDIT,
      renderer: L.canvas({ padding: 0.2 }),
      style: streetStyle,
      onEachFeature: (feature, layer) =>
        layer.bindPopup(() => streetDetails(feature.properties)),
    }).addTo(instance);
    let latest = 0;
    const load = () => {
      const request = ++latest;
      if (instance.getZoom() < STREET_MIN_ZOOM) {
        streets.clearLayers();
        return;
      }
      const bounds = instance.getBounds().pad(0.2);
      api
        .getStreetLayer(
          [
            bounds.getWest(),
            bounds.getSouth(),
            bounds.getEast(),
            bounds.getNorth(),
          ].join(","),
        )
        .then((data) => {
          if (request !== latest) return;
          streets.clearLayers();
          streets.addData(data);
        })
        .catch(() => {
          if (request === latest) setShowStreets(false);
        });
    };
    load();
    instance.on("moveend", load);
    return () => {
      latest += 1;
      instance.off("moveend", load);
      instance.removeLayer(streets);
    };
  }, [showStreets]);
  useEffect(() => {
    if (!markers.current) return;
    markers.current.clearLayers();
    const built = [];
    locations.forEach((place) => {
      const el = document.createElement("div");
      el.className = `map-pin ${selected === place.id ? "selected" : ""}`;
      const badge = document.createElement("span");
      badge.className = "pin-score";
      badge.innerHTML = wheelchair;
      const score = document.createElement("strong");
      const access = wheelchairLabel(place);
      score.textContent = access || place.score.toFixed(1);
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
        title: access
          ? `${place.name}, wheelchair access: ${access}`
          : `${place.name}, ${place.score} out of 5`,
        alt: place.name,
        zIndexOffset: selected === place.id ? 1000 : 0,
      }).addTo(markers.current);
      marker.on("click", () => callbacks.current.onSelect(place.id));
      marker
        .getElement()
        ?.setAttribute(
          "aria-label",
          access
            ? `Open ${place.name}, wheelchair access: ${access}`
            : `Open ${place.name}, accessibility ${place.score} out of 5`,
        );
      built.push({ marker, el, place, selected: selected === place.id });
    });
    pins.current = rankPins(built);
    declutterPins(map.current, pins.current);
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
          isMock
            ? "Your location is shown. Demo places remain in Salzburg."
            : "Your location is shown. Places cover the Traunsee-Almtal region.",
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
            ? isMock
              ? "Salzburg, Austria"
              : "Traunsee-Almtal, Austria"
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
        {!isMock && (
          <IconButton
            icon="Footprints"
            label={showStreets ? "Hide street layer" : "Show street layer"}
            aria-pressed={showStreets}
            onClick={() => setShowStreets(!showStreets)}
          />
        )}
        <IconButton
          icon="Compass"
          label="Back to demo neighborhood"
          onClick={() => map.current.setView(center, 16)}
        />
      </div>
    </div>
  );
}
