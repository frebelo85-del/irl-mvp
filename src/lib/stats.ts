import { MISSION_CATEGORIES } from "@/constants/categories";
import { AuthConfigError } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import type { MissionStats } from "@/types/stats";
import type { MissionCategory } from "@/types/preferences";

type DeliveryWithMission = {
  status: string;
  missions: { category: MissionCategory } | { category: MissionCategory }[];
};

function getCategory(
  missions: DeliveryWithMission["missions"],
): MissionCategory | null {
  if (!missions) return null;
  if (Array.isArray(missions)) {
    return missions[0]?.category ?? null;
  }
  return missions.category;
}

export async function fetchMissionStats(userId: string): Promise<MissionStats> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data, error } = await supabase
    .from("mission_deliveries")
    .select("status, missions (category)")
    .eq("user_id", userId)
    .in("status", ["completed", "accepted"]);

  if (error) {
    throw new Error(error.message);
  }

  const counts = new Map<MissionCategory, number>();
  let totalCompleted = 0;
  let inProgress = 0;

  for (const row of (data ?? []) as DeliveryWithMission[]) {
    if (row.status === "completed") {
      totalCompleted += 1;
      const category = getCategory(row.missions);
      if (category) {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      }
    } else if (row.status === "accepted") {
      inProgress += 1;
    }
  }

  const byCategory = MISSION_CATEGORIES.map((option) => ({
    category: option.value,
    label: option.label,
    count: counts.get(option.value) ?? 0,
  })).filter((row) => row.count > 0);

  return {
    totalCompleted,
    inProgress,
    byCategory,
  };
}
