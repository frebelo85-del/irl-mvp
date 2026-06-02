import { AuthConfigError } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import type {
  DeliveryStatus,
  InboxItem,
  MissionDetail,
  MissionDeliveryRow,
  MissionResponseRow,
  MissionSummary,
  ResponseAction,
} from "@/types/mission";

export const MIN_POSTPONE_MINUTES = 30;
export const MAX_POSTPONE_DAYS = 30;
export const MAX_REFLECTION_LENGTH = 200;

const DELIVERY_SELECT = `
  id,
  user_id,
  mission_id,
  scheduled_at,
  delivered_at,
  opened_at,
  postponed_until,
  status,
  missions (
    id,
    category,
    teaser,
    title,
    body
  )
`;

type DeliveryRowRaw = {
  id: string;
  user_id: string;
  mission_id: string;
  scheduled_at: string;
  delivered_at: string | null;
  opened_at: string | null;
  postponed_until: string | null;
  status: DeliveryStatus;
  missions: MissionSummary | MissionSummary[] | null;
};

function mapMission(
  missions: DeliveryRowRaw["missions"],
): MissionSummary | null {
  if (!missions) return null;
  if (Array.isArray(missions)) {
    return missions[0] ?? null;
  }
  return missions;
}

function mapDeliveryRow(row: DeliveryRowRaw): InboxItem | null {
  const mission = mapMission(row.missions);
  if (!mission) return null;

  return {
    id: row.id,
    user_id: row.user_id,
    mission_id: row.mission_id,
    scheduled_at: row.scheduled_at,
    delivered_at: row.delivered_at,
    opened_at: row.opened_at,
    postponed_until: row.postponed_until,
    status: row.status,
    mission,
  };
}

export function validatePostponedUntil(postponedUntil: Date): void {
  const min = new Date(Date.now() + MIN_POSTPONE_MINUTES * 60 * 1000);
  const max = new Date(Date.now() + MAX_POSTPONE_DAYS * 24 * 60 * 60 * 1000);

  if (postponedUntil.getTime() < min.getTime()) {
    throw new Error(
      `Please choose a time at least ${MIN_POSTPONE_MINUTES} minutes from now.`,
    );
  }
  if (postponedUntil.getTime() > max.getTime()) {
    throw new Error(
      `Please choose a time within the next ${MAX_POSTPONE_DAYS} days.`,
    );
  }
}

const OPENABLE_STATUSES: DeliveryStatus[] = ["scheduled", "delivered"];
const ACTIONABLE_STATUSES: DeliveryStatus[] = ["delivered", "opened"];
const REOPENABLE_STATUSES: DeliveryStatus[] = ["postponed", "skipped"];

export async function fetchInboxItems(userId: string): Promise<InboxItem[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data, error } = await supabase
    .from("mission_deliveries")
    .select(DELIVERY_SELECT)
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const items: InboxItem[] = [];
  for (const row of (data ?? []) as DeliveryRowRaw[]) {
    const mapped = mapDeliveryRow(row);
    if (mapped) items.push(mapped);
  }
  return items;
}

export async function fetchMissionDetail(
  userId: string,
  deliveryId: string,
  missionIdFromRoute: string,
): Promise<MissionDetail> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data, error } = await supabase
    .from("mission_deliveries")
    .select(DELIVERY_SELECT)
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const mapped = data ? mapDeliveryRow(data as DeliveryRowRaw) : null;
  if (!mapped || mapped.mission_id !== missionIdFromRoute) {
    throw new Error("Mission delivery not found.");
  }

  const { data: responseData, error: responseError } = await supabase
    .from("mission_responses")
    .select("delivery_id, action, helpful, completed_at, reflection_text")
    .eq("delivery_id", deliveryId)
    .maybeSingle();

  if (responseError) {
    throw new Error(responseError.message);
  }

  const response: MissionResponseRow | null = responseData
    ? {
        delivery_id: responseData.delivery_id,
        action: responseData.action as ResponseAction,
        helpful: responseData.helpful,
        completed_at: responseData.completed_at,
        reflection_text: responseData.reflection_text ?? null,
      }
    : null;

  return {
    delivery: mapped as MissionDeliveryRow,
    mission: mapped.mission,
    response,
  };
}

export type MarkOpenedResult = {
  delivery: MissionDeliveryRow;
  openedNow: boolean;
};

export async function markDeliveryOpened(
  userId: string,
  deliveryId: string,
): Promise<MarkOpenedResult> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data: current, error: readError } = await supabase
    .from("mission_deliveries")
    .select(
      "id, user_id, mission_id, scheduled_at, delivered_at, opened_at, postponed_until, status",
    )
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }
  if (!current) {
    throw new Error("Mission delivery not found.");
  }

  if (!OPENABLE_STATUSES.includes(current.status as DeliveryStatus)) {
    return {
      delivery: current as MissionDeliveryRow,
      openedNow: false,
    };
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("mission_deliveries")
    .update({ status: "opened", opened_at: now })
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .select(
      "id, user_id, mission_id, scheduled_at, delivered_at, opened_at, postponed_until, status",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    delivery: data as MissionDeliveryRow,
    openedNow: true,
  };
}

