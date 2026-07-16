import { postToApi } from "@/lib/apiClient";
import { getUserProfile, requireCurrentUser } from "@/lib/profile";

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
    description: "Full meal tracking, nutrition analysis, and reminders.",
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

export const getSubscriptionAccess = async (): Promise<SubscriptionAccess> => {
  const user = requireCurrentUser();
  const profile = await getUserProfile(user.uid);
  const now = new Date();
  const trialStartedAt = new Date(
    profile?.trial_started_at ?? profile?.created_at ?? user.metadata.creationTime ?? now,
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

export const initializePaystackCheckout = async (
  plan: SubscriptionPlan,
  callbackUrl?: string,
) => {
  requireCurrentUser();

  const data = await postToApi<{
    authorization_url?: string;
    access_code?: string;
    reference?: string;
    error?: string;
  }>("/.netlify/functions/create-paystack-checkout", { plan, callbackUrl });

  if (!data?.authorization_url || !data?.reference) {
    throw new Error(data?.error ?? "Unable to start checkout.");
  }

  return {
    authorization_url: data.authorization_url,
    access_code: data.access_code ?? "",
    reference: data.reference,
  };
};

export const verifyPaystackCheckout = async (reference: string) => {
  requireCurrentUser();

  const data = await postToApi<{
    active?: boolean;
    error?: string;
  }>("/.netlify/functions/verify-paystack-payment", { reference });

  if (!data?.active) {
    throw new Error(data?.error ?? "Payment has not been confirmed yet.");
  }

  return data;
};
