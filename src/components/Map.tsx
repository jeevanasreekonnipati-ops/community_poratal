'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ── Fix Leaflet default icon paths safely in browser only ────────────────────
if (typeof window !== 'undefined') {
  try {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  } catch {}
}

// ── Icon colours per resource type ──────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  school:      '#2563eb',
  hospital:    '#ef4444',
  transport:   '#f59e0b',
  sanitation:  '#10b981',
  park:        '#8b5cf6',
  gov_support: '#059669',
};

function makeIcon(type: string) {
  const color = TYPE_COLORS[type] ?? '#64748b';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 24 14 24s14-14.667 14-24C28 6.268 21.732 0 14 0z"
            fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [28, 38],
    iconAnchor: [14, 38],
    popupAnchor:[0, -40],
  });
}

function getGpsIcon() {
  return L.divIcon({
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:#2e8b57;border:3px solid white;
      box-shadow:0 0 0 6px rgba(46,139,87,0.25);
    "></div>`,
    className: '',
    iconSize:   [20, 20],
    iconAnchor: [10, 10],
  });
}

function getSelectedIcon() {
  return L.divIcon({
    html: `<div style="
      width:24px;height:24px;border-radius:50%;
      background:#f59e0b;border:3px solid white;
      box-shadow:0 0 0 6px rgba(245,158,11,0.3);
    "></div>`,
    className: '',
    iconSize:   [24, 24],
    iconAnchor: [12, 12],
  });
}

// ── FlyTo helper ─────────────────────────────────────────────────────────────
function FlyToHandler({ center }: { center: [number, number] }) {
  const map = useMap();
  const prev = useRef<string>('');
  useEffect(() => {
    if (!center || isNaN(center[0]) || isNaN(center[1])) return;
    const key = center.join(',');
    if (key !== prev.current) {
      prev.current = key;
      map.flyTo(center, 15, { animate: true, duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

// ── Click handler ─────────────────────────────────────────────────────────────
function ClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onClick && e.latlng && !isNaN(e.latlng.lat) && !isNaN(e.latlng.lng)) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type ResourceLocation = {
  id: string;
  type: string;
  lat: number;
  lng: number;
  locationName: string;
  description: string;
  status?: string;
};

type MapProps = {
  locations?: ResourceLocation[];
  userPosition?: [number, number] | null;
  flyTo?: [number, number] | null;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPin?: [number, number] | null;
  height?: string;
  center?: [number, number] | null;
};

// ── Main Map Component ────────────────────────────────────────────────────────
export default function InteractiveMap({
  locations = [],
  userPosition,
  flyTo,
  onMapClick,
  selectedPin,
  height = '500px',
  center,
}: MapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div style={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#64748b' }}>
        🗺️ Loading map…
      </div>
    );
  }

  // Filter only valid numeric coordinates
  const validLocations = (locations || []).filter(
    loc => loc && typeof loc.lat === 'number' && !isNaN(loc.lat) && typeof loc.lng === 'number' && !isNaN(loc.lng)
  );

  const isValidUserPos = userPosition && typeof userPosition[0] === 'number' && !isNaN(userPosition[0]) && typeof userPosition[1] === 'number' && !isNaN(userPosition[1]);
  const isValidSelectedPin = selectedPin && typeof selectedPin[0] === 'number' && !isNaN(selectedPin[0]) && typeof selectedPin[1] === 'number' && !isNaN(selectedPin[1]);
  const isValidFlyTo = flyTo && typeof flyTo[0] === 'number' && !isNaN(flyTo[0]) && typeof flyTo[1] === 'number' && !isNaN(flyTo[1]);

  const defaultCenter: [number, number] = center && !isNaN(center[0]) && !isNaN(center[1])
    ? center
    : isValidUserPos
    ? (userPosition as [number, number])
    : [13.6288, 79.4192]; // Tirupati / AP Default

  return (
    <MapContainer
      center={defaultCenter}
      zoom={isValidUserPos ? 14 : 9}
      style={{ height, width: '100%', borderRadius: '0.5rem' }}
      scrollWheelZoom
    >
      <ClickHandler onClick={onMapClick} />
      {isValidFlyTo && <FlyToHandler center={flyTo as [number, number]} />}

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {/* GPS position pulse dot */}
      {isValidUserPos && (
        <Marker position={userPosition as [number, number]} icon={getGpsIcon()}>
          <Popup><strong>📍 Your Location</strong></Popup>
        </Marker>
      )}

      {/* Tap/click selected pin */}
      {isValidSelectedPin && (
        <Marker position={selectedPin as [number, number]} icon={getSelectedIcon()}>
          <Popup>📌 Selected location<br /><small>{selectedPin![0].toFixed(5)}, {selectedPin![1].toFixed(5)}</small></Popup>
        </Marker>
      )}

      {/* Resource markers from Firestore */}
      {validLocations.map(loc => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={makeIcon(loc.type)}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong style={{ textTransform: 'capitalize', color: TYPE_COLORS[loc.type] ?? '#333' }}>
                {loc.type}
              </strong>
              <br />
              <b>{loc.locationName}</b>
              <br />
              <span style={{ color: '#555', fontSize: 13 }}>{loc.description}</span>
              {loc.status && (
                <div style={{ marginTop: 6 }}>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 999,
                    background: loc.status === 'approved' ? '#d1fae5' : '#fef3c7',
                    color:      loc.status === 'approved' ? '#065f46' : '#92400e',
                  }}>
                    {loc.status}
                  </span>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
