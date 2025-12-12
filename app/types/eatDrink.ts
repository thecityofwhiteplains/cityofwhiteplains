export type EatCategory = "coffee" | "breakfast" | "lunch" | "dinner" | "quick-bite";
export type EatVibe = "calm" | "family" | "fast" | "date-night";

export type EatPlace = {
  id: string;
  name: string;
  shortDescription: string;
  category: EatCategory;
  vibe: EatVibe;
  budget: "$" | "$$" | "$$$";
  goodFor: string[];
  address?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  imageUrl?: string | null;
  mapsUrl?: string | null;
  menuUrl?: string | null;
  upVotes?: number | null;
  downVotes?: number | null;
};

export const DEFAULT_EAT_DRINK_TAGS = [
  "Court day",
  "Family day",
  "No-car visits",
] as const;
