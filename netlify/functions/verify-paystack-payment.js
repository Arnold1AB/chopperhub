const { activateSubscription, cleanText, withHandler } = require("./_shared/backend");

exports.handler = withHandler(async ({ user, body }) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const reference = cleanText(body.reference, 120);

  if (!secretKey) {
    const error = new Error("Payment service is not configured.");
    error.statusCode = 500;
    throw error;
  }

  if (!reference) {
    const error = new Error("Missing payment reference.");
    error.statusCode = 400;
    throw error;
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );
  const payload = await response.json();

  if (!response.ok || !payload?.status) {
    const error = new Error(payload?.message ?? "Unable to verify payment.");
    error.statusCode = 502;
    throw error;
  }

  if (payload.data?.metadata?.user_id !== user.uid) {
    const error = new Error("Payment reference does not match user.");
    error.statusCode = 403;
    throw error;
  }

  return activateSubscription(payload.data);
});
