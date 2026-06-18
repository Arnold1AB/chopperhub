import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getPlanConfig, type SubscriptionPlan } from "../_shared/paystack.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!paystackSecretKey || !supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: "Payment service is not configured." }, 500);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const { plan } = (await req.json()) as { plan?: SubscriptionPlan };

    if (plan !== "monthly" && plan !== "yearly") {
      return jsonResponse({ error: "Invalid subscription plan." }, 400);
    }

    const { amountKobo, durationDays } = getPlanConfig(plan);

    if (!amountKobo || amountKobo < 100) {
      return jsonResponse({ error: "Subscription amount is not configured." }, 500);
    }

    const callbackUrl = `${supabaseUrl}/functions/v1/paystack-callback`;
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountKobo,
        currency: "NGN",
        callback_url: callbackUrl,
        metadata: {
          user_id: user.id,
          plan,
          duration_days: durationDays,
          app: "chopperhub",
        },
      }),
    });

    const payload = await response.json();

    if (!response.ok || !payload?.status) {
      return jsonResponse(
        { error: payload?.message ?? "Unable to initialize payment." },
        400,
      );
    }

    return jsonResponse(payload.data);
  } catch (error) {
    console.error("PAYSTACK INITIALIZE ERROR:", error);
    return jsonResponse({ error: "Unable to initialize payment." }, 500);
  }
});
