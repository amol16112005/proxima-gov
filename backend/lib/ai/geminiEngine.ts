// ─────────────────────────────────────────────────────────────────────────────
// backend/lib/ai/geminiEngine.ts
// Gemini AI engine module for the Proxima Gov platform.
// Configured to use the @google/generative-ai SDK.
//
// Exports:
//   - getGeminiModel(modelName?)  — returns a configured GenerativeModel
//   - generateGovResponse(prompt) — sends a prompt and returns the text reply
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MODEL = 'gemini-1.5-flash';

const SYSTEM_INSTRUCTION = `You are ProximaGov AI, an intelligent assistant for the 
Proxima Digital Governance Initiative operated by the Government of India for Lok Sabha constituencies. 
Your role is to:
1. Acknowledge citizen submissions in a formal, empathetic, and concise manner.
2. Provide helpful guidance on government processes and timelines.
3. Summarise policy milestones and project updates clearly.
4. Always respond in a professional, neutral, and inclusive tone.
5. If you are unsure about specific policy details, say so and direct the citizen 
   to the relevant ministry or helpline.
Do not make promises about specific outcomes. Always clarify that final decisions 
rest with the competent authority.`;

// ---------------------------------------------------------------------------
// Lazy-initialised client (avoids creating it at import time in SSR contexts)
// ---------------------------------------------------------------------------

let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (_client) return _client;

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      '[geminiEngine] Missing NEXT_PUBLIC_GEMINI_API_KEY. ' +
        'Add your Gemini API key to .env.local and restart the dev server.'
    );
  }

  _client = new GoogleGenerativeAI(apiKey);
  return _client;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns a configured GenerativeModel instance.
 *
 * @param modelName - Optional Gemini model name. Defaults to 'gemini-1.5-flash'.
 */
export function getGeminiModel(modelName: string = DEFAULT_MODEL): GenerativeModel {
  const client = getClient();
  return client.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 512,
    },
  });
}

/**
 * Sends a prompt to Gemini and returns the plain-text response.
 *
 * @param prompt     - The user prompt to send.
 * @param modelName  - Optional model override. Defaults to 'gemini-1.5-flash'.
 * @returns          - The generated text response.
 * @throws           - Rethrows any Gemini API errors with a descriptive prefix.
 */
export async function generateGovResponse(
  prompt: string,
  modelName: string = DEFAULT_MODEL
): Promise<string> {
  try {
    const model = getGeminiModel(modelName);
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[geminiEngine] Failed to generate response: ${message}`);
  }
}
