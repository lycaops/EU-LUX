import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";
const MIN_GEOCODE_INTERVAL_MS = 1100;
const GEOCODE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_GEOCODE_CACHE_ENTRIES = 500;
const USER_REQUEST_WINDOW_MS = 60 * 1000;
const MAX_USER_REQUESTS_PER_WINDOW = 5;

let geocodeQueue = Promise.resolve();
let lastGeocodeAt = 0;
const geocodeCache = new Map();
const userRouteRequests = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const requests = (userRouteRequests.get(userId) || []).filter((timestamp) => now - timestamp < USER_REQUEST_WINDOW_MS);
  if (requests.length >= MAX_USER_REQUESTS_PER_WINDOW) return true;
  requests.push(now);
  userRouteRequests.set(userId, requests);
  if (userRouteRequests.size > 1000) {
    for (const [id, timestamps] of userRouteRequests) {
      if (!timestamps.some((timestamp) => now - timestamp < USER_REQUEST_WINDOW_MS)) userRouteRequests.delete(id);
    }
  }
  return false;
}

function geocode(address) {
  const cacheKey = address.trim().toLowerCase();
  const cached = geocodeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.coordinates);
  if (cached) geocodeCache.delete(cacheKey);

  const result = geocodeQueue.then(async () => {
    const queuedCache = geocodeCache.get(cacheKey);
    if (queuedCache && queuedCache.expiresAt > Date.now()) return queuedCache.coordinates;
    const wait = MIN_GEOCODE_INTERVAL_MS - (Date.now() - lastGeocodeAt);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));

    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", address);
    const headers = { "User-Agent": "EU-LUX booking estimator/1.0" };
    if (process.env.ROUTING_CONTACT_EMAIL) headers.From = process.env.ROUTING_CONTACT_EMAIL;
    lastGeocodeAt = Date.now();
    const response = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Location lookup is temporarily unavailable.");
    const results = await response.json();
    if (!results.length) throw new Error(`Could not find this location: ${address}`);

    const coordinates = { latitude: Number(results[0].lat), longitude: Number(results[0].lon) };
    if (!Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude)) {
      throw new Error("Location lookup returned invalid coordinates.");
    }
    if (geocodeCache.size >= MAX_GEOCODE_CACHE_ENTRIES) {
      geocodeCache.delete(geocodeCache.keys().next().value);
    }
    geocodeCache.set(cacheKey, { coordinates, expiresAt: Date.now() + GEOCODE_CACHE_TTL_MS });
    return coordinates;
  });
  geocodeQueue = result.then(() => undefined, () => undefined);
  return result;
}

export async function POST(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4096) {
    return NextResponse.json({ error: "Location details are too long." }, { status: 413 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Provide valid pick-up and destination locations." }, { status: 400 });
  }

  const pickup = typeof body?.pickup === "string" ? body.pickup.trim() : "";
  const dropoff = typeof body?.dropoff === "string" ? body.dropoff.trim() : "";
  if (!pickup || !dropoff || pickup.length > 300 || dropoff.length > 300) {
    return NextResponse.json({ error: "Enter both locations (up to 300 characters each)." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createSupabaseServerClient();
  } catch {
    return NextResponse.json({ error: "Route estimates are unavailable until sign-in is configured." }, { status: 503 });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in before calculating a route." }, { status: 401 });
  }
  if (isRateLimited(user.id)) {
    return NextResponse.json({ error: "Too many route calculations. Please wait a minute and try again." }, { status: 429 });
  }

  try {
    const from = await geocode(pickup);
    const to = await geocode(dropoff);
    const url = `${OSRM_URL}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=false`;
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Route lookup is temporarily unavailable.");
    const result = await response.json();
    if (result.code !== "Ok" || !result.routes?.length) {
      throw new Error("A driving route could not be found for these locations.");
    }

    return NextResponse.json({
      distanceKm: Math.round((result.routes[0].distance / 1000) * 10) / 10,
      attribution: "© OpenStreetMap contributors · Routing by OSRM",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to calculate this route." }, { status: 502 });
  }
}
