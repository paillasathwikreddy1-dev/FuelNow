export type LocationState = "loading" | "ready" | "denied" | "unavailable";
export type RequestState = "idle" | "requesting" | "tracking" | "delivered";

export function nextRequestState(state: RequestState, event: "confirm" | "complete" | "reset"): RequestState {
  if (event === "reset") return "idle";
  if (event === "confirm" && (state === "idle" || state === "requesting")) return "tracking";
  if (event === "complete" && state === "tracking") return "delivered";
  return state;
}

export function resolveLocationState(hasGeolocation: boolean, permissionGranted: boolean | null): LocationState {
  if (!hasGeolocation) return "unavailable";
  if (permissionGranted === null) return "loading";
  return permissionGranted ? "ready" : "denied";
}
