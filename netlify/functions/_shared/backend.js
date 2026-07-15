const crypto = require("crypto");
const admin = require("firebase-admin");

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const parseBody = (event) => {
  if (!event.body) return {};
  return JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body);
};

const getAdmin = () => {
  if (admin.apps.length) return admin;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured.");
  }

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
  });

  return admin;
};

const requireUser = async (event) => {
  const authHeader = event.headers.authorization ?? event.headers.Authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    const error = new Error("Sign in is required.");
    error.statusCode = 401;
    throw error;
  }

  return getAdmin().auth().verifyIdToken(token);
};

const withHandler = (handler) => async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  try {
    const user = await requireUser(event);
    const body = parseBody(event);
    return json(200, await handler({ event, user, body }));
  } catch (error) {
    console.error("NETLIFY FUNCTION ERROR:", error);
    return json(error.statusCode ?? 500, {
      error: error.message ?? "Request failed.",
    });
  }
};

const cleanText = (value, maxLength = 600) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const extractJson = (text) => {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  return JSON.parse(cleaned);
};

const callGroqJson = async ({ model, system, user, temperature = 0.2 }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const error = new Error("Groq API key is not configured.");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const payload = await response.json();

  if (!response.ok) {
    console.error("GROQ ERROR:", payload);
    const error = new Error(payload?.error?.message ?? "Groq analysis is unavailable.");
    error.statusCode = 502;
    throw error;
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    const error = new Error("No Groq response was returned.");
    error.statusCode = 502;
    throw error;
  }

  return extractJson(content);
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getPlanConfig = (plan) => {
  if (plan === "yearly") {
    return {
      amountKobo: Number(process.env.PAYSTACK_YEARLY_AMOUNT_KOBO ?? 5000000),
      durationDays: 365,
    };
  }

  return {
    amountKobo: Number(process.env.PAYSTACK_MONTHLY_AMOUNT_KOBO ?? 500000),
    durationDays: 31,
  };
};

const activateSubscription = async (transaction) => {
  const metadata = transaction.metadata ?? {};
  const uid = metadata.user_id;
  const plan = metadata.plan;

  if (!uid || (plan !== "monthly" && plan !== "yearly")) {
    const error = new Error("Payment metadata is incomplete.");
    error.statusCode = 400;
    throw error;
  }

  if (transaction.status !== "success") {
    const error = new Error("Payment is not successful.");
    error.statusCode = 400;
    throw error;
  }

  const { amountKobo, durationDays } = getPlanConfig(plan);
  const db = getAdmin().firestore();
  const userRef = db.collection("users").doc(uid);
  const paymentRef = userRef.collection("subscriptionPayments").doc(transaction.reference);

  return db.runTransaction(async (tx) => {
    const paymentSnap = await tx.get(paymentRef);
    if (paymentSnap.exists) return { active: true, alreadyProcessed: true };

    const userSnap = await tx.get(userRef);
    const profile = userSnap.data() ?? {};
    const now = new Date();
    const currentExpiry = profile.subscription_expires_at
      ? new Date(profile.subscription_expires_at)
      : null;
    const startsAt = currentExpiry && currentExpiry > now ? currentExpiry : now;
    const expiresAt = addDays(startsAt, durationDays);

    tx.set(userRef, {
      subscription_status: "active",
      subscription_plan: plan,
      subscription_expires_at: expiresAt.toISOString(),
      paystack_customer_code: transaction.customer?.customer_code ?? null,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    tx.set(paymentRef, {
      reference: transaction.reference,
      plan,
      amount_kobo: transaction.amount || amountKobo,
      currency: transaction.currency || "NGN",
      status: transaction.status,
      paid_at: transaction.paid_at ?? null,
      raw_payload: transaction,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { active: true, alreadyProcessed: false, expiresAt: expiresAt.toISOString() };
  });
};

module.exports = {
  activateSubscription,
  callGroqJson,
  cleanText,
  crypto,
  getAdmin,
  getPlanConfig,
  json,
  withHandler,
};
