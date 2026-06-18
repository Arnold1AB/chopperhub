import { supabase } from "@/lib/supabase";

export type SubscriptionPlan = "monthly" | "yearly";

export type SubscriptionAccess = {
  hasAccess: boolean;
  status: "trialing" | "active" | "expired";
  trialEndsAt: Date;
  subscriptionExpiresAt: Date | null;
  daysRemaining: number;
};

export const subscriptionPlans: Record<
  SubscriptionPlan,
  {
    label: string;
    priceUsd: string;
    priceNaira: string;
    cadence: string;
    description: string;
  }
> = {
  monthly: {
    label: "Monthly",
    priceUsd: "$3",
    priceNaira: "Naira equivalent",
    cadence: "per month",
    description: "Full meal tracking, Meal-lysis insights, and reminders.",
  },
  yearly: {
    label: "Yearly",
    priceUsd: "$30",
    priceNaira: "Naira equivalent",
    cadence: "per year",
    description: "Two months saved compared with monthly access.",
  },
};

const TRIAL_DAYS = 14;

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const daysUntil = (date: Date) =>
  Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));

const createTrialAccess = (startedAt: Date): SubscriptionAccess => {
  const trialEndsAt = addDays(startedAt, TRIAL_DAYS);

  return {
    hasAccess: true,
    status: "trialing",
    trialEndsAt,
    subscriptionExpiresAt: null,
    daysRemaining: daysUntil(trialEndsAt),
  };
};

export const getSubscriptionAccess = async (): Promise<SubscriptionAccess> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please sign in to continue.");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("created_at, trial_started_at, subscription_status, subscription_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("Subscription fields unavailable; allowing trial access.", error);
    return createTrialAccess(new Date(user.created_at ?? Date.now()));
  }

  const now = new Date();
  const trialStartedAt = new Date(
    profile?.trial_started_at ?? profile?.created_at ?? user.created_at ?? now,
  );
  const subscriptionExpiresAt = profile?.subscription_expires_at
    ? new Date(profile.subscription_expires_at)
    : null;
  const paidAccess =
    profile?.subscription_status === "active" &&
    !!subscriptionExpiresAt &&
    subscriptionExpiresAt > now;
  const trialEndsAt = addDays(trialStartedAt, TRIAL_DAYS);
  const trialAccess = trialEndsAt > now;
  const accessEndsAt = paidAccess ? subscriptionExpiresAt : trialEndsAt;

  return {
    hasAccess: paidAccess || trialAccess,
    status: paidAccess ? "active" : trialAccess ? "trialing" : "expired",
    trialEndsAt,
    subscriptionExpiresAt,
    daysRemaining: daysUntil(accessEndsAt),
  };
};

export const initializePaystackCheckout = async (plan: SubscriptionPlan) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Please sign in before subscribing.");
  }

  const { data, error } = await supabase.functions.invoke(
    "paystack-initialize",
    {
      body: { plan },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  if (error) throw error;
  if (!data?.authorization_url || !data?.reference) {
    throw new Error("Unable to start checkout.");
  }

  return data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export const verifyPaystackCheckout = async (reference: string) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Please sign in before verifying payment.");
  }

  const { data, error } = await supabase.functions.invoke("paystack-verify", {
    body: { reference },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) throw error;
  if (!data?.active) {
    throw new Error("Payment has not been confirmed yet.");
  }

  return data;
};
