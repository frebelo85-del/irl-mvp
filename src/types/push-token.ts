export type PushPlatform = "ios" | "android";

export type PushRegistrationResult =
  | { status: "skipped"; reason: string }
  | { status: "registered"; token: string }
  | { status: "denied" }
  | { status: "error"; message: string };
