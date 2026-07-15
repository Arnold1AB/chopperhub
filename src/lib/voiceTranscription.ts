import { postToApi } from "@/lib/apiClient";
import * as FileSystem from "expo-file-system/legacy";

export async function transcribeMealAudio(audioUri: string) {
  const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const data = await postToApi<{
    transcript?: string;
    error?: string;
  }>("/.netlify/functions/transcribe-meal", {
    audioBase64,
    mimeType: "audio/m4a",
  });

  if (!data?.transcript) {
    throw new Error(data?.error ?? "No transcript was returned.");
  }

  return data.transcript;
}
