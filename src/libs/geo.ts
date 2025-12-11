interface GeoData {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

export async function getGeoData(ip: string): Promise<GeoData | null> {
  if (!ip || ip === "127.0.0.1" || ip === "localhost") {
    return null;
  }

  try {
    // Use a geolocation API service
    // Could be ipinfo.io, ipgeolocation.io, or similar
    const response = await fetch(
      `https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch geolocation data");
    }

    const data = await response.json();

    // Parse location coordinates
    const [latitude, longitude] = data.loc
      ? data.loc.split(",").map(Number)
      : [null, null];

    return {
      country: data.country || "Unknown",
      city: data.city || "Unknown",
      latitude: latitude || 0,
      longitude: longitude || 0
    };
  } catch (error) {
    console.error("Error fetching geolocation data:", error);
    return null;
  }
}
