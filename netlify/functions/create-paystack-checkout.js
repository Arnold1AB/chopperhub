const { getAdmin, getPlanConfig, withHandler } = require("./_shared/backend");

exports.handler = withHandler(async ({ user, body }) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const plan = body.plan;
  const callbackUrl = typeof body.callbackUrl === "string" ? body.callbackUrl : undefined;

  if (!secretKey) {
    const error = new Error("Payment service is not configured.");
    error.statusCode = 500;
    throw error;
  }

  if (plan !== "monthly" && plan !== "yearly") {
    const error = new Error("Invalid subscription plan.");
    error.statusCode = 400;
    throw error;
  }

  const authUser = await getAdmin().auth().getUser(user.uid);
  if (!authUser.email) {
    const error = new Error("An email address is required.");
    error.statusCode = 400;
    throw error;
  }

  const { amountKobo, durationDays } = getPlanConfig(plan);
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: authUser.email,
      amount: amountKobo,
      currency: "NGN",
      callback_url: callbackUrl,
      metadata: {
        user_id: user.uid,
        plan,
        duration_days: durationDays,
        app: "chopperhub",
      },
    }),
  });
  const payload = await response.json();

  if (!response.ok || !payload?.status) {
    const error = new Error(payload?.message ?? "Unable to initialize payment.");
    error.statusCode = 502;
    throw error;
  }

  return payload.data;
});
