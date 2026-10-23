# Devyx AI Client Assistant & Perfect Darija Translator (n8n Integration)

This directory contains the production-ready n8n workflow implementing the **2-Stage Architecture** you perfected in the `Darija Translator - AI Models Benchmark`:

1. **Stage 1 — Devyx AI Technical Assistant**:
   - Analyzes incoming client inquiries about web platforms, mobile apps, n8n automations, pricing, and timelines.
   - Generates the authoritative consultative answer using the Devyx agency specifications and booking links.

2. **Stage 2 — Perfect Darija Translator Node**:
   - When the user communicates in Darija (or selects the `[🇲🇦 دارجة]` toggle), the Assistant's answer is routed into your **Basic LLM Chain - Perfect Darija Translator**.
   - Runs your exact `CORE_MANDATES_V2` system prompt (100% Latin Arabizi, strict '9' for Qaf, verb morphology like 'seyya', cultural collocations like 'saguem la fuite', 'doka', 'ra7', '3la khater', 'ta3na', and tech loanword integration).
   - Followed by your **Sanitize Output** Code node that automatically intercepts and clamps dialect traps (`lazmek` -> `lazem`, `7it` -> `3la khater`, `mawjoud` -> `jay`, `l'kra` extraction clamps, and script purity).

3. **Stage 3 — Direct Multilingual Passthrough**:
   - If the user communicates in French, English, or Modern Standard Arabic, the Assistant's response passes through directly without translation.

---

## 1. Quick Start: Importing into n8n

### Option A: Groq-Powered Workflow (Recommended — Fast & Reliable)
1. Open your n8n dashboard ([http://localhost:5678](http://localhost:5678)).
2. Open your workflow (or create a new one). Select all (`Ctrl + A`) and delete (`Delete`) to clear broken nodes.
3. In the top-right menu (`...`), select **Import from File...** and choose [`n8n/devyx-groq-workflow.json`](file:///d:/antigravity/devyx/n8n/devyx-groq-workflow.json) (or copy and paste the JSON directly onto the canvas with `Ctrl + V`).
4. In **Credentials** → **Groq API**, connect your Groq API key:
   - Primary: `your-groq-api-key` (from Groq Console)
5. Click **Save** and toggle the workflow to **Active**.

### Option B: Google Gemini Workflow (Updated for n8n 1.77)
1. In the top-right menu (`...`), select **Import from File...** and choose [`n8n/devyx-gemini-darija-workflow.json`](file:///d:/antigravity/devyx/n8n/devyx-gemini-darija-workflow.json).
2. Uses the officially supported model: **`models/gemini-1.5-flash-latest`** (fixes the `models/gemini-2.5-flash is not supported` error).
3. In **Credentials** → **Google Gemini(PaLM) Api account**, update your key to your active key:
   - `your-gemini-api-key` (from Google AI Studio).
4. Save and toggle **Active**.

---

## 2. Request & Response Architecture

```
[ Devyx Website Visitor ]
          │ (Chats in Darija Arabizi, Arabic, French, or English)
          ▼
[ ChatWidget UI ] (components/chat/chat-widget.tsx)
          │
          │ POST /api/chat
          ▼
[ Devyx Next.js API Proxy ] (app/api/chat/route.ts)
          │ (Rate limiting, Zod validation, 55s timeout)
          ▼
[ n8n Webhook: /webhook/chat-agent ]
          │
          ▼
[ Context & Language Detector ]
          │
          ▼
[ Stage 1: Devyx Assistant Agent ]
          │ (Generates consultative technical answer)
          ▼
[ Router: Is Darija? ]
       ├── [ TRUE ] ──▶ [ Stage 2: Basic LLM Chain - Perfect Darija Translator ]
       │                         │ (Exact CORE_MANDATES_V2 system prompt)
       │                         ▼
       │                [ Sanitize Output (Regex Clamps & Dialect Fixes) ]
       │                         │
       └── [ FALSE ] ────────────┴──▶ [ Format Final Response ]
                                                │
                                                ▼
                                     [ Respond to Webhook ]
                                                │
                                                ▼
                                     [ Displayed in ChatWidget ]
```

---

## 3. Environment Variables

### In Devyx Next.js (`.env.local`):
```env
# URL to your n8n webhook
N8N_WEBHOOK_URL=https://n8n.your-domain.com/webhook/chat-agent

# Optional secret token passed in x-n8n-secret header
N8N_WEBHOOK_SECRET=your-shared-secret-token
```

### In n8n:
- Google Gemini API Key configured in your n8n credentials or environment (`GEMINI_API_KEY`).
