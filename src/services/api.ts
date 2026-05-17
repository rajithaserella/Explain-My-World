import { GoogleGenAI } from "@google/genai";

export async function explainImage(image: string, mimeType: string, language: string, mode: string = "explain", prompt?: string) {
  const response = await fetch("/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, mimeType, language, mode, prompt }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || "Failed to analyze image");
  }

  return response.json();
}

export async function chatMessage(messages: { role: 'user' | 'assistant', text: string }[], language: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, language }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}
