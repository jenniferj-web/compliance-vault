// app/api/extract/route.ts
//
// Accepts a PDF or image upload, sends it to Claude Sonnet 4.6 via the
// Anthropic SDK, and returns the extracted Subcontractor Name and
// Expiration Date as structured JSON.
//
// POST /api/extract
//   Body:  multipart/form-data  { file: File }
//   Returns: ExtractResponse (JSON)

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExtractResponse =
  | {
      success: true;
      subcontractorName: string | null;  // The insured party's legal name
      expirationDate: string | null;     // ISO 8601 — "YYYY-MM-DD"
      rawExpirationDate: string | null;  // Date exactly as it appears in the doc
      confidence: "high" | "medium" | "low";
      warnings: string[];
    }
  | {
      success: false;
      error: string;
    };

// ─── Constants ────────────────────────────────────────────────────────────────

// The current recommended model from https://platform.claude.com/docs/en/about-claude/models/overview
const MODEL = "claude-sonnet-4-6";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// MIME types we accept and their Claude-compatible equivalents
const ACCEPTED_TYPES: Record<string, string> = {
  "application/pdf": "application/pdf",
  "image/jpeg":      "image/jpeg",
  "image/jpg":       "image/jpeg",
  "image/png":       "image/png",
  "image/webp":      "image/webp",
  "image/gif":       "image/gif",
};

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert insurance document analyst specializing in 
ACORD 25 Certificates of Insurance. You extract specific fields from insurance 
documents with high precision.

You always respond with ONLY a valid JSON object. No markdown, no code fences, 
no explanations — just the raw JSON.`;

// ─── User prompt ──────────────────────────────────────────────────────────────

const USER_PROMPT = `Analyze this insurance certificate and extract the following fields.

Return ONLY this JSON object (no other text):

{
  "subcontractorName": "<full legal name of the INSURED, or null if not found>",
  "expirationDate": "<policy expiration date in YYYY-MM-DD format, or null>",
  "rawExpirationDate": "<expiration date exactly as written in the document, or null>",
  "confidence": "<high | medium | low>",
  "warnings": ["<any issues found, e.g. multiple policies, unclear scan, missing fields>"]
}

Field rules:
- subcontractorName: The legal name of the INSURED party. On an ACORD 25 form this 
  is in the "INSURED" box in the upper-left area. Do NOT return the certificate 
  holder name or the agent/broker name.
- expirationDate: Convert any date format (MM/DD/YYYY, MM-DD-YY, written dates, etc.) 
  to ISO 8601 (YYYY-MM-DD). Prefer the General Liability expiration. If multiple 
  policies exist, use the soonest future expiration date, or the latest date if all 
  are already expired.
- rawExpirationDate: The date string exactly as it appears in the document 
  before conversion, e.g. "09/30/2025".
- confidence: "high" = both fields clearly found; "medium" = one field unclear or 
  required inference; "low" = document is unreadable, not an insurance form, or 
  both fields are missing.
- warnings: Empty array [] if everything looks clean.`;

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<ExtractResponse>> {

  // 1. Parse the incoming multipart body
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body. Send multipart/form-data with a 'file' field." },
      { status: 400 }
    );
  }

  // 2. Validate the file field
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "Missing 'file' field. Attach a PDF or image." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { success: false, error: "The uploaded file is empty." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
      { status: 413 }
    );
  }

  const mimeType = file.type.toLowerCase().split(";")[0].trim();
  const claudeMediaType = ACCEPTED_TYPES[mimeType];

  if (!claudeMediaType) {
    return NextResponse.json(
      {
        success: false,
        error: `Unsupported file type "${file.type}". Accepted: PDF, JPEG, PNG, WEBP, GIF.`,
      },
      { status: 415 }
    );
  }

  // 3. Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[extract] ANTHROPIC_API_KEY environment variable is not set.");
    return NextResponse.json(
      { success: false, error: "Server configuration error. Please contact support." },
      { status: 500 }
    );
  }

  // 4. Convert file to base64
  const buffer     = await file.arrayBuffer();
  const base64Data = Buffer.from(buffer).toString("base64");

  // 5. Build the Claude message — PDFs use "document" blocks, images use "image" blocks
  const client = new Anthropic({ apiKey });

  const fileBlock: Anthropic.MessageParam["content"][number] =
    claudeMediaType === "application/pdf"
      ? {
          type: "document",
          source: {
            type:       "base64",
            media_type: "application/pdf",
            data:       base64Data,
          },
        } as Anthropic.DocumentBlockParam
      : {
          type: "image",
          source: {
            type:       "base64",
            media_type: claudeMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data:       base64Data,
          },
        } as Anthropic.ImageBlockParam;

  // 6. Call the Anthropic API
  let rawText: string;
  try {
    const message = await client.messages.create({
      model:      MODEL,
      max_tokens: 512,
      system:     SYSTEM_PROMPT,
      messages: [
        {
          role:    "user",
          content: [
            fileBlock,
            { type: "text", text: USER_PROMPT },
          ],
        },
      ],
    });

    // Collect all text blocks from the response
    rawText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

  } catch (err) {
    // Surface Anthropic API errors with clear messages
    if (err instanceof Anthropic.APIError) {
      console.error(`[extract] Anthropic API error ${err.status}:`, err.message);

      if (err.status === 401) {
        return NextResponse.json(
          { success: false, error: "Invalid Anthropic API key." },
          { status: 500 }
        );
      }
      if (err.status === 429) {
        return NextResponse.json(
          { success: false, error: "Rate limit reached. Please try again in a moment." },
          { status: 429 }
        );
      }
      if (err.status === 400) {
        return NextResponse.json(
          { success: false, error: "Claude could not read this file. Try a higher-quality scan." },
          { status: 422 }
        );
      }
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[extract] Unexpected error:", message);
    return NextResponse.json(
      { success: false, error: `Extraction failed: ${message}` },
      { status: 500 }
    );
  }

  // 7. Parse Claude's JSON response
  try {
    // Strip accidental markdown fences if Claude adds them
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned) as {
      subcontractorName: string | null;
      expirationDate:    string | null;
      rawExpirationDate: string | null;
      confidence:        "high" | "medium" | "low";
      warnings:          string[];
    };

    return NextResponse.json({
      success:           true,
      subcontractorName: typeof parsed.subcontractorName === "string" ? parsed.subcontractorName : null,
      expirationDate:    typeof parsed.expirationDate    === "string" ? parsed.expirationDate    : null,
      rawExpirationDate: typeof parsed.rawExpirationDate === "string" ? parsed.rawExpirationDate : null,
      confidence:        ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "low",
      warnings:          Array.isArray(parsed.warnings) ? parsed.warnings.filter((w) => typeof w === "string") : [],
    });

  } catch {
    console.error("[extract] Failed to parse Claude's response as JSON. Raw:", rawText.slice(0, 300));
    return NextResponse.json(
      {
        success: false,
        error:
          "Claude returned an unexpected response format. " +
          "Try a clearer scan or a different file.",
      },
      { status: 422 }
    );
  }
}

// Reject all other HTTP methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "Method not allowed. Use POST with a multipart/form-data body." },
    { status: 405 }
  );
}