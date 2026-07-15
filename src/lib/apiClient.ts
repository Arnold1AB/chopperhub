import { auth } from "@/lib/firebase";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as
  | Record<string, string | undefined>
  | undefined;

const rawBaseUrl =
  process.env.EXPO_PUBLIC_CHOPPERHUB_API_URL ??
  extra?.EXPO_PUBLIC_CHOPPERHUB_API_URL;

const apiBaseUrl = rawBaseUrl?.replace(/\/$/, "");

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function postToApi<TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> {
  if (!apiBaseUrl || apiBaseUrl.includes("YOUR_NETLIFY_SITE")) {
    throw new ApiError("Netlify backend URL is not configured.", 0);
  }

  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new ApiError("Sign in is required.", 401);
  }

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Network request failed.", 0);
  }

  const data = (await response.json().catch(() => ({}))) as ApiErrorResponse;

  if (!response.ok) {
    throw new ApiError(
      data.error ??
        data.message ??
        `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  return data as TResponse;
}
