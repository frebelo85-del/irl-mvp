import type { MissionCategory } from "@/types/preferences";

export type DeliveryStatus =
  | "scheduled"
  | "delivered"
  | "opened"
  | "accepted"
  | "postponed"
  | "skipped"
  | "completed";

export type ResponseAction = "accepted" | "postponed" | "skipped";

export type MissionSummary = {
  id: string;
  category: MissionCategory;
  teaser: string;
  title: string;
  body: string;
};

export type MissionDeliveryRow = {
  id: string;
  user_id: string;
  mission_id: string;
  scheduled_at: string;
  delivered_at: string | null;
  opened_at: string | null;
  postponed_until: string | null;
  status: DeliveryStatus;
};

export type MissionResponseRow = {
  delivery_id: string;
  action: ResponseAction;
  helpful: boolean | null;
  completed_at: string | null;
  reflection_text: string | null;
};

export type InboxItem = MissionDeliveryRow & {
  mission: MissionSummary;
};

export type MissionDetail = {
  delivery: MissionDeliveryRow;
  mission: MissionSummary;
  response: MissionResponseRow | null;
};
