import { useEffect, useRef, useState } from "react";
import { MapPin, Moon, Sun } from "lucide-react";
import * as mapboxgl from "mapbox-gl/esm";
import "mapbox-gl/dist/mapbox-gl.css";

const MAP_CENTER = [120.9842, 14.5995];
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim();
const MAPBOX_STYLE_URL = "mapbox://styles/mapbox/standard";

const FALLBACK_MAP_COLORS = {
  land: "#0b1f33",
  water: "#010d19",
  roads: "#385b66",
  trunks: "#5f8f8e",
  motorways: "#75a69a",
  buildings: "#102a38",
  greenspace: "#102c2f",
  placeLabels: "#cdd6f4",
  roadLabels: "#7f849c",
  boundaries: "#455d6b",
};

function readThemeColor(element, variable, fallback) {
  return getComputedStyle(element).getPropertyValue(variable).trim() || fallback;
}

function getMapConfig(container) {
  const themeElement = container.closest("[data-flavor]") ?? container;
  const color = (variable, fallbackKey) =>
    readThemeColor(themeElement, variable, FALLBACK_MAP_COLORS[fallbackKey]);

  return {
    basemap: {
      lightPreset: "night",
      font: "Roboto Mono",
      showAdminBoundaries: true,
      showLandmarkIconLabels: false,
      showLandmarkIcons: false,
      showPedestrianRoads: true,
      showPlaceLabels: true,
      showPointOfInterestLabels: false,
      showRoadLabels: false,
      showTransitLabels: false,
      show3dObjects: false,
      colorAdminBoundaries: color("--ctp-surface1", "boundaries"),
      colorBuildings: color("--ctp-surface0", "buildings"),
      colorGreenspace: color("--ctp-surface0", "greenspace"),
      colorLand: color("--ctp-mantle", "land"),
      colorMotorways: color("--ctp-teal", "motorways"),
      colorPlaceLabels: color("--ctp-text", "placeLabels"),
      colorRoadLabels: color("--ctp-overlay1", "roadLabels"),
      colorRoads: color("--ctp-surface1", "roads"),
      colorTrunks: color("--ctp-sapphire", "trunks"),
      colorWater: color("--ctp-crust", "water"),
    },
  };
}

function getManilaClock() {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Manila",
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === "hour")?.value);

  return {
    isDaytime: hour >= 6 && hour < 18,
    time: [
      parts.find((part) => part.type === "hour")?.value,
      parts.find((part) => part.type === "minute")?.value,
      parts.find((part) => part.type === "second")?.value,
    ].join(":"),
  };
}

export function MapCard() {
  const mapContainerRef = useRef(null);
  const [mapStatus, setMapStatus] = useState(
    MAPBOX_ACCESS_TOKEN ? "loading" : "missing-token",
  );
  const [manilaClock, setManilaClock] = useState(getManilaClock);

  useEffect(() => {
    const container = mapContainerRef.current;

    if (!MAPBOX_ACCESS_TOKEN || !container) return undefined;

    let map;
    let mapErrorTimeout;

    try {
      map = new mapboxgl.Map({
        accessToken: MAPBOX_ACCESS_TOKEN,
        attributionControl: true,
        center: MAP_CENTER,
        container,
        config: getMapConfig(container),
        dragPan: true,
        dragRotate: false,
        pitch: 0,
        pitchWithRotate: false,
        scrollZoom: true,
        style: MAPBOX_STYLE_URL,
        touchPitch: false,
        zoom: 10.6,
      });

      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();

      map.once("load", () => {
        setMapStatus("ready");
        map.resize();
      });

      map.on("error", (event) => {
        const message = event?.error?.message?.toLowerCase() ?? "";

        if (message.includes("access token") || message.includes("style")) {
          setMapStatus("error");
        }
      });
    } catch {
      mapErrorTimeout = window.setTimeout(() => setMapStatus("error"), 0);
    }

    return () => {
      window.clearTimeout(mapErrorTimeout);
      map?.remove();
    };
  }, []);

  useEffect(() => {
    const timeId = window.setInterval(() => {
      setManilaClock(getManilaClock());
    }, 1000);

    return () => window.clearInterval(timeId);
  }, []);

  return (
    <article className="homepage-map scroll-parallax scroll-parallax-deep rounded-xl md:col-span-2 lg:col-span-1">
      <div className="homepage-map__header">
        <div className="homepage-map__title">
          <MapPin
            aria-hidden="true"
            size={14}
            strokeWidth={1.8}
            style={{ color: "var(--ctp-accent)" }}
          />
          <h2>
            Operating from
          </h2>
        </div>
      </div>

      <div className="homepage-map__canvas">
        <div
          ref={mapContainerRef}
          className="homepage-map__map"
          aria-label="Interactive Mapbox map centered on Manila, Philippines"
        />

        {mapStatus === "missing-token" && (
          <div className="homepage-map__status" role="status">
            <strong>Mapbox map unavailable</strong>
            <span>Set VITE_MAPBOX_ACCESS_TOKEN to enable the live map.</span>
          </div>
        )}
        {mapStatus === "loading" && (
          <div className="homepage-map__status" role="status">
            Loading Manila map…
          </div>
        )}
        {mapStatus === "error" && (
          <div className="homepage-map__status" role="status">
            <strong>Mapbox map unavailable</strong>
            <span>Check the public access token and try again.</span>
          </div>
        )}
      </div>

      <div className="homepage-map__footer">
        <span className="homepage-map__location">Manila, PH</span>
        <span className="homepage-map__time">
          {manilaClock.isDaytime ? (
            <Sun
              aria-hidden="true"
              className="homepage-map__time-icon homepage-map__time-icon--sun"
              size={19}
              strokeWidth={1.8}
            />
          ) : (
            <Moon
              aria-hidden="true"
              className="homepage-map__time-icon homepage-map__time-icon--moon"
              size={19}
              strokeWidth={1.8}
            />
          )}
          {manilaClock.time}
        </span>
      </div>
    </article>
  );
}
