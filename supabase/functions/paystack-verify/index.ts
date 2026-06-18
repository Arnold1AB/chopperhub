import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { activateSubscription } from "../_shared/paystack.ts";

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

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const { reference } = (await req.json()) as { reference?: string };

    if (!reference) {
      return jsonResponse({ error: "Missing payment reference." }, 400);
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      },
    );
    const payload = await response.json();

    if (!response.ok || !payload?.status) {
      return jsonResponse(
        { error: payload?.message ?? "Unable to verify payment." },
        400,
      );
    }

    if (payload.data?.metadata?.user_id !== user.id) {
      return jsonResponse({ error: "Payment reference does not match user." }, 403);
    }

    const result = await activateSubscription(payload.data);

    return jsonResponse(result);
  } catch (error) {
    console.error("PAYSTACK VERIFY ERROR:", error);
    return jsonResponse({ error: "Unable to verify payment." }, 500);
  }
});
