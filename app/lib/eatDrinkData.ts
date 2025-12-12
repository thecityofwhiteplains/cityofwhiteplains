import fs from "fs/promises";
import path from "path";
import type { EatPlace, EatCategory } from "@/app/types/eatDrink";
import {
  getSavedEatDrinkSettings,
  normalizeEatDrinkSpot,
} from "./eatDrinkSettings";

export type EatDrinkContent = {
  places: EatPlace[];
  featuredIds: string[];
};

function safeParseCsv(content: string): Record<string, string>[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseRow(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseRow(lines[i]);
    if (fields.length === 0) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = fields[idx] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

function parseRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result.map((v) => v.trim());
}

function mapCategory(name: string, cuisine: string): EatCategory {
  const value = `${name} ${cuisine}`.toLowerCase();
  if (value.includes("coffee") || value.includes("cafe") || value.includes("espresso"))
    return "coffee";
  if (value.includes("breakfast") || value.includes("brunch"))
    return "breakfast";
  if (value.includes("lunch") || value.includes("deli") || value.includes("sandwich"))
    return "lunch";
  if (value.includes("quick") || value.includes("fast") || value.includes("grab") || value.includes("pizza") || value.includes("taco"))
    return "quick-bite";
  return "dinner";
}

async function getSavedOrNull(): Promise<EatDrinkContent | null> {
  const saved = await getSavedEatDrinkSettings();
  if (saved?.spots && saved.spots.length > 0) {
    return { places: saved.spots, featuredIds: saved.featuredIds || [] };
  }
  return null;
}

export async function getEatDrinkContent(): Promise<EatDrinkContent> {
  const saved = await getSavedOrNull();
  if (saved) return saved;

  try {
    const filePath = path.join(process.cwd(), "white_plains_restaurants_updated.csv");
    const content = await fs.readFile(filePath, "utf8");
    const rows = safeParseCsv(content);

    const places = rows.map((row, idx) => {
      const name = row["Name"] || `Restaurant ${idx + 1}`;
      const cuisine = row["Cuisine/Type"] || "";
      const dine = row["Dine/Takeout"] || "";
      const address = row["Address"] || null;
      const phone = row["Phone"] || null;
      const website = row["Website"] || null;
      const imageUrl = row["Image URL"] || null;
      const mapsUrl =
        row["Maps URL"] || row["Maps Link"] || row["Map"] || null;
      const menuUrl = row["Menu"] || row["Menu URL"] || null;

      const category = mapCategory(name, cuisine);

      return normalizeEatDrinkSpot(
        {
          id: `${idx}-${name}`.replace(/\s+/g, "-").toLowerCase(),
          name,
          shortDescription: `${cuisine || "Local spot"}${dine ? ` · ${dine}` : ""}`,
          category,
          address,
          phone,
          websiteUrl: website,
          imageUrl,
          mapsUrl,
          menuUrl,
        },
        idx
      );
    });

    const featuredIds = places.slice(0, 3).map((p) => p.id);
    return { places, featuredIds };
  } catch (err) {
    console.error("[Eat & Drink] Unable to load CSV data:", err);
    return { places: [], featuredIds: [] };
  }
}

export async function getEatDrinkPlaces(): Promise<EatPlace[]> {
  const content = await getEatDrinkContent();
  return content.places;
}
