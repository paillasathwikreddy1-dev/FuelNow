# FuelNow Google Maps integration

FuelNow now uses the scaffold-supported Google Maps JavaScript API through `client/src/components/Map.tsx`. The built-in Manus proxy loads the Maps JavaScript API with marker, places, geocoding, and geometry libraries; no new Google API key is required in this project. The existing platform-injected `VITE_FRONTEND_FORGE_API_KEY` and `VITE_FRONTEND_FORGE_API_URL` are used by the scaffold loader.

## Changed files

`client/src/components/map/FuelNowMap.tsx` now renders `MapView`, Google Advanced Markers, Google Polyline routes, native map controls, click-to-place manual pins, GPS state, ETA overlays, and demo partner movement. `client/src/components/Map.tsx` now uses a singleton script-loading promise so multiple maps on the landing page initialize reliably. `client/src/services/routingService.ts` uses provider-neutral route points instead of Leaflet types. `client/src/components/map/mapSafety.ts` remains the shared finite-coordinate guard. `client/src/index.css` contains the Google map surface and custom marker styling.

## Runtime behavior

The primary landing page, landing request preview, and `/request` route use Google map tiles. The map preserves GPS detection, denied/unavailable fallback, manual map clicks, current/destination/partner markers, demo route lines, ETA, and demo progress. Google’s own map attribution, Terms, and controls are rendered by the Maps JavaScript API. Invalid coordinates are normalized before they reach Google Maps.

## Packages and environment

Leaflet, React-Leaflet, and `@types/leaflet` were removed. No additional environment variable is required in the Manus-hosted project: the scaffold’s built-in Maps proxy uses the existing platform-injected `VITE_FRONTEND_FORGE_API_KEY` and `VITE_FRONTEND_FORGE_API_URL` values. The loader requests the Maps JavaScript API with the `marker`, `places`, `geocoding`, and `geometry` libraries.

For a standalone non-Manus deployment, Google Maps Platform generally requires an enabled billing account and an API key. Enable only the APIs and libraries needed by the app, apply HTTP referrer restrictions for the production domain and local development origins, and set suitable API quotas and budget alerts. Never place an unrestricted key in source control or expose a server-only credential to the browser. If the deployment is moved outside the Manus proxy, replace the loader’s proxy URL with Google’s documented loader and supply a browser-restricted Maps JavaScript API key through the deployment’s public configuration.

## Failure behavior and validation

If the Google Maps script or proxy is unavailable, FuelNow renders a visible `MAP UNAVAILABLE` panel with GPS/request guidance and a `Retry Google Maps` action rather than leaving an empty map surface. The project passes typechecking, 17 Vitest tests, and the production build. The primary `/` route and `/request` route were visually checked after the migration, including multiple map instances on the landing page. Google map tiles, Google attribution, custom FuelNow markers, controls, location fallback, and the request panel render together.
