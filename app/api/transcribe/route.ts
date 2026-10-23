import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    let audioBuffer: Buffer | null = null;
    let mimeType = "audio/webm";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No audio file provided" }, { status: 400, headers: CORS_HEADERS });
      }
      mimeType = file.type || "audio/webm";
      const arrayBuffer = await file.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuffer);
    } else {
      const json = await req.json();
      if (!json.audioBase64) {
        return NextResponse.json({ error: "Missing audioBase64 payload" }, { status: 400, headers: CORS_HEADERS });
      }
      audioBuffer = Buffer.from(json.audioBase64, "base64");
      mimeType = json.mimeType || "audio/webm";
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json({ error: "Empty audio payload" }, { status: 400, headers: CORS_HEADERS });
    }

    // ── Helper: Groq Whisper Attempt ──────────────────────────────────────────
    const tryGroqWhisper = async (key: string, label: string): Promise<string | null> => {
      try {
        const groqFormData = new FormData();
        const blob = new Blob([new Uint8Array(audioBuffer!)], { type: mimeType });
        groqFormData.append("file", blob, "voice_note.webm");
        groqFormData.append("model", "whisper-large-v3-turbo");
        groqFormData.append("response_format", "json");

        const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: groqFormData,
          signal: AbortSignal.timeout(12000),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          if (groqData.text?.trim()) return groqData.text.trim();
        } else {
          console.warn(`[${label} Failed]`, groqRes.status);
        }
      } catch (err) {
        console.warn(`[${label} Error]`, err);
      }
      return null;
    };

    // ── Helper: Google Gemini Native Audio Transcription Attempt ───────────────
    const tryGeminiAudio = async (key: string, label: string): Promise<string | null> => {
      try {
        const base64Audio = audioBuffer!.toString("base64");
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key}`;

        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType.split(";")[0],
                      data: base64Audio,
                    },
                  },
                  {
                    text: "You are a fast speech-to-text transcriber. Transcribe the speech verbatim into text without preamble, explanations, or quotes. Reflect whatever language is spoken (Darija, Arabic, French, or English).",
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 600,
            },
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const transcript = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (transcript) return transcript;
        } else {
          console.warn(`[${label} Failed]`, geminiRes.status);
        }
      } catch (err) {
        console.warn(`[${label} Error]`, err);
      }
      return null;
    };

    // ── Tier 1: Groq Primary Whisper ──────────────────────────────────────────
    const groqKey1 = process.env.GROQ_API_KEY?.trim();
    if (groqKey1 && groqKey1 !== "GROQ_API_KEY_SECONDARY") {
      const text = await tryGroqWhisper(groqKey1, "Groq Primary Whisper");
      if (text) return NextResponse.json({ text, provider: "groq-whisper-primary" }, { headers: CORS_HEADERS });
    }

    // ── Tier 2: Groq Secondary Whisper ────────────────────────────────────────
    const groqKey2 = process.env.GROQ_API_KEY_SECONDARY?.trim();
    if (groqKey2 && groqKey2 !== groqKey1) {
      const text = await tryGroqWhisper(groqKey2, "Groq Secondary Whisper");
      if (text) return NextResponse.json({ text, provider: "groq-whisper-secondary" }, { headers: CORS_HEADERS });
    }

    // ── Tier 3: Google Gemini Primary Audio ───────────────────────────────────
    const geminiKey1 = process.env.GEMINI_API_KEY?.trim();
    if (geminiKey1) {
      const text = await tryGeminiAudio(geminiKey1, "Gemini Primary Audio");
      if (text) return NextResponse.json({ text, provider: "gemini-audio-primary" }, { headers: CORS_HEADERS });
    }

    // ── Tier 4: Google Gemini Secondary Audio ─────────────────────────────────
    const geminiKey2 = process.env.GEMINI_API_KEY_SECONDARY?.trim();
    if (geminiKey2 && geminiKey2 !== geminiKey1) {
      const text = await tryGeminiAudio(geminiKey2, "Gemini Secondary Audio");
      if (text) return NextResponse.json({ text, provider: "gemini-audio-secondary" }, { headers: CORS_HEADERS });
    }

    return NextResponse.json(
      { error: "Audio transcription temporarily unavailable. Please type your message." },
      { status: 503, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[Transcribe Route Fatal Error]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
