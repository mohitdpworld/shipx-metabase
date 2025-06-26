// utils/token.js

export function getTokenFromURL() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const isEmbed = pathParts[0] === "embed";
  if (isEmbed && pathParts.length >= 3) {
    return pathParts[pathParts.length - 1];
  }
  return null;
}

export function decodeJWTPayload(token) {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    console.log('json', json)
    return JSON.parse(json);
  } catch (err) {
    console.log('err', err)
    console.error("Invalid token", err);
    return null;
  }
}

/**
 * Returns maxRangeDays based on reportAccessLevel
 * ONLY if dateRestrictedVersion is true
 */

export function getMaxRangeDaysFromToken() {
  try {
    const token = getTokenFromURL();
    if (!token) return undefined;

    const payload = decodeJWTPayload(token);
    const maxDaysLimit = payload?.userInfo?.maxDaysLimit;

    return maxDaysLimit ?? 93;
  } catch (e) {
    console.warn("Failed to get max range days from token:", e);
    return undefined;
  }
}

export const convertToDays = (intervals, unit) => {
  const numericInterval =
    typeof intervals === "number" ? Math.abs(intervals) : 1;

  switch (unit) {
    case "day":
      return numericInterval;
    case "week":
      return numericInterval * 7;
    case "month":
      return numericInterval * 30;
    case "year":
      return numericInterval * 365;
    case "minute":
    case "hour":
      return 0;
    default:
      console.warn("Unknown unit type passed to convertToDays:", unit);
      return 0;
  }
};
