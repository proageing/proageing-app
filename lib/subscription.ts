import { supabase } from "@/lib/supabase";
import type { PlanId } from "@/lib/plans";

export interface ActiveSubscription {
  plan: PlanId;
  status: string;
  current_period_end: string | null;
}

export async function getActiveSubscription(userId: string): Promise<ActiveSubscription | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as ActiveSubscription | null;
}
