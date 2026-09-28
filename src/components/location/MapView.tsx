import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from 'react-leaflet';

// ─── Fix Leaflet default icon (broken with bundlers) ─────────────────────────

const buildIcon = (color: 'blue' | 'red' | 'green' | 'orange') => {
  const colorMap: Record<string, string> = {
    blue:   'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    red:    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    green:  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    orange: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  };

  return L.icon({
    iconUrl: colorMap[color],
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const USER_ICON   = buildIcon('blue');
const POLICE_ICON = buildIcon('blue');
const HOSPITAL_ICON = buildIcon('red');
const FIRE_ICON   = buildIcon('orange');
const DEFAULT_ICON = buildIcon('green');

function getMarkerIcon(type?: string): L.Icon {
  switch (type) {
    case 'police':       return POLICE_ICON;
    case 'hospital':     return HOSPITAL_ICON;
    case 'fire_station': return FIRE_ICON;
    default:             return DEFAULT_ICON;
  }
}

// ─── Helper: re-center the map when center prop changes ──────────────────────

const MapCenterer: React.FC<{ center: [number, number]; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();
  const prevCenter = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (
      !prevCenter.current ||
      prevCenter.current[0] !== center[0] ||
      prevCenter.current[1] !== center[1]
    ) {
      map.setView(center, zoom, { animate: true });
      prevCenter.current = center;
    }
  }, [center, zoom, map]);

  return null;
};

// ─── MapView props ────────────────────────────────────────────────────────────

export interface MapMarker {
  lat: number;
  lon: number;
  label: string;
  type?: string;
}

export interface MapViewProps {
  center: [number, number];
  zoom?: number;
  accuracy?: number;
  markers?: MapMarker[];
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom = 15,
  accuracy,
  markers = [],
  className = '',
}) => {
  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden ${className}`}
      role="application"
      aria-label="Interactive map showing current location and nearby emergency services"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="w-full h-full min-h-[260px]"
        style={{ minHeight: 260 }}
        aria-hidden="true" // map canvas is not keyboard-navigable; screen readers get text alternatives
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Re-center map when center prop changes */}
        <MapCenterer center={center} zoom={zoom} />

        {/* User position marker */}
        <Marker position={center} icon={USER_ICON}>
          <Popup>
            <span className="font-semibold text-sm">You are here</span>
          </Popup>
        </Marker>

        {/* Accuracy circle */}
        {accuracy !== undefined && accuracy > 0 && (
          <Circle
            center={center}
            radius={accuracy}
            pathOptions={{
              color: '#2563EB',
              fillColor: '#2563EB',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4 4',
            }}
          />
        )}

        {/* Additional markers (emergency services etc.) */}
        {markers.map((marker, i) => (
          <Marker
            key={`${marker.lat}-${marker.lon}-${i}`}
            position={[marker.lat, marker.lon]}
            icon={getMarkerIcon(marker.type)}
          >
            <Popup>
              <span className="text-sm">{marker.label}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Attribution overlay reinforcement for accessibility */}
      <p className="sr-only">
        Map powered by OpenStreetMap. Your location is shown at latitude {center[0].toFixed(5)},
        longitude {center[1].toFixed(5)}.
      </p>
    </div>
  );
};
