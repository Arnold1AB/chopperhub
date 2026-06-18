import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type SubscriptionPlan = "monthly" | "yearly";

type PaystackTransaction = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string | null;
  customer?: {
    customer_code?: string;
  };
  metadata?: {
    user_id?: string;
    plan?: SubscriptionPlan;
    duration_days?: number;
  };
};

export const getPlanConfig = (plan: SubscriptionPlan) => {
  if (plan === "yearly") {
    return {
      amountKobo: Number(Deno.env.get("PAYSTACK_YEARLY_AMOUNT_KOBO") ?? 0),
      durationDays: 365,
    };
  }

  return {
    amountKobo: Number(Deno.env.get("PAYSTACK_MONTHLY_AMOUNT_KOBO") ?? 0),
    durationDays: 31,
  };
};

export const getServiceClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service configuration.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const activateSubscription = async (
  transaction: PaystackTransaction,
) => {
  const metadata = transaction.metadata ?? {};
  const userId = metadata.user_id;
  const plan = metadata.plan;

  if (!userId || (plan !== "monthly" && plan !== "yearly")) {
    throw new Error("Payment metadata is incomplete.");
  }

  if (transaction.status !== "success") {
    throw new Error("Payment is not successful.");
  }

  const serviceClient = getServiceClient();
  const { amountKobo, durationDays } = getPlanConfig(plan);

  const { data: existingPayment, error: existingPaymentError } =
    await serviceClient
      .from("subscription_payments")
      .select("reference")
      .eq("reference", transaction.reference)
      .maybeSingle();

  if (existingPaymentError) throw existingPaymentError;

  if (existingPayment) {
    return { active: true, alreadyProcessed: true };
  }

  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("subscription_expires_at")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;

  const now = new Date();
  const currentExpiry = profile?.subscription_expires_at
    ? new Date(profile.subscription_expires_at)
    : null;
  const startsAt = currentExpiry && currentExpiry > now ? currentExpiry : now;
  const expiresAt = addDays(startsAt, durationDays);

  const { error: profileUpdateError } = await serviceClient
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_plan: plan,
      subscription_expires_at: expiresAt.toISOString(),
      paystack_customer_code: transaction.customer?.customer_code ?? null,
    })
    .eq("id", userId);

  if (profileUpdateError) throw profileUpdateError;

  const { error: paymentInsertError } = await serviceClient
    .from("subscription_payments")
    .insert({
      user_id: userId,
      reference: transaction.reference,
      plan,
      amount_kobo: transaction.amount || amountKobo,
      currency: transaction.currency || "NGN",
      status: transaction.status,
      paid_at: transaction.paid_at,
      raw_payload: transaction,
    });

  if (paymentInsertError) throw paymentInsertError;

  return {
    active: true,
    alreadyProcessed: false,
    expiresAt: expiresAt.toISOString(),
  };
};
