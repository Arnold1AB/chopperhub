const { cleanText, crypto, withHandler } = require("./_shared/backend");

exports.handler = withHandler(async ({ user, body }) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const error = new Error("Cloudinary signing is not configured.");
    error.statusCode = 500;
    throw error;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = cleanText(body.folder, 120) || `chopperhub/meals/${user.uid}`;
  const params = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(params).digest("hex");

  return { cloudName, apiKey, folder, timestamp, signature };
});