async function insertResponse(
  userId: string,
  deliveryId: string,
  action: ResponseAction,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { error } = await supabase.from("mission_responses").insert({
    delivery_id: deliveryId,
    user_id: userId,
    action,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("You already responded to this mission.");
    }
    throw new Error(error.message);
  }
}

async function applyDeliveryAction(
  userId: string,
  deliveryId: string,
  status: DeliveryStatus,
  action: ResponseAction,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data: current, error: readError } = await supabase
    .from("mission_deliveries")
    .select("status")
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }
  if (!current) {
    throw new Error("Mission delivery not found.");
  }

  if (!ACTIONABLE_STATUSES.includes(current.status as DeliveryStatus)) {
    throw new Error("This mission can no longer be updated.");
  }

  const { error: updateError } = await supabase
    .from("mission_deliveries")
    .update({ status })
    .eq("id", deliveryId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  await insertResponse(userId, deliveryId, action);
}

/** Clears postpone/skip so the user can Accept / Later / Skip again without waiting for a nudge. */
export async function reopenDelivery(
  userId: string,
  deliveryId: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data: current, error: readError } = await supabase
    .from("mission_deliveries")
    .select("status")
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }
  if (!current) {
    throw new Error("Mission delivery not found.");
  }

  if (!REOPENABLE_STATUSES.includes(current.status as DeliveryStatus)) {
    throw new Error("Only set-aside or skipped missions can be picked up again.");
  }

  const { error: deleteResponseError } = await supabase
    .from("mission_responses")
    .delete()
    .eq("delivery_id", deliveryId)
    .eq("user_id", userId);

  if (deleteResponseError) {
    throw new Error(deleteResponseError.message);
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("mission_deliveries")
    .update({
      status: "opened",
      postponed_until: null,
      opened_at: now,
    })
    .eq("id", deliveryId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

export async function acceptDelivery(
  userId: string,
  deliveryId: string,
): Promise<void> {
  await applyDeliveryAction(userId, deliveryId, "accepted", "accepted");
}

export async function postponeDelivery(
  userId: string,
  deliveryId: string,
  postponedUntil: Date,
): Promise<void> {
  validatePostponedUntil(postponedUntil);

  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data: current, error: readError } = await supabase
    .from("mission_deliveries")
    .select("status")
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }
  if (!current) {
    throw new Error("Mission delivery not found.");
  }

  if (!ACTIONABLE_STATUSES.includes(current.status as DeliveryStatus)) {
    throw new Error("This mission can no longer be updated.");
  }

  const iso = postponedUntil.toISOString();

  const { error: updateError } = await supabase
    .from("mission_deliveries")
    .update({
      status: "postponed",
      postponed_until: iso,
      scheduled_at: iso,
    })
    .eq("id", deliveryId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  await insertResponse(userId, deliveryId, "postponed");
}

export async function skipDelivery(
  userId: string,
  deliveryId: string,
): Promise<void> {
  await applyDeliveryAction(userId, deliveryId, "skipped", "skipped");
}

export async function completeDelivery(
  userId: string,
  deliveryId: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data: current, error: readError } = await supabase
    .from("mission_deliveries")
    .select("status")
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }
  if (!current || current.status !== "accepted") {
    throw new Error("Complete is only available after you accept the mission.");
  }

  const now = new Date().toISOString();

  const { error: deliveryError } = await supabase
    .from("mission_deliveries")
    .update({ status: "completed" })
    .eq("id", deliveryId)
    .eq("user_id", userId);

  if (deliveryError) {
    throw new Error(deliveryError.message);
  }

  const { error: responseError } = await supabase
    .from("mission_responses")
    .update({ completed_at: now })
    .eq("delivery_id", deliveryId)
    .eq("user_id", userId);

  if (responseError) {
    throw new Error(responseError.message);
  }
}

export async function saveMissionReflection(
  userId: string,
  deliveryId: string,
  reflectionText: string | null,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const trimmed = reflectionText?.trim() ?? "";
  if (trimmed.length > MAX_REFLECTION_LENGTH) {
    throw new Error(
      `Keep your note under ${MAX_REFLECTION_LENGTH} characters.`,
    );
  }

  const value = trimmed.length > 0 ? trimmed : null;

  const { data: current, error: readError } = await supabase
    .from("mission_deliveries")
    .select("status")
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }
  if (!current || current.status !== "completed") {
    throw new Error("Reflection is only available after you complete the mission.");
  }

  const { error } = await supabase
    .from("mission_responses")
    .update({ reflection_text: value })
    .eq("delivery_id", deliveryId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function setDeliveryHelpful(
  userId: string,
  deliveryId: string,
  helpful: boolean,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data: current, error: readError } = await supabase
    .from("mission_deliveries")
    .select("status")
    .eq("id", deliveryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }
  if (!current || current.status !== "completed") {
    throw new Error("Feedback is only available after completion.");
  }

  const { error } = await supabase
    .from("mission_responses")
    .update({ helpful })
    .eq("delivery_id", deliveryId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
