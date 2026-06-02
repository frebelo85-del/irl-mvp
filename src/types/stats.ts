import type { MissionCategory } from "@/types/preferences";

export type CategoryCount = {
  category: MissionCategory;
  label: string;
  count: number;
};

export type MissionStats = {
  totalCompleted: number;
  inProgress: number;
  byCategory: CategoryCount[];
};
