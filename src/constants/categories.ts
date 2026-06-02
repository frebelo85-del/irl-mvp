import type { MissionCategory } from "@/types/preferences";

export type CategoryOption = {
  value: MissionCategory;
  label: string;
};

/** All mission categories (MASTER / PRD §4) with English UI labels. */
export const MISSION_CATEGORIES: CategoryOption[] = [
  { value: "social", label: "Social" },
  { value: "nature", label: "Nature" },
  { value: "curiosity", label: "Curiosity" },
  { value: "adventure", label: "Adventure" },
  { value: "creativity", label: "Creativity" },
  { value: "calm", label: "Calm" },
  { value: "learning", label: "Learning" },
];

export const ALL_MISSION_CATEGORY_VALUES = MISSION_CATEGORIES.map(
  (c) => c.value,
);
