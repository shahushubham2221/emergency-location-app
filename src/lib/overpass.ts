import { haversineKm } from '../utils/geo';

export interface EmergencyService {
  id: string;
  name: string;
  category: 'police' | 'hospital' | 'fire_station' | 'ambulance' | 'pharmacy';
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  distanceKm?: number;
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

/** Maps OSM amenity tags to our category enum. */
const AMENITY_CATEGORY_MAP: Record<string, EmergencyService['category']> = {
  police: 'police',
  hospital: 'hospital',
  fire_station: 'fire_station',
  pharmacy: 'pharmacy',
  // Some mappers use 'ambulance_station' - treat as ambulance
  ambulance_station: 'ambulance',
};

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

/**
 * Builds an Overpass QL query for the given amenities within a radius.
 * Using `[out:json][timeout:15]` to keep responses small and fast.
 */
function buildQuery(
  lat: number,
  lon: number,
  radiusMeters: number,
  amenities: string[]
): string {
  const unionBlocks = amenities
    .flatMap((amenity) => [
      `node["amenity"="${amenity}"](around:${radiusMeters},${lat},${lon});`,
      `way["amenity"="${amenity}"](around:${radiusMeters},${lat},${lon});`,
    ])
    .join('\n');

  return `[out:json][timeout:15];\n(\n${unionBlocks}\n);\nout center;`;
}

/**
 * Fetches nearby emergency services from the public Overpass API.
 * Returns results sorted by distance ascending.
 *
 * @param lat          Observer latitude
 * @param lon          Observer longitude
 * @param radiusMeters Search radius in metres (default 5 000)
 */
export async function fetchNearbyEmergencyServices(
  lat: number,
  lon: number,
  radiusMeters = 5000
): Promise<EmergencyService[]> {
  const amenities = Object.keys(AMENITY_CATEGORY_MAP);
  const query = buildQuery(lat, lon, radiusMeters, amenities);

  let lastError = new Error('Unknown error');
  let json: OverpassResponse | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} ${response.statusText} at ${endpoint}`);
      }

      json = await response.json();
      break; // Success! Exit the fallback loop.
    } catch (err) {
      lastError = err as Error;
      console.warn(`[Overpass] Endpoint ${endpoint} failed:`, err);
      // continue to next endpoint
    }
  }

  if (!json) {
    throw new Error(`All Overpass API endpoints failed. Last error: ${lastError.message}`);
  }

  const services: EmergencyService[] = [];

  for (const el of json.elements) {
    const tags = el.tags ?? {};
    const amenity = tags['amenity'];
    const category = AMENITY_CATEGORY_MAP[amenity];
    if (!category) continue;

    // Ways expose a centre point; nodes expose lat/lon directly.
    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (elLat === undefined || elLon === undefined) continue;

    const name =
      tags['name'] ??
      tags['name:en'] ??
      category.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const addressParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'],
    ].filter(Boolean);

    services.push({
      id: `${el.type}/${el.id}`,
      name,
      category,
      latitude: elLat,
      longitude: elLon,
      address: addressParts.length > 0 ? addressParts.join(', ') : undefined,
      phone: tags['phone'] ?? tags['contact:phone'] ?? undefined,
      distanceKm: haversineKm(lat, lon, elLat, elLon),
    });
  }

  // Sort by distance ascending
  return services.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
}
