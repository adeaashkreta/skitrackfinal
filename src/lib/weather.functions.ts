import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  resortId: z.string().min(1).max(64),
});

export interface ResortConditions {
  date: string;
  tempMax: number;
  tempMin: number;
  tempCurrent: number;
  feelsLike: number;
  snow24h: number;
  snowSeason: number;
  precipitation: number;
  windMax: number;
  windAvg: number;
  windDir: number;
  cloudCover: number;
  visibilityKm: number;
  uvIndex: number;
  freezingLevel: number;
  sunrise: string;
  sunset: string;
  weatherCode: number;
  // derived
  openSlopesPct: number;
  liftsRunning: number;
  liftsTotal: number;
  groomed: boolean;
  bluebird: boolean;
  powderDay: boolean;
  summary: string;
  hourly: Array<{ time: string; temp: number; snow: number; wind: number; cloud: number }>;
}

function pickHourAvg(arr: number[] | undefined, startIdx: number, count: number): number {
  if (!arr) return 0;
  const slice = arr.slice(startIdx, startIdx + count).filter((n) => typeof n === "number");
  if (!slice.length) return 0;
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function summarize(c: Omit<ResortConditions, "summary">): string {
  if (c.powderDay && c.bluebird) return "Bluebird powder day";
  if (c.powderDay) return "Powder day";
  if (c.bluebird) return "Bluebird day";
  if (c.snow24h > 5) return "Fresh snowfall";
  if (c.windMax > 60) return "High winds — exposed lifts likely on hold";
  if (c.cloudCover > 75) return "Overcast";
  if (c.cloudCover < 25) return "Clear skies";
  return "Mixed conditions";
}

export const getResortConditions = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<ResortConditions> => {
    const params = new URLSearchParams({
      latitude: String(data.lat),
      longitude: String(data.lon),
      start_date: data.date,
      end_date: data.date,
      timezone: "auto",
      daily: [
        "temperature_2m_max",
        "temperature_2m_min",
        "snowfall_sum",
        "precipitation_sum",
        "windspeed_10m_max",
        "winddirection_10m_dominant",
        "sunrise",
        "sunset",
        "uv_index_max",
        "weathercode",
      ].join(","),
      hourly: [
        "temperature_2m",
        "apparent_temperature",
        "snowfall",
        "cloudcover",
        "windspeed_10m",
        "visibility",
        "freezinglevel_height",
      ].join(","),
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather service error (${res.status})`);
    }
    const json: any = await res.json();

    const daily = json.daily ?? {};
    const hourly = json.hourly ?? {};

    const tempMax = daily.temperature_2m_max?.[0] ?? 0;
    const tempMin = daily.temperature_2m_min?.[0] ?? 0;
    const snow24h = (daily.snowfall_sum?.[0] ?? 0) * 10; // cm → mm? open-meteo gives cm already with snowfall_sum
    // open-meteo snowfall_sum is in cm by default; keep as cm
    const snow24hCm = daily.snowfall_sum?.[0] ?? 0;
    const precipitation = daily.precipitation_sum?.[0] ?? 0;
    const windMax = daily.windspeed_10m_max?.[0] ?? 0;
    const windDir = daily.winddirection_10m_dominant?.[0] ?? 0;
    const uvIndex = daily.uv_index_max?.[0] ?? 0;
    const sunrise = (daily.sunrise?.[0] ?? "").slice(11, 16);
    const sunset = (daily.sunset?.[0] ?? "").slice(11, 16);
    const weatherCode = daily.weathercode?.[0] ?? 0;

    // Midday slice (10:00-14:00)
    const middayStart = 10;
    const tempCurrent = pickHourAvg(hourly.temperature_2m, middayStart, 4);
    const feelsLike = pickHourAvg(hourly.apparent_temperature, middayStart, 4);
    const windAvg = pickHourAvg(hourly.windspeed_10m, 0, 24);
    const cloudCover = pickHourAvg(hourly.cloudcover, 0, 24);
    const visibilityKm =
      pickHourAvg(hourly.visibility, middayStart, 4) / 1000;
    const freezingLevel = pickHourAvg(hourly.freezinglevel_height, 0, 24);

    // Derived ski metrics
    const bluebird = cloudCover < 25 && snow24hCm < 2 && windMax < 25;
    const powderDay = snow24hCm > 20;
    const groomed = snow24hCm < 8 && tempMin < 2;

    // Open slopes % — start at 100, penalize for bad weather
    let openSlopesPct = 100;
    if (windMax > 70) openSlopesPct -= 40;
    else if (windMax > 50) openSlopesPct -= 20;
    else if (windMax > 35) openSlopesPct -= 8;
    if (tempMin < -25) openSlopesPct -= 25;
    if (visibilityKm > 0 && visibilityKm < 1) openSlopesPct -= 25;
    else if (visibilityKm > 0 && visibilityKm < 3) openSlopesPct -= 10;
    if (precipitation > 20 && tempMax > 5) openSlopesPct -= 15; // rain
    openSlopesPct = Math.max(20, Math.min(100, Math.round(openSlopesPct)));

    // Lifts — deterministic from resortId hash
    const hash = [...data.resortId].reduce((a, c) => a + c.charCodeAt(0), 0);
    const liftsTotal = 14 + (hash % 18); // 14..31
    const liftsRunning = Math.round((liftsTotal * openSlopesPct) / 100);

    // Hourly preview (every 3 hours)
    const hourlyPreview = [] as ResortConditions["hourly"];
    if (Array.isArray(hourly.time)) {
      for (let i = 6; i < Math.min(hourly.time.length, 22); i += 3) {
        hourlyPreview.push({
          time: String(hourly.time[i]).slice(11, 16),
          temp: hourly.temperature_2m?.[i] ?? 0,
          snow: hourly.snowfall?.[i] ?? 0,
          wind: hourly.windspeed_10m?.[i] ?? 0,
          cloud: hourly.cloudcover?.[i] ?? 0,
        });
      }
    }

    const base = {
      date: data.date,
      tempMax: Math.round(tempMax),
      tempMin: Math.round(tempMin),
      tempCurrent: Math.round(tempCurrent),
      feelsLike: Math.round(feelsLike),
      snow24h: Math.round(snow24hCm * 10) / 10,
      snowSeason: Math.round(150 + (hash % 250)), // illustrative base depth
      precipitation: Math.round(precipitation * 10) / 10,
      windMax: Math.round(windMax),
      windAvg: Math.round(windAvg),
      windDir: Math.round(windDir),
      cloudCover: Math.round(cloudCover),
      visibilityKm: Math.round(visibilityKm * 10) / 10,
      uvIndex: Math.round(uvIndex * 10) / 10,
      freezingLevel: Math.round(freezingLevel),
      sunrise,
      sunset,
      weatherCode,
      openSlopesPct,
      liftsRunning,
      liftsTotal,
      groomed,
      bluebird,
      powderDay,
      hourly: hourlyPreview,
    };
    return { ...base, summary: summarize(base) };
  });
