// Fetches today's high/low for White Plains using Open-Meteo (no API key required).
// Uses Fahrenheit units and falls back to placeholders on any failure.

const DEFAULT_LATITUDE = Number(process.env.WP_WEATHER_LAT ?? 41.033);
const DEFAULT_LONGITUDE = Number(process.env.WP_WEATHER_LON ?? -73.7629);
const DEFAULT_TIMEZONE = process.env.WP_WEATHER_TIMEZONE ?? "America/New_York";

type WeatherResult = {
  high: string;
  low: string;
};

export async function getTodayWeather(): Promise<WeatherResult> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${DEFAULT_LATITUDE}&longitude=${DEFAULT_LONGITUDE}&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=${encodeURIComponent(
    DEFAULT_TIMEZONE
  )}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 * 30 }, // cache for 30 minutes
    });

    if (!res.ok) {
      throw new Error(`Weather request failed: ${res.status}`);
    }

    const data = await res.json();
    const high = data?.daily?.temperature_2m_max?.[0];
    const low = data?.daily?.temperature_2m_min?.[0];

    if (typeof high !== "number" || typeof low !== "number") {
      throw new Error("Weather response missing expected temperatures");
    }

    return {
      high: `${Math.round(high)}°F`,
      low: `${Math.round(low)}°F`,
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return { high: "—", low: "—" };
  }
}
