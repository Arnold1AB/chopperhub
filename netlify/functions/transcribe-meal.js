const { withHandler } = require("./_shared/backend");

exports.handler = withHandler(async ({ body }) => {
  const apiKey = process.env.GROQ_API_KEY;
  const audioBase64 = body.audioBase64;
  const mimeType = body.mimeType || "audio/m4a";

  if (!apiKey) {
    const error = new Error("Groq API key is not configured.");
    error.statusCode = 500;
    throw error;
  }

  if (typeof audioBase64 !== "string" || !audioBase64) {
    const error = new Error("Audio file is required.");
    error.statusCode = 400;
    throw error;
  }

  const audioBuffer = Buffer.from(audioBase64, "base64");
  if (audioBuffer.length <= 0 || audioBuffer.length > 10 * 1024 * 1024) {
    const error = new Error("Audio file size is invalid.");
    error.statusCode = 400;
    throw error;
  }

  const form = new FormData();
  form.append("file", new Blob([audioBuffer], { type: mimeType }), "meal-recording.m4a");
  form.append("model", process.env.GROQ_TRANSCRIBE_MODEL || "whisper-large-v3-turbo");
  form.append("response_format", "json");
  form.append(
    "prompt",
    "The user is logging a meal in ChopperHub. Preserve Nigerian and African food names naturally.",
  );

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  const payload = await response.json();

  if (!response.ok) {
    console.error("GROQ TRANSCRIPTION ERROR:", payload);
    const error = new Error(payload?.error?.message ?? "Voice transcription is unavailable.");
    error.statusCode = 502;
    throw error;
  }

  const transcript = typeof payload?.text === "string" ? payload.text.trim() : "";
  if (!transcript) {
    const error = new Error("No speech was detected.");
    error.statusCode = 422;
    throw error;
  }

  return { transcript };
});
