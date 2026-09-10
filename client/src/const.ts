export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Directs user to the FuelNow authentication portal (/login).
 */
export const startLogin = () => {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};
