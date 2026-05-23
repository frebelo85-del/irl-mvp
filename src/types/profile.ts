/** Row shape returned from `public.profiles` (minimal subset for MVP). */
export type Profile = {
  id: string;
  timezone: string;
  onboarding_completed: boolean;
  account_linked_at: string | null;
};
