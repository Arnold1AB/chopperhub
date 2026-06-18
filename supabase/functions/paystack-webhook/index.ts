import { jsonResponse } from "../_shared/cors.ts";
import { activateSubscription } from "../_shared/paystack.ts";

const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const verifySignature = async (body: string, signature: string) => {
  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");

  if (!secret) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );

  return toHex(digest) === signature;
};

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    if (!(await verifySignature(body, signature))) {
      return jsonResponse({ error: "Invalid signature." }, 401);
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success" && event.data) {
      await activateSubscription(event.data);
    }

    return jsonResponse({ received: true });
  } catch (error) {
    console.error("PAYSTACK WEBHOOK ERROR:", error);
    return jsonResponse({ error: "Unable to process webhook." }, 500);
  }
});
