"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  RotateCcw,
  RefreshCw,
  ArrowUpRight,
  Shield,
  ChevronDown,
  Sparkles,
  Mic,
  MicOff,
  FolderKanban,
  Calculator,
  UserCheck,
  CheckCircle2,
  Clock,
  Compass,
  Paperclip,
  Image,
  FileText,
  XCircle,
  Bell,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import type { JarvisAction, HandoffData, EstimateData } from "@/lib/ai/assistant-context";
import { ImageMarkupModal } from "./image-markup-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttachmentPreview {
  file: File;
  previewUrl?: string; // for images
  base64: string;
  type: string;
  name: string;
  size: number;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  failed?: boolean;
  queued?: boolean;
  actions?: JarvisAction[];
  handoff?: HandoffData;
  estimate?: EstimateData;
  attachmentPreview?: { name: string; type: string; previewUrl?: string };
  tokenBudget?: {
    hourlyRemaining?: number;
    sessionRemaining: number;
    hourlyLimit?: number;
    resetsInMinutes?: number;
    dailyRemaining?: number;
  };
}

const STORAGE_KEY = "devyx_ai_chat_session_v3";

type ChatLanguage = "auto" | "darija" | "ar" | "fr" | "en";

// ─── Static Content ───────────────────────────────────────────────────────────

const STARTER_PROMPTS: Record<ChatLanguage, string[]> = {
  auto: [
    "🌐 Next.js 15 Web Platform Architecture",
    "⚙️ n8n Workflow Automation (Zero SaaS Tax)",
    "📱 Mobile App Development (iOS & Android)",
    "💰 Estimer le Coût & Délais de mon Projet",
    "📁 وريني مشاريع ديفيكس السابقة",
  ],
  darija: [
    "🌐 سيت ويب لشركتي بـ Next.js 15",
    "⚙️ أتمتة الخدمة بـ n8n (Workflows)",
    "📱 تطبيق موبايل (iOS و Android)",
    "💰 شحال كيكلف مشروع تقني؟ (Devis)",
    "🌙 دير Dark Mode للموقع",
    "📁 وريني مشاريع ديفيكس السابقة",
    "👨‍💻 بغيت نهضر مع مدير تقني (Human)",
  ],
  ar: [
    "⚡ استفسار عن منصات الويب المتقدمة",
    "📱 بنية وتطوير تطبيقات الهواتف الذكية",
    "⚙️ أتمتة مسارات العمل عبر n8n",
    "💰 حساب تكلفة وجدول مشروع (تقدير أولي)",
    "🌙 تفعيل الوضع الداكن للموقع",
    "📁 استعراض سابقة الأعمال والمشاريع",
    "👨‍💻 التحدث مع مسؤول هندسي بشري",
  ],
  fr: [
    "⚡ Architecture Plateforme Web Next.js",
    "📱 Application Mobile Multiplateforme",
    "⚙️ Automatisation de Workflows n8n",
    "💰 Estimer le Coût & Délais de mon Projet",
    "🌙 Activer le Mode Sombre (Dark Mode)",
    "📁 Explorer les Réalisations & Projets",
    "👨‍💻 Parler à un Ingénieur Humain",
  ],
  en: [
    "⚡ Web Platform Architecture (Next.js 15)",
    "📱 Cross-Platform Mobile Engineering",
    "⚙️ Autonomous n8n Workflow Automation",
    "💰 Instant Project Cost & Timeline Estimate",
    "🌙 Switch Interface to Dark Mode",
    "📁 Showcase Production Projects",
    "👨‍💻 Connect with Human Engineering Lead",
  ],
};

const WELCOME_MESSAGES: Record<ChatLanguage, string> = {
  auto: "Salam / Hello! 👋 I'm your Devyx AI assistant. Talk to me in English, Français, العربية, or بالدارجة — I will automatically reply in your language!",
  darija: "Salam! 👋 Ana l'assistant technique IA ta3 Devyx. Kifech n9der n3awnek f l'projet ta3ek lyoum?",
  ar: "مرحباً بك! 👋 أنا المساعد التقني الذكي لـ Devyx. كيف يمكنني مساعدتك في مشروعك اليوم؟",
  fr: "Bonjour ! 👋 Je suis votre assistant technique IA chez Devyx. Comment puis-je vous aider sur votre projet ?",
  en: "Hey there! 👋 I'm your Devyx AI assistant. How can I assist with your software project today?",
};

const PLACEHOLDER_TEXT: Record<ChatLanguage, string> = {
  auto: "Auto (English, Français, الدارجة, العربية)...",
  darija: "كتب رسالتك بالدارجة، العربية، الفرنسية أو الإنجليزية...",
  ar: "اكتب رسالتك هنا...",
  fr: "Écrivez votre message ici...",
  en: "Type your message here...",
};

// Strict file limits: PNG and JPEG/WEBP only, 2 MB max
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");

  const parseInline = (lineText: string): React.ReactNode[] => {
    const tokens: React.ReactNode[] = [];
    // Match both markdown [Label](url) and raw URLs http(s)://...
    const linkRegex = /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)|(https?:\/\/[^\s<]+)/g;
    let lastIndex = 0;
    let match;

    const processedSegments: { type: "text" | "link"; content: string; url?: string }[] = [];
    while ((match = linkRegex.exec(lineText)) !== null) {
      if (match.index > lastIndex) {
        processedSegments.push({
          type: "text",
          content: lineText.substring(lastIndex, match.index),
        });
      }
      if (match[1] && match[2]) {
        // Markdown [Label](url)
        processedSegments.push({
          type: "link",
          content: match[1],
          url: match[2],
        });
      } else if (match[3]) {
        // Raw URL https://...
        processedSegments.push({
          type: "link",
          content: match[3],
          url: match[3],
        });
      }
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < lineText.length) {
      processedSegments.push({
        type: "text",
        content: lineText.substring(lastIndex),
      });
    }

    processedSegments.forEach((segment, sIdx) => {
      if (segment.type === "link") {
        tokens.push(
          <a
            key={`link-${sIdx}`}
            href={segment.url}
            target={segment.url?.startsWith("http") ? "_blank" : undefined}
            rel={segment.url?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-accent-primary font-bold underline underline-offset-2 hover:text-accent-signal cursor-pointer inline-flex items-center gap-1 transition-colors"
          >
            <span>{segment.content}</span>
            {segment.url?.startsWith("http") && <ArrowUpRight className="w-3 h-3 inline flex-shrink-0" />}
          </a>
        );
      } else {
        const parts = segment.content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        parts.forEach((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            tokens.push(
              <strong key={`b-${sIdx}-${pIdx}`} className="font-bold text-text-primary">
                {part.slice(2, -2)}
              </strong>
            );
          } else if (part.startsWith("`") && part.endsWith("`")) {
            tokens.push(
              <code
                key={`c-${sIdx}-${pIdx}`}
                className="font-mono bg-bg-primary/80 px-1 py-0.5 border border-border-grid text-[11px] text-accent-signal"
              >
                {part.slice(1, -1)}
              </code>
            );
          } else if (part) {
            tokens.push(<span key={`t-${sIdx}-${pIdx}`}>{part}</span>);
          }
        });
      }
    });

    return tokens;
  };

  return (
    <div className="space-y-1.5 leading-relaxed break-words font-sans text-xs">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 ps-2">
              <span className="font-mono text-accent-primary text-[10px] mt-0.5">▸</span>
              <span>{parseInline(trimmed.substring(2))}</span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)$/);
          return (
            <div key={idx} className="flex items-start gap-2 ps-2">
              <span className="font-mono text-accent-signal text-[10px] font-bold mt-0.5">
                {match ? match[1] + "." : "•"}
              </span>
              <span>{parseInline(match ? match[2] : trimmed)}</span>
            </div>
          );
        }
        return <p key={idx}>{parseInline(line)}</p>;
      })}
    </div>
  );
}

/**
 * 5-sided continuous vector border for 40x40 chamfered buttons.
 * Guarantees that the 45-degree diagonal corner cut lights up seamlessly on hover.
 */
function ChamferButtonBorder({
  className = "text-border-grid group-hover:text-accent-primary",
  active = false,
}: {
  className?: string;
  active?: boolean;
}) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none rtl:-scale-x-100 z-10 overflow-visible"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M 0.5 0.5 L 39.5 0.5 L 39.5 29.5 L 29.5 39.5 L 0.5 39.5 Z"
        stroke="currentColor"
        strokeWidth="1"
        className={`transition-colors duration-150 ${className} ${active ? "!text-accent-primary" : ""}`}
      />
    </svg>
  );
}

/**
 * Diagonal cut border line for variable-sized chamfered elements.
 * Connects the bottom and right borders across the 45-degree chamfer cut.
 */
function ChamferCornerLine({
  className = "text-border-grid group-hover:text-accent-primary",
}: {
  className?: string;
}) {
  return (
    <svg
      className={`absolute bottom-0 right-0 w-[10px] h-[10px] pointer-events-none rtl:right-auto rtl:left-0 rtl:-scale-x-100 overflow-visible z-10 transition-colors duration-150 ${className}`}
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <line
        x1="0"
        y1="10"
        x2="10"
        y2="0"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export function ChatWidget() {
  const pageLocale = useLocale();
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isBooting, setIsBooting] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = React.useState("");
  const [sessionId, setSessionId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);
  const [showProactiveBubble, setShowProactiveBubble] = React.useState(false);
  const [attachment, setAttachment] = React.useState<AttachmentPreview | null>(null);
  const [attachmentError, setAttachmentError] = React.useState<string | null>(null);
  const [isMarkupModalOpen, setIsMarkupModalOpen] = React.useState(false);
  const [lightboxImage, setLightboxImage] = React.useState<{ url: string; name: string } | null>(null);

  // Token budget state (shown in footer)
  const [tokenBudget, setTokenBudget] = React.useState<{
    hourlyRemaining?: number;
    sessionRemaining: number;
    hourlyLimit?: number;
    resetsInMinutes?: number;
    dailyRemaining?: number;
  } | null>(null);

  // Queue notification
  const [queueNotice, setQueueNotice] = React.useState<string | null>(null);

  // Anti-spam token pacing cooldown (seconds)
  const [cooldownRemaining, setCooldownRemaining] = React.useState(0);
  const cooldownTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Voice recording & Whisper transcription
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const [selectedLanguage, setSelectedLanguage] = React.useState<ChatLanguage>("auto");

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const speechRecognitionRef = React.useRef<any>(null);
  const queueTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // ── Clear queue timeout on unmount ──────────────────────────────────────────
  React.useEffect(() => {
    return () => {
      if (queueTimeoutRef.current) {
        clearTimeout(queueTimeoutRef.current);
      }
    };
  }, []);

  // ── Restore or initialize session from localStorage ─────────────────────────
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.sessionId) {
          setSessionId(parsed.sessionId);
          if (parsed.language) {
            setSelectedLanguage(parsed.language);
          }
          if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            setMessages(parsed.messages);
            return;
          }
        }
      }
    } catch {
      // LocalStorage access fallback
    }

    const newSessionId = crypto.randomUUID();
    const initialLang: ChatLanguage = "auto";
    setSelectedLanguage(initialLang);

    const initialMessage: ChatMessage = {
      id: "initial-welcome",
      sender: "assistant",
      text: WELCOME_MESSAGES[initialLang],
      timestamp: new Date().toISOString(),
    };
    setSessionId(newSessionId);
    setMessages([initialMessage]);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sessionId: newSessionId, language: initialLang, messages: [initialMessage] })
      );
    } catch {
      // Non-blocking storage
    }
  }, []);

  // ── Persist messages & language ─────────────────────────────────────────────
  React.useEffect(() => {
    if (sessionId && messages.length > 0) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ sessionId, language: selectedLanguage, messages })
        );
      } catch {
        // Storage quota protection
      }
    }
  }, [messages, sessionId, selectedLanguage]);

  // ── Scroll to bottom on new messages ────────────────────────────────────────
  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // ── Proactive Jarvis Teaser ──────────────────────────────────────────────────
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && messages.length <= 1) {
        setShowProactiveBubble(true);
      }
    }, 22000);
    return () => clearTimeout(timer);
  }, [isOpen, messages.length]);

  // ── Futuristic HUD Boot Trigger ─────────────────────────────────────────────
  React.useEffect(() => {
    if (isOpen) {
      setIsBooting(true);
      const timer = setTimeout(() => {
        setIsBooting(false);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ── Global event listener for opening chat from CTA buttons ─────────────────
  React.useEffect(() => {
    function handleOpenChat(e: Event) {
      setIsOpen(true);
      setShowProactiveBubble(false);
      const customEvent = e as CustomEvent<{ initialText?: string }>;
      if (customEvent.detail?.initialText) {
        setInputMessage(customEvent.detail.initialText);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }

    window.addEventListener("devyx:open-chat", handleOpenChat);
    return () => {
      window.removeEventListener("devyx:open-chat", handleOpenChat);
    };
  }, []);

  // ── Jarvis Action Executor ───────────────────────────────────────────────────
  const executeJarvisActions = React.useCallback(
    (actions?: JarvisAction[]) => {
      if (!actions || !Array.isArray(actions) || actions.length === 0) return;

      actions.forEach((act) => {
        try {
          switch (act.type) {
            case "SET_THEME":
              if (act.payload === "dark" || act.payload === "light") {
                setTheme(act.payload);
                setActionNotice(`🎨 Theme set to ${act.payload.toUpperCase()}`);
                setTimeout(() => setActionNotice(null), 3500);
              }
              break;

            case "NAVIGATE":
              if (typeof act.payload === "string" && act.payload.startsWith("/")) {
                let targetPath = act.payload;
                const localeMatch = targetPath.match(/^\/(?:en|fr|ar)(\/.*)?$/);
                if (localeMatch) {
                  targetPath = localeMatch[1] || "/";
                }
                router.push(targetPath);
                setActionNotice(`📁 Navigated to ${targetPath}`);
                setTimeout(() => setActionNotice(null), 3500);
              }
              break;

            case "SET_LOCALE":
              if (
                act.payload === "ar" ||
                act.payload === "fr" ||
                act.payload === "en" ||
                act.payload === "darija"
              ) {
                const targetLang = act.payload as ChatLanguage;
                setSelectedLanguage(targetLang);
                if (targetLang === "ar" || targetLang === "fr" || targetLang === "en") {
                  router.replace(pathname, { locale: targetLang });
                }
                const langLabels: Record<string, string> = {
                  darija: "🇩🇿 DARIJA",
                  fr: "FRANÇAIS 🇫🇷",
                  en: "ENGLISH 🇬🇧",
                  ar: "العربية 🇸🇦",
                };
                setActionNotice(`🌐 Language mode switched to ${langLabels[targetLang] || targetLang.toUpperCase()}`);
                setTimeout(() => setActionNotice(null), 3500);
              }
              break;

            case "SCROLL_TO":
              if (typeof act.payload === "string") {
                const el = document.querySelector(act.payload);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }
              break;

            default:
              break;
          }
        } catch (e) {
          console.warn("[Jarvis Action Execution Error]", e);
        }
      });
    },
    [setTheme, router, pathname]
  );

  // ── File Attachment Handler ──────────────────────────────────────────────────
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!e.target) return;
    // Reset input so same file can be re-selected
    (e.target as HTMLInputElement).value = "";

    if (!file) return;

    setAttachmentError(null);

    // Type validation (Images only: PNG, JPEG, WEBP)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAttachmentError(
        selectedLanguage === "fr"
          ? "Format non supporté. Seules les images (PNG, JPG, WEBP) sont acceptées."
          : selectedLanguage === "darija" || selectedLanguage === "ar"
          ? "الملف غير مدعوم. المقبول: صور فقط (PNG أو JPG)."
          : "Unsupported format. Only PNG, JPG, or WEBP images are accepted."
      );
      return;
    }

    // Size validation (2MB ceiling)
    if (file.size > MAX_FILE_SIZE) {
      setAttachmentError(
        selectedLanguage === "fr"
          ? "Image trop volumineuse. Limite maximale : 2MB."
          : selectedLanguage === "darija" || selectedLanguage === "ar"
          ? "الصورة كبيرة بزاف. الحد الأقصى: 2MB."
          : "Image too large. Maximum size is 2MB."
      );
      return;
    }

    // Convert to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data URL prefix (data:image/jpeg;base64,...)
        const base64Data = result.split(",")[1] ?? result;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Generate preview URL for images
    const isImage = file.type.startsWith("image/");
    let previewUrl: string | undefined;
    if (isImage) {
      previewUrl = URL.createObjectURL(file);
    }

    setAttachment({
      file,
      previewUrl,
      base64,
      type: file.type,
      name: file.name,
      size: file.size,
    });
  }

  function clearAttachment() {
    if (attachment?.previewUrl && !attachment.previewUrl.startsWith("data:")) {
      try {
        URL.revokeObjectURL(attachment.previewUrl);
      } catch {}
    }
    setAttachment(null);
    setAttachmentError(null);
  }

  function handleMarkupApply(annotatedBase64: string) {
    if (!attachment) return;
    const dataUrl = `data:image/png;base64,${annotatedBase64}`;
    const estimatedSize = Math.round((annotatedBase64.length * 3) / 4);

    setAttachment({
      ...attachment,
      base64: annotatedBase64,
      previewUrl: dataUrl,
      type: "image/png",
      size: estimatedSize,
      name: attachment.name.replace(/\.[^/.]+$/, "") + "-annotated.png",
    });
    setActionNotice("✏️ Image markup applied! Ready to send.");
    setTimeout(() => setActionNotice(null), 3000);
  }

  // ── Voice Recording ──────────────────────────────────────────────────────────
  async function toggleVoiceRecording() {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
      return;
    }

    // Attempt MediaRecorder + /api/transcribe (Whisper AI / Gemini Audio)
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mimeType =
          typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "audio/wav";

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          if (audioBlob.size < 200) return;

          setIsTranscribing(true);
          setActionNotice("🎙️ Transcribing voice note (Whisper AI)...");

          try {
            const formData = new FormData();
            formData.append("file", audioBlob, `voice_note.${mimeType.split("/")[1] || "webm"}`);

            const res = await fetch("/api/transcribe", {
              method: "POST",
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              if (data.text?.trim()) {
                setInputMessage((prev) => (prev ? prev + " " + data.text.trim() : data.text.trim()));
                setActionNotice(`✨ Voice transcribed (${data.provider || "Whisper"})`);
                setTimeout(() => setActionNotice(null), 2500);
              }
            } else {
              setActionNotice("⚠️ Transcription service unavailable.");
              setTimeout(() => setActionNotice(null), 3000);
            }
          } catch (transcribeErr) {
            console.warn("[Transcribe Upload Error]", transcribeErr);
            setActionNotice("⚠️ Failed to transcribe audio.");
            setTimeout(() => setActionNotice(null), 3000);
          } finally {
            setIsTranscribing(false);
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        };

        recorder.start();
        setIsListening(true);
        setActionNotice("🎙️ Recording... Click mic again when done.");
        return;
      } catch (mediaErr) {
        console.warn("[MediaRecorder Audio Init Failure, falling back to Web Speech API]", mediaErr);
      }
    }

    // Fallback: Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setActionNotice("⚠️ Voice input not supported in this browser.");
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      speechRecognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.lang =
        selectedLanguage === "darija" || selectedLanguage === "ar"
          ? "ar-DZ"
          : selectedLanguage === "fr"
          ? "fr-FR"
          : selectedLanguage === "en"
          ? "en-US"
          : (typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US");

      recognition.onstart = () => {
        setIsListening(true);
        setActionNotice("🎙️ Listening... Speak your request now.");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? prev + " " + transcript : transcript));
          setActionNotice(null);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[Voice Recognition Error]", event.error);
        setIsListening(false);
        setActionNotice("⚠️ Mic error or permission denied.");
        setTimeout(() => setActionNotice(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      };

      recognition.start();
    } catch (err) {
      console.warn("[Speech Recognition Init Failure]", err);
      setIsListening(false);
    }
  }

  // ── Language Change ──────────────────────────────────────────────────────────
  function handleLanguageChange(newLang: ChatLanguage) {
    setSelectedLanguage(newLang);
    if (newLang === "ar" || newLang === "fr" || newLang === "en") {
      router.replace(pathname, { locale: newLang });
    }
    if (messages.length <= 1) {
      const updatedWelcome: ChatMessage = {
        id: "initial-welcome",
        sender: "assistant",
        text: WELCOME_MESSAGES[newLang],
        timestamp: new Date().toISOString(),
      };
      setMessages([updatedWelcome]);
    }
  }

  // ── Send Message ─────────────────────────────────────────────────────────────
  async function sendMessage(
    textToSend?: string,
    options?: { isRetry?: boolean; retryCount?: number; retryAttachment?: AttachmentPreview }
  ) {
    const rawText = textToSend !== undefined ? textToSend : inputMessage;
    const trimmed = rawText.trim();
    const isRetry = options?.isRetry ?? false;
    const retryCount = options?.retryCount ?? 0;
    const activeAttachment = options?.retryAttachment ?? attachment;

    // Anti-spam cooldown gate: block rapid-fire message spam to preserve token budget
    if (cooldownRemaining > 0 && !isRetry) {
      setActionNotice(`⏳ Pacing: Please wait ${cooldownRemaining}s before sending.`);
      setTimeout(() => setActionNotice(null), 2000);
      return;
    }

    // Need either text or attachment
    if ((!trimmed && !activeAttachment) || (isLoading && !isRetry)) return;

    // Build user message for display on initial dispatch (not on background queue retries)
    if (!isRetry) {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "user",
        text: trimmed || `📎 ${activeAttachment!.name}`,
        timestamp: new Date().toISOString(),
        attachmentPreview: activeAttachment
          ? {
              name: activeAttachment.name,
              type: activeAttachment.type,
              previewUrl: activeAttachment.base64
                ? `data:${activeAttachment.type};base64,${activeAttachment.base64}`
                : activeAttachment.previewUrl,
            }
          : undefined,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
    }

    setIsLoading(true);

    // Anti-spam token pacing: 1-second debounce cooldown
    if (!isRetry) {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      setCooldownRemaining(1);
      cooldownTimerRef.current = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    const currentAttachment = activeAttachment;
    if (!isRetry) {
      clearAttachment();
    }

    try {
      // Extract recent conversation history for memory (last 10 turns, excluding failed/queued/initial-welcome)
      const history = messages
        .filter((m) => m.text && !m.failed && !m.queued && m.id !== "initial-welcome")
        .slice(-10)
        .map((m) => ({
          role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
          content: m.text.slice(0, 2000),
        }));

      const body: Record<string, any> = {
        sessionId,
        message: trimmed,
        language: selectedLanguage,
        currentPage: window.location.pathname,
        theme: resolvedTheme === "light" ? "light" : "dark",
        history,
      };

      if (currentAttachment) {
        body.attachment = {
          type: currentAttachment.type,
          data: currentAttachment.base64,
          name: currentAttachment.name,
          size: currentAttachment.size,
        };
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // Update token budget display
      if (data.tokenBudget) {
        setTokenBudget(data.tokenBudget);
      }

      // Handle queued response (202)
      if (response.status === 202 && data.queued) {
        const waitSec = Math.max(1, Math.round((data.estimatedWaitMs || 1200) / 1000));
        const queueMsg =
          selectedLanguage === "darija"
            ? `⏳ كاين ${data.queuePosition} فـ الطابور — غادي نجاوبك فـ ~${waitSec} ثواني`
            : selectedLanguage === "fr"
            ? `⏳ En file d'attente (position #${data.queuePosition}) — réponse dans ~${waitSec}s`
            : `⏳ In queue (Position #${data.queuePosition}) — processing in ~${waitSec}s`;
        setQueueNotice(queueMsg);

        // Display or update the queued notice placeholder in chat
        setMessages((prev) => {
          const hasQueued = prev.some((m) => m.queued);
          if (hasQueued) {
            return prev.map((m) => (m.queued ? { ...m, text: data.reply } : m));
          }
          const queuedBotMsg: ChatMessage = {
            id: crypto.randomUUID(),
            sender: "assistant",
            text: data.reply,
            timestamp: new Date().toISOString(),
            queued: true,
          };
          return [...prev, queuedBotMsg];
        });

        // Automatically schedule polling retry after wait estimate (up to 8 retries)
        if (queueTimeoutRef.current) clearTimeout(queueTimeoutRef.current);
        const retryDelay = Math.min(8000, Math.max(1000, data.estimatedWaitMs || 1200));
        if (retryCount < 8) {
          queueTimeoutRef.current = setTimeout(() => {
            sendMessage(trimmed, {
              isRetry: true,
              retryCount: retryCount + 1,
              retryAttachment: currentAttachment || undefined,
            });
          }, retryDelay);
        }

        return;
      }

      // Automatic retry with backoff on transient 429 concurrency spikes
      if (response.status === 429 && data.error === "RATE_LIMIT_EXCEEDED" && retryCount < 3) {
        setActionNotice("⏳ Server traffic peak. Auto-retrying in 2s...");
        setTimeout(() => {
          sendMessage(trimmed, {
            isRetry: true,
            retryCount: retryCount + 1,
            retryAttachment: currentAttachment || undefined,
          });
        }, 2000);
        return;
      }

      // Clear any active queue polling timeout
      if (queueTimeoutRef.current) {
        clearTimeout(queueTimeoutRef.current);
        queueTimeoutRef.current = null;
      }

      if (!response.ok && !data.reply) {
        throw new Error(data.error || "Communication failure");
      }

      // Clear queue notice if we got a real response
      setQueueNotice(null);

      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text: data.reply || "Transmission received by engineering pipeline.",
        timestamp: new Date().toISOString(),
        actions: data.actions,
        handoff: data.handoff,
        estimate: data.estimate,
        tokenBudget: data.tokenBudget,
      };

      // If there was a queued placeholder message, swap it with the resolved response
      setMessages((prev) => {
        const hasQueued = prev.some((m) => m.queued);
        if (hasQueued) {
          return prev.map((m) => (m.queued ? botMessage : m));
        }
        return [...prev, botMessage];
      });

      // Execute any Jarvis actions returned
      if (data.actions) {
        executeJarvisActions(data.actions);
      }

      // Show completion notification
      if (queueNotice) {
        setActionNotice(
          selectedLanguage === "darija"
            ? "✅ تم استلام الرد — اقرأ الجواب أسفل!"
            : selectedLanguage === "fr"
            ? "✅ L'assistant a répondu !"
            : "✅ AI Assistant responded!"
        );
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch {
      if (queueTimeoutRef.current) {
        clearTimeout(queueTimeoutRef.current);
        queueTimeoutRef.current = null;
      }
      setQueueNotice(null);

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text:
          selectedLanguage === "darija"
            ? "تعذر إرسال الرسالة إلى مسار التأهيل الآلي. تقدر تواصل مباشرة عبر [واتساب](https://wa.me/213000000000) أو عاود حاول مجدداً."
            : selectedLanguage === "ar"
            ? "تعذر إرسال الرسالة إلى مسار التأهيل الآلي. يُرجى التحقق من اتصالك والمحاولة مجدداً."
            : selectedLanguage === "fr"
            ? "Échec de transmission vers le pipeline de qualification. Veuillez vérifier votre connexion et réessayer."
            : "Transmission failure to the qualification pipeline. Please check your network connection and retry.",
        timestamp: new Date().toISOString(),
        failed: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleResetChat() {
    if (queueTimeoutRef.current) {
      clearTimeout(queueTimeoutRef.current);
      queueTimeoutRef.current = null;
    }
    const newSessionId = crypto.randomUUID();
    const initialMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "assistant",
      text: WELCOME_MESSAGES[selectedLanguage],
      timestamp: new Date().toISOString(),
    };
    setSessionId(newSessionId);
    setMessages([initialMessage]);
    setTokenBudget(null);
    setQueueNotice(null);
    clearAttachment();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sessionId: newSessionId, language: selectedLanguage, messages: [initialMessage] })
      );
    } catch {
      // Ignore
    }
  }

  const starters = STARTER_PROMPTS[selectedLanguage] || STARTER_PROMPTS.darija;

  // ── Budget Bar ───────────────────────────────────────────────────────────────
  const budgetPct = tokenBudget
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round((tokenBudget.sessionRemaining / (tokenBudget.hourlyLimit || 2000)) * 100)
        )
      )
    : null;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-3 end-3 sm:bottom-6 sm:end-6 z-50 flex flex-col items-end max-w-[calc(100vw-1.5rem)]">
      {/* Action Notice HUD Pill */}
      {actionNotice && (
        <div className="mb-2 px-3 py-1.5 bg-bg-elevated border border-accent-signal text-accent-signal text-xs font-mono clip-chamfer shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Queue Notification Banner */}
      {queueNotice && (
        <div className="mb-2 px-3 py-1.5 bg-bg-elevated border border-amber-500/60 text-amber-400 text-xs font-mono clip-chamfer shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 animate-pulse" />
          <span>{queueNotice}</span>
        </div>
      )}

      {/* Proactive Floating Jarvis Teaser */}
      {!isOpen && showProactiveBubble && (
        <div className="mb-3 max-w-xs p-3 bg-bg-surface border border-accent-primary shadow-2xl clip-chamfer animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-start gap-2 select-none relative">
          <ChamferCornerLine className="text-accent-primary" />
          <button
            type="button"
            onClick={() => setShowProactiveBubble(false)}
            aria-label="Dismiss Jarvis reminder"
            className="absolute top-1.5 end-1.5 text-text-muted hover:text-text-primary p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary text-accent-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-accent-signal" />
          </div>
          <div
            onClick={() => {
              setShowProactiveBubble(false);
              setIsOpen(true);
            }}
            className="cursor-pointer"
          >
            <div className="font-mono text-[9px] text-accent-signal font-bold uppercase mb-0.5">
              // DEVYX_JARVIS_AGENT
            </div>
            <p className="font-sans text-[11px] text-text-primary leading-tight">
              {selectedLanguage === "darija"
                ? "Salam! Bghiti chi ma3loumat 3la les projets wela devis gratuit f d9i9a?"
                : selectedLanguage === "fr"
                ? "Bonjour ! Souhaitez-vous une estimation gratuite ou explorer nos réalisations ?"
                : "Hello! Looking for an instant technical estimate or architectural review?"}
            </p>
          </div>
        </div>
      )}

      {/* Expanded Chat Window with Futuristic HUD Deployment */}
      {isOpen && (
        <div className="relative mb-3 group/hud select-text">
          {/* Tactical HUD Corner Reticles (Locking into place on deployment) */}
          {isBooting && (
            <>
              {/* Top-Left Target Bracket */}
              <div className="absolute -top-3 -left-3 z-40 pointer-events-none text-accent-signal flex flex-col animate-hud-corner-tl">
                <div className="flex items-center gap-1 font-mono text-[8px] tracking-widest text-accent-signal/90 font-bold">
                  <span className="w-3.5 h-3.5 border-t-2 border-l-2 border-accent-signal" />
                  <span className="opacity-90">SYS:01</span>
                </div>
              </div>

              {/* Top-Right Target Bracket */}
              <div className="absolute -top-3 -right-3 z-40 pointer-events-none text-accent-signal flex flex-col items-end animate-hud-corner-tr">
                <div className="flex items-center gap-1 font-mono text-[8px] tracking-widest text-accent-signal/90 font-bold">
                  <span className="opacity-90">LINK:100%</span>
                  <span className="w-3.5 h-3.5 border-t-2 border-r-2 border-accent-signal" />
                </div>
              </div>

              {/* Bottom-Left Target Bracket */}
              <div className="absolute -bottom-3 -left-3 z-40 pointer-events-none text-accent-signal flex flex-col animate-hud-corner-bl">
                <div className="flex items-center gap-1 font-mono text-[8px] tracking-widest text-accent-signal/90 font-bold">
                  <span className="w-3.5 h-3.5 border-b-2 border-l-2 border-accent-signal" />
                  <span className="opacity-90">DEVYX_AI</span>
                </div>
              </div>

              {/* Bottom-Right Target Bracket */}
              <div className="absolute -bottom-3 -right-3 z-40 pointer-events-none text-accent-signal flex flex-col items-end animate-hud-corner-br">
                <div className="flex items-center gap-1 font-mono text-[8px] tracking-widest text-accent-signal/90 font-bold">
                  <span className="opacity-90">HUD_ACTIVE</span>
                  <span className="w-3.5 h-3.5 border-b-2 border-r-2 border-accent-signal" />
                </div>
              </div>
            </>
          )}

          {/* Main Chamfered HUD Panel */}
          <div
            role="dialog"
            aria-label="Devyx AI Qualification Assistant"
            className="w-[calc(100vw-1.5rem)] sm:w-[440px] h-[560px] sm:h-[630px] max-h-[88dvh] bg-bg-surface/95 backdrop-blur-md border border-accent-signal/40 shadow-2xl clip-chamfer flex flex-col overflow-hidden animate-hud-deploy relative"
          >
            <ChamferCornerLine className="text-accent-signal/40" />
            {/* Holographic Laser Scanline Sweep */}
            {isBooting && (
              <div className="absolute inset-x-0 z-50 pointer-events-none animate-hud-laser">
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-accent-signal via-white to-transparent shadow-[0_0_18px_#00E0FF,0_0_35px_#00E0FF]" />
                <div className="h-16 w-full bg-gradient-to-b from-accent-signal/20 to-transparent" />
              </div>
            )}

            {/* Micro Boot Telemetry HUD Bar (First 650ms) */}
            {isBooting && (
              <div className="absolute top-0 inset-x-0 z-40 pointer-events-none animate-hud-telemetry">
                <div className="h-0.5 bg-gradient-to-r from-accent-secondary via-accent-signal to-white animate-hud-ticker" />
                <div className="px-3 py-1 bg-bg-primary/90 border-b border-accent-signal/30 flex items-center justify-between text-[8px] font-mono text-accent-signal">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-signal animate-ping" />
                    <span>DEVYX_AI // QUANTUM_STREAM_INITIALIZED</span>
                  </div>
                  <span className="font-bold tracking-wider">OK // 200</span>
                </div>
              </div>
            )}

            {/* Subtle Blueprint Mesh Grid overlay */}
            <div className="absolute inset-0 blueprint-grid opacity-15 pointer-events-none z-0" />
          {/* Blueprint Terminal Header */}
          <div className="px-4 pt-3 pb-2.5 bg-bg-elevated border-b border-border-grid flex flex-col select-none">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-status-operational animate-pulse flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-text-primary tracking-tight">
                    Devyx Assistant
                  </span>
                  <span className="font-mono text-[10px] text-status-operational font-medium">
                    • Online
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Reset conversation memory"
                  className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors clip-chamfer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Minimize chat window"
                  aria-label="Close chat"
                  className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors clip-chamfer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Language Switcher Pills */}
            <div className="flex items-center justify-between pt-2 border-t border-border-grid/60">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-text-muted me-1 uppercase tracking-wider">LANG:</span>
                {(["auto", "darija", "ar", "fr", "en"] as ChatLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={`text-[10px] font-mono px-2 py-0.5 leading-none transition-colors clip-chamfer flex items-center justify-center ${
                      selectedLanguage === lang
                        ? "bg-accent-primary text-bg-primary font-bold shadow-sm"
                        : "text-text-muted hover:text-text-primary bg-bg-surface border border-border-grid"
                    }`}
                  >
                    {lang === "auto" ? "AUTO" : lang === "darija" ? "🇩🇿 دارجة" : lang === "ar" ? "العربية" : lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[92%] p-3.5 clip-chamfer text-xs ${
                      isUser
                        ? "bg-accent-primary text-bg-primary font-medium"
                        : msg.queued
                        ? "bg-bg-elevated border border-amber-500/40 text-text-secondary space-y-2.5"
                        : "bg-bg-elevated border border-border-grid text-text-primary space-y-2.5"
                    }`}
                  >
                    {isUser ? (
                      <div className="space-y-2">
                        {/* Image preview in user bubble with click-to-expand and fallback */}
                        {msg.attachmentPreview?.previewUrl && (
                          <div className="relative group overflow-hidden rounded border border-bg-primary/30 shadow-md w-fit max-w-full">
                            <img
                              src={msg.attachmentPreview.previewUrl}
                              alt={msg.attachmentPreview.name}
                              onClick={() => {
                                if (msg.attachmentPreview?.previewUrl) {
                                  setLightboxImage({
                                    url: msg.attachmentPreview.previewUrl,
                                    name: msg.attachmentPreview.name,
                                  });
                                }
                              }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                                const fallbackEl = document.getElementById(`fallback-${msg.id}`);
                                if (fallbackEl) fallbackEl.style.display = "flex";
                              }}
                              className="w-auto max-w-full max-h-[220px] object-contain rounded cursor-pointer hover:opacity-90 transition-opacity block"
                            />
                            <div
                              id={`fallback-${msg.id}`}
                              style={{ display: "none" }}
                              className="items-center gap-1.5 text-[10px] opacity-90 p-2 bg-bg-primary/20 rounded border border-bg-primary/30"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{msg.attachmentPreview.name}</span>
                            </div>
                          </div>
                        )}
                        {msg.attachmentPreview && !msg.attachmentPreview.previewUrl && (
                          <div className="flex items-center gap-1.5 text-[10px] opacity-80">
                            <FileText className="w-3 h-3" />
                            <span>{msg.attachmentPreview.name}</span>
                          </div>
                        )}
                        {msg.text && (
                          <p className="whitespace-pre-wrap leading-relaxed font-sans">
                            {msg.text}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        {msg.queued && (
                          <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-mono mb-1">
                            <Clock className="w-3 h-3" />
                            <span>QUEUED — waiting for available slot</span>
                          </div>
                        )}
                        <RenderMarkdown text={msg.text} />

                        {/* Interactive Project Cost & Timeline Estimator Card */}
                        {msg.estimate && (
                          <div className="mt-3 p-3 bg-bg-surface border border-accent-primary clip-chamfer space-y-2 select-none">
                            <div className="flex items-center justify-between pb-1.5 border-b border-border-grid">
                              <span className="font-mono text-[10px] text-accent-signal font-bold uppercase flex items-center gap-1">
                                <Calculator className="w-3 h-3 text-accent-signal inline" />
                                // DEVYX_PRELIMINARY_ESTIMATE
                              </span>
                              <span className="font-mono text-[9px] px-1 bg-accent-primary text-bg-primary font-semibold">
                                {msg.estimate.projectType}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 py-1">
                              <div className="p-2 bg-bg-elevated border border-border-grid">
                                <span className="font-mono text-[9px] text-text-muted block">ESTIMATED_COST</span>
                                <span className="font-mono text-sm font-bold text-accent-primary block mt-0.5">
                                  {msg.estimate.estimatedCost}
                                </span>
                              </div>
                              <div className="p-2 bg-bg-elevated border border-border-grid">
                                <span className="font-mono text-[9px] text-text-muted block flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5 text-accent-signal inline" />
                                  SPRINT_TIMELINE
                                </span>
                                <span className="font-mono text-sm font-bold text-text-primary block mt-0.5">
                                  {msg.estimate.timeline}
                                </span>
                              </div>
                            </div>

                            {Array.isArray(msg.estimate.deliverables) && (
                              <div className="space-y-1 pt-1">
                                <span className="font-mono text-[9px] text-text-muted block uppercase">INCLUDED_DELIVERABLES:</span>
                                {msg.estimate.deliverables.map((del, dIdx) => (
                                  <div key={dIdx} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                                    <CheckCircle2 className="w-3 h-3 text-status-operational flex-shrink-0" />
                                    <span>{del}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {Array.isArray(msg.estimate.suggestedStack) && (
                              <div className="flex flex-wrap gap-1 pt-1 border-t border-border-grid">
                                {msg.estimate.suggestedStack.map((stk, sIdx) => (
                                  <span key={sIdx} className="font-mono text-[9px] px-1.5 py-0.5 bg-bg-elevated border border-border-grid text-accent-signal">
                                    #{stk}
                                  </span>
                                ))}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                sendMessage("Bghit nahder m3a un ingénieur humain bach nvalider had l'devis");
                              }}
                              className="w-full mt-2 py-1.5 bg-accent-primary text-bg-primary font-mono text-[10px] font-bold uppercase tracking-wider clip-chamfer hover:bg-accent-signal transition-colors flex items-center justify-center gap-1.5"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Confirm Scope with Engineering Lead</span>
                            </button>
                          </div>
                        )}

                        {/* Telegram Handoff Card */}
                        {msg.handoff?.requested && (
                          <div className="mt-2.5 p-2.5 bg-bg-surface border border-status-operational clip-chamfer space-y-1.5 select-none">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-status-operational animate-ping" />
                              <span className="font-mono text-[10px] text-status-operational font-bold tracking-wider">
                                // TELEGRAM_SPECIALIST_ALERT_DISPATCHED
                              </span>
                            </div>
                            <p className="font-sans text-[11px] text-text-secondary">
                              Our engineering team has been notified via Telegram with your conversation summary. A lead engineer will review and respond promptly.
                            </p>
                            <a
                              href="https://wa.me/213000000000"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-mono text-accent-primary hover:underline font-semibold"
                            >
                              <span>Direct WhatsApp Hotline</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </>
                    )}

                    {msg.failed && (
                      <div className="mt-3 pt-2 border-t border-border-grid flex items-center justify-between">
                        <span className="text-[10px] text-status-error font-mono">STATUS_500_FAILED</span>
                        <button
                          type="button"
                          onClick={() => {
                            const lastUser = [...messages].reverse().find((m) => m.sender === "user");
                            if (lastUser) sendMessage(lastUser.text);
                          }}
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-accent-primary hover:underline"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* In-Flight Typing Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start animate-in fade-in duration-150">
                <span className="font-mono text-[9px] text-accent-signal mb-1 px-1">
                  // AI_EVALUATING_SYSTEM_SPECS
                </span>
                <div className="p-3 bg-bg-elevated border border-border-grid clip-chamfer flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-accent-primary animate-spin" />
                  <span className="font-mono text-xs text-text-muted">
                    {selectedLanguage === "darija"
                      ? "L'assistant IA kaychouf l'architecture..."
                      : selectedLanguage === "ar"
                      ? "جاري تحليل المتطلبات وهندسة الإجابة..."
                      : selectedLanguage === "fr"
                      ? "L'assistant IA évalue les spécifications architecturales..."
                      : "AI Assistant analyzing technical specs..."}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attachment Preview Strip */}
          {attachment && (
            <div className="px-3 py-2 bg-bg-elevated border-t border-border-grid flex items-center gap-2 select-none">
              <div className="relative group">
                {attachment.previewUrl ? (
                  <img
                    src={attachment.previewUrl}
                    alt={attachment.name}
                    className="w-10 h-10 object-cover border border-border-grid flex-shrink-0 rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-bg-surface border border-border-grid flex items-center justify-center flex-shrink-0 rounded">
                    <FileText className="w-5 h-5 text-accent-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] text-text-primary truncate">{attachment.name}</p>
                <p className="font-mono text-[9px] text-text-muted">
                  {(attachment.size / 1024).toFixed(0)} KB · {attachment.type.split("/")[1]?.toUpperCase() || "IMAGE"}
                  {attachment.name.includes("-annotated") && (
                    <span className="ms-1.5 text-accent-signal font-bold">✓ Annotated</span>
                  )}
                </p>
              </div>

              {/* Quick Markup / Draw button */}
              {attachment.type.startsWith("image/") && (
                <button
                  type="button"
                  onClick={() => setIsMarkupModalOpen(true)}
                  className="px-2.5 py-1 font-mono text-[10px] bg-accent-primary text-bg-primary hover:bg-accent-signal font-bold clip-chamfer flex items-center gap-1 transition-colors shadow-sm flex-shrink-0"
                  title="Draw zones or add text callouts to this picture"
                >
                  <Pencil className="w-3 h-3" />
                  <span>
                    {selectedLanguage === "fr"
                      ? "Annoter"
                      : selectedLanguage === "darija" || selectedLanguage === "ar"
                      ? "تعديل ورسم"
                      : "Annotate / Draw"}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={clearAttachment}
                className="p-1 text-text-muted hover:text-status-error flex-shrink-0"
                title="Remove attachment"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Attachment Error */}
          {attachmentError && (
            <div className="px-3 py-1.5 bg-status-error/10 border-t border-status-error/30 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-status-error flex-shrink-0" />
              <span className="font-mono text-[10px] text-status-error">{attachmentError}</span>
              <button
                type="button"
                onClick={() => setAttachmentError(null)}
                className="ms-auto text-status-error hover:opacity-80"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Technical Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-bg-elevated border-t border-border-grid space-y-2 select-none"
          >
            <div className="flex items-center gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Attach file"
              />

              {/* Paperclip / Attach Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Attach image (PNG, JPG, max 2MB)"
                className={`relative w-10 h-10 clip-chamfer flex items-center justify-center transition-colors flex-shrink-0 group ${
                  attachment
                    ? "bg-accent-primary text-bg-primary"
                    : "bg-bg-surface text-text-secondary hover:text-accent-primary"
                } disabled:opacity-50`}
              >
                {!attachment && <ChamferButtonBorder />}
                <Paperclip className="w-4 h-4 relative z-20" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  cooldownRemaining > 0
                    ? `⏳ Pacing (${cooldownRemaining}s)... preserving tokens`
                    : isTranscribing
                    ? "Transcribing with Whisper AI..."
                    : isListening
                    ? "Recording voice note... Click mic to stop"
                    : attachment
                    ? selectedLanguage === "fr"
                      ? "Ajoutez un commentaire (optionnel)..."
                      : selectedLanguage === "darija" || selectedLanguage === "ar"
                      ? "أضف تعليقاً (اختياري)..."
                      : "Add a comment (optional)..."
                    : PLACEHOLDER_TEXT[selectedLanguage]
                }
                maxLength={1500}
                disabled={isLoading}
                className={`flex-1 h-10 px-3 bg-bg-surface border text-text-primary font-mono text-base sm:text-xs focus:border-accent-primary focus:outline-none disabled:opacity-50 ${
                  isListening
                    ? "border-status-error animate-pulse text-status-error placeholder:text-status-error"
                    : isTranscribing
                    ? "border-accent-primary animate-pulse text-accent-primary placeholder:text-accent-primary"
                    : "border-border-grid"
                }`}
              />

              {/* Voice Note Microphone Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                disabled={isTranscribing}
                title={isTranscribing ? "Transcribing voice..." : isListening ? "Stop listening" : "Speak voice note"}
                className={`relative w-10 h-10 clip-chamfer flex items-center justify-center transition-colors flex-shrink-0 group ${
                  isListening
                    ? "bg-status-error text-white animate-pulse"
                    : isTranscribing
                    ? "bg-accent-primary/20 text-accent-primary animate-pulse"
                    : "bg-bg-surface text-text-secondary hover:text-accent-primary"
                }`}
              >
                {!isListening && !isTranscribing && <ChamferButtonBorder />}
                {isTranscribing ? (
                  <Loader2 className="w-4 h-4 animate-spin relative z-20" />
                ) : isListening ? (
                  <MicOff className="w-4 h-4 relative z-20" />
                ) : (
                  <Mic className="w-4 h-4 relative z-20" />
                )}
              </button>

              <button
                type="submit"
                disabled={(!inputMessage.trim() && !attachment) || isLoading || cooldownRemaining > 0}
                aria-label="Send message"
                className="w-10 h-10 bg-accent-primary text-bg-primary clip-chamfer flex items-center justify-center hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-transform disabled:opacity-50 disabled:pointer-events-none flex-shrink-0"
              >
                {cooldownRemaining > 0 ? (
                  <span className="text-[10px] font-mono font-bold tracking-tighter">{cooldownRemaining}s</span>
                ) : (
                  <Send className="w-4 h-4 rtl:rotate-180" />
                )}
              </button>
            </div>

            {/* Footer: budget bar + char counter */}
            <div className="flex items-center justify-between text-[9px] font-mono text-text-muted px-1 gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Shield className="w-2.5 h-2.5 text-accent-signal flex-shrink-0" />
                {budgetPct !== null ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="truncate">BUDGET (HOURLY)</span>
                    <div className="flex-1 h-1 bg-bg-surface border border-border-grid/50 min-w-[36px]">
                      <div
                        className={`h-full transition-all ${
                          budgetPct > 50
                            ? "bg-status-operational"
                            : budgetPct > 20
                            ? "bg-amber-500"
                            : "bg-status-error"
                        }`}
                        style={{ width: `${budgetPct}%` }}
                      />
                    </div>
                    <span className="flex-shrink-0 text-accent-signal">
                      {tokenBudget?.resetsInMinutes ? `⏳ ${tokenBudget.resetsInMinutes}m` : `${budgetPct}%`}
                    </span>
                  </div>
                ) : (
                  <span className="truncate">DEVYX // COPILOT</span>
                )}
              </div>
              <span className="flex-shrink-0">{inputMessage.length}/1500</span>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowProactiveBubble(false);
        }}
        aria-label="Toggle Devyx AI Engineering Assistant"
        className="min-h-[44px] sm:h-13 px-3 sm:px-4 py-2 bg-bg-surface border border-border-grid text-text-primary clip-chamfer shadow-xl hover:border-accent-primary transition-all flex items-center gap-2 sm:gap-3 group relative select-none hover:-translate-y-0.5 active:scale-95"
      >
        <ChamferCornerLine />
        <span className="w-2.5 h-2.5 bg-status-operational rounded-full animate-pulse flex-shrink-0" />
        <div className="flex flex-col text-start leading-tight">
          <span className="font-mono text-[9px] sm:text-[10px] text-accent-signal uppercase tracking-wider font-bold flex items-center gap-1">
            DEVYX // AI ASSISTANT
            <span className="hidden sm:inline text-[8px] bg-accent-signal/10 px-1 border border-accent-signal/30 text-accent-signal">
              {selectedLanguage === "auto" ? "AUTO" : selectedLanguage === "darija" ? "🇩🇿 DARIJA" : selectedLanguage.toUpperCase()}
            </span>
          </span>
          <span className="font-sans text-[11px] sm:text-xs text-text-secondary group-hover:text-text-primary transition-colors">
            {pageLocale === "ar"
              ? "استشر المساعد التقني الذكي"
              : pageLocale === "fr"
              ? "Devyx AI (Contrôle & Devis)"
              : "Devyx AI (Control & Estimator)"}
          </span>
        </div>
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-bg-elevated border border-border-grid flex items-center justify-center text-accent-primary group-hover:bg-accent-primary group-hover:text-bg-primary transition-colors flex-shrink-0 clip-chamfer">
          {isOpen ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </div>
      </button>

      {/* Interactive Image Markup Modal */}
      {attachment && isMarkupModalOpen && (
        <ImageMarkupModal
          isOpen={isMarkupModalOpen}
          onClose={() => setIsMarkupModalOpen(false)}
          imageSrc={
            attachment.base64
              ? `data:${attachment.type};base64,${attachment.base64}`
              : attachment.previewUrl || ""
          }
          imageName={attachment.name}
          onApply={handleMarkupApply}
          language={selectedLanguage}
        />
      )}

      {/* Fullsize Image Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-bg-surface border border-accent-primary/40 p-3 clip-chamfer flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border-grid mb-2">
              <span className="font-mono text-xs text-text-primary font-bold truncate">
                {lightboxImage.name}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.name}
              className="max-w-full max-h-[75vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
