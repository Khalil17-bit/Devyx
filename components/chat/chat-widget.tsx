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
  Moon,
  Sun,
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
} from "lucide-react";
import type { JarvisAction, HandoffData, EstimateData } from "@/lib/ai/assistant-context";

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
  tokenBudget?: { dailyRemaining: number; sessionRemaining: number };
}

const STORAGE_KEY = "devyx_ai_chat_session_v3";

type ChatLanguage = "darija" | "ar" | "fr" | "en";

// ─── Static Content ───────────────────────────────────────────────────────────

const STARTER_PROMPTS: Record<ChatLanguage, string[]> = {
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
  darija:
    "مرحبا بيك فـ ديفيكس (**Devyx Jarvis Copilot**)! 👋\n\nأنا المساعد التقني الذكي ديالك. عندي تحكم كامل فـ الموقع نقدر:\n" +
    "- 🎨 **نبدل لـ Dark/Light mode**\n" +
    "- 📁 **نفتحلك صفحات المشاريع والخدمات**\n" +
    "- 💰 **نحسبلك دوفيز وتقدير فوري للمشروع**\n" +
    "- 🚨 **نصيفط تقرير لمجموعة تيليجرام باش يتواصل معاك مهندس بشري**\n" +
    "- 📎 **تقدر ترسل لي صور أو ملفات PDF وغادي نحللهم**\n\n" +
    "فاش نقدر نعاونك اليوم؟ تواصل معايا بالكتابة، الصوت، أو بإرسال ملف!",
  ar: "أهلاً بك في نظام **ديفيكس الذكي (Devyx Jarvis)**. أنا مهندسك الاستشاري المؤتمت ومزود بصلاحيات التحكم في المنصة:\n- 🎨 تفعيل الوضع الداكن أو الفاتح\n- 📁 التوجيه الفوري لصفحات المشاريع والخدمات\n- 💰 حساب تقدير أولي للتكلفة والجدول الزمني\n- 🚨 إرسال إشعار فوري لفريق الإدارة عبر Telegram عند طلب استشارة بشرية\n- 📎 تحليل الصور والملفات المرفقة\n\nكيف يمكننا خدمة مشروعكم اليوم؟",
  fr: "Bienvenue sur le terminal **Devyx Jarvis Copilot**. Je suis votre assistant d'ingénierie doté d'un contrôle direct sur la plateforme :\n- 🎨 Basculer entre Dark et Light mode\n- 📁 Naviguer instantanément vers les Projets ou Services\n- 💰 Générer une estimation technique et budgétaire en temps réel\n- 🚨 Déclencher une alerte Telegram prioritaire pour parler à un ingénieur humain\n- 📎 Analyser vos images ou fichiers PDF joints\n\nComment puis-je orienter votre projet aujourd'hui ?",
  en: "Welcome to the **Devyx Jarvis Copilot**. I am your automated engineering consultant with direct platform control:\n- 🎨 Toggle Dark / Light mode on demand\n- 📁 Smoothly navigate to Projects, Services or Contact\n- 💰 Compute instant preliminary cost & timeline estimates\n- 🚨 Dispatch an executive Telegram alert to connect you with a human engineer\n- 📎 Analyze attached images and PDF files\n\nWhat system requirements are you planning to engineer?",
};

const PLACEHOLDER_TEXT: Record<ChatLanguage, string> = {
  darija: "كتب رسالتك بالدارجة، العربية، الفرنسية أو الإنجليزية...",
  ar: "اكتب تفاصيل النظام المطلوب (بحد أقصى 1500 حرف)...",
  fr: "Décrivez votre projet (max 1 500 caractères)...",
  en: "Describe system requirements (max 1,500 chars)...",
};

// Max file sizes in bytes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");

  const parseInline = (lineText: string): React.ReactNode[] => {
    const tokens: React.ReactNode[] = [];
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;
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
      processedSegments.push({
        type: "link",
        content: match[1],
        url: match[2],
      });
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
            className="text-accent-primary font-semibold underline underline-offset-2 hover:text-accent-signal inline-flex items-center gap-0.5"
          >
            <span>{segment.content}</span>
            {segment.url?.startsWith("http") && <ArrowUpRight className="w-3 h-3 inline" />}
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

// ─── Main Widget ──────────────────────────────────────────────────────────────

export function ChatWidget() {
  const pageLocale = useLocale();
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = React.useState("");
  const [sessionId, setSessionId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);
  const [showProactiveBubble, setShowProactiveBubble] = React.useState(false);
  const [attachment, setAttachment] = React.useState<AttachmentPreview | null>(null);
  const [attachmentError, setAttachmentError] = React.useState<string | null>(null);

  // Token budget state (shown in footer)
  const [tokenBudget, setTokenBudget] = React.useState<{
    dailyRemaining: number;
    sessionRemaining: number;
  } | null>(null);

  // Queue notification
  const [queueNotice, setQueueNotice] = React.useState<string | null>(null);

  const [selectedLanguage, setSelectedLanguage] = React.useState<ChatLanguage>(
    pageLocale === "ar" ? "darija" : pageLocale === "fr" ? "fr" : "en"
  );

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const speechRecognitionRef = React.useRef<any>(null);

  // ── Sync language when page locale changes ──────────────────────────────────
  React.useEffect(() => {
    const derived: ChatLanguage =
      pageLocale === "ar" ? "darija" : pageLocale === "fr" ? "fr" : "en";
    setSelectedLanguage(derived);
  }, [pageLocale]);

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
    const initialLang: ChatLanguage =
      pageLocale === "ar" ? "darija" : pageLocale === "fr" ? "fr" : "en";
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
  }, [pageLocale]);

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
                setActionNotice(`🎨 Jarvis: Theme set to ${act.payload.toUpperCase()}`);
                setTimeout(() => setActionNotice(null), 3500);
              }
              break;

            case "NAVIGATE":
              if (typeof act.payload === "string" && act.payload.startsWith("/")) {
                router.push(act.payload);
                setActionNotice(`📁 Jarvis: Navigated to ${act.payload}`);
                setTimeout(() => setActionNotice(null), 3500);
              }
              break;

            case "SET_LOCALE":
              if (act.payload === "ar" || act.payload === "fr" || act.payload === "en") {
                router.replace(pathname, { locale: act.payload });
                setSelectedLanguage(act.payload === "ar" ? "darija" : act.payload);
                setActionNotice(`🌐 Jarvis: Language switched to ${act.payload.toUpperCase()}`);
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

    // Type validation
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAttachmentError(
        selectedLanguage === "fr"
          ? "Format non supporté. Acceptés : JPG, PNG, WEBP, GIF, PDF."
          : selectedLanguage === "darija" || selectedLanguage === "ar"
          ? "الملف غير مدعوم. المقبول: JPG, PNG, WEBP, GIF, PDF."
          : "Unsupported format. Accepted: JPG, PNG, WEBP, GIF, PDF."
      );
      return;
    }

    // Size validation
    const isImage = file.type.startsWith("image/");
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_PDF_SIZE;
    if (file.size > maxSize) {
      const limit = isImage ? "5MB" : "10MB";
      setAttachmentError(
        selectedLanguage === "fr"
          ? `Fichier trop volumineux. Limite : ${limit}.`
          : selectedLanguage === "darija" || selectedLanguage === "ar"
          ? `الملف كبير بزاف. الحد الأقصى: ${limit}.`
          : `File too large. Maximum size: ${limit}.`
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
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
    setAttachment(null);
    setAttachmentError(null);
  }

  // ── Voice Recording ──────────────────────────────────────────────────────────
  function toggleVoiceRecording() {
    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setActionNotice("⚠️ Speech Recognition not supported in this browser.");
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
          : "en-US";

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
  async function sendMessage(textToSend?: string) {
    const rawText = textToSend !== undefined ? textToSend : inputMessage;
    const trimmed = rawText.trim();

    // Need either text or attachment
    if ((!trimmed && !attachment) || isLoading) return;

    // Build user message for display
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmed || `📎 ${attachment!.name}`,
      timestamp: new Date().toISOString(),
      attachmentPreview: attachment
        ? { name: attachment.name, type: attachment.type, previewUrl: attachment.previewUrl }
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setQueueNotice(null);

    const currentAttachment = attachment;
    clearAttachment();

    try {
      const body: Record<string, any> = {
        sessionId,
        message: trimmed,
        language: selectedLanguage,
        currentPage: window.location.pathname,
        theme: resolvedTheme === "light" ? "light" : "dark",
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
        const queueMsg =
          selectedLanguage === "darija"
            ? `⏳ كاين ${data.queuePosition} مستخدم قدامك — Jarvis غادي يجاوبك فـ دورتك`
            : selectedLanguage === "fr"
            ? `⏳ ${data.queuePosition} utilisateur(s) avant vous — Jarvis répond dès que possible`
            : `⏳ ${data.queuePosition} user(s) ahead — Jarvis will respond when it's your turn`;
        setQueueNotice(queueMsg);

        const queuedBotMsg: ChatMessage = {
          id: crypto.randomUUID(),
          sender: "assistant",
          text: data.reply,
          timestamp: new Date().toISOString(),
          queued: true,
        };
        setMessages((prev) => [...prev, queuedBotMsg]);
        setIsLoading(false);
        return;
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

      setMessages((prev) => [...prev, botMessage]);

      // Execute any Jarvis actions returned
      if (data.actions) {
        executeJarvisActions(data.actions);
      }

      // Show completion notification
      if (queueNotice) {
        setActionNotice(
          selectedLanguage === "darija"
            ? "✅ Jarvis جاوبك — اقرأ الجواب أسفل!"
            : selectedLanguage === "fr"
            ? "✅ Jarvis a répondu !"
            : "✅ Jarvis responded!"
        );
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch {
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
    ? Math.max(0, Math.min(100, Math.round((tokenBudget.sessionRemaining / 8000) * 100)))
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

      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Devyx AI Qualification Assistant"
          className="mb-3 w-[calc(100vw-1.5rem)] sm:w-[440px] h-[560px] sm:h-[630px] max-h-[88dvh] bg-bg-surface border border-border-grid shadow-2xl clip-chamfer flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 select-text"
        >
          {/* Blueprint Terminal Header */}
          <div className="px-4 py-3 bg-bg-elevated border-b border-border-grid flex flex-col gap-2 select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-status-operational animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-text-primary tracking-wider uppercase">
                      // DEVYX_JARVIS_COPILOT
                    </span>
                    <span className="font-mono text-[9px] text-accent-signal px-1 border border-accent-signal/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-accent-signal inline" />
                      GEMINI
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-text-muted block">
                    AUTONOMOUS_CLIENT_ENGINEER // ONLINE
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = resolvedTheme === "dark" ? "light" : "dark";
                    setTheme(next);
                    setActionNotice(`🎨 Theme switched to ${next.toUpperCase()}`);
                    setTimeout(() => setActionNotice(null), 2500);
                  }}
                  title="Toggle Platform Theme (Dark/Light)"
                  className="p-1.5 text-text-muted hover:text-accent-primary hover:bg-bg-surface transition-colors clip-chamfer"
                >
                  {resolvedTheme === "dark" ? <Sun className="w-3.5 h-3.5 text-accent-signal" /> : <Moon className="w-3.5 h-3.5 text-accent-primary" />}
                </button>
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
            <div className="flex items-center justify-between pt-1 border-t border-border-grid/60">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-text-muted me-1">LANG:</span>
                {(["darija", "ar", "fr", "en"] as ChatLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={`text-[10px] font-mono px-2 py-0.5 transition-colors clip-chamfer ${
                      selectedLanguage === lang
                        ? "bg-accent-primary text-bg-primary font-bold shadow-sm"
                        : "text-text-muted hover:text-text-primary bg-bg-surface border border-border-grid"
                    }`}
                  >
                    {lang === "darija" ? "🇲🇦 دارجة" : lang === "ar" ? "العربية" : lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Telegram Status Badge */}
              <div className="flex items-center gap-1 text-[9px] font-mono text-accent-signal">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-signal animate-ping" />
                <span>TG_DISPATCH: READY</span>
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
                  <span className="font-mono text-[9px] text-text-muted mb-1 px-1">
                    {isUser ? "// CLIENT_TRANSMIT" : "// DEVYX_JARVIS_ENGINE"}
                  </span>

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
                        {/* Image preview in user bubble */}
                        {msg.attachmentPreview?.previewUrl && (
                          <img
                            src={msg.attachmentPreview.previewUrl}
                            alt={msg.attachmentPreview.name}
                            className="max-w-[200px] max-h-[140px] object-cover rounded border border-bg-primary/30"
                          />
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
                            <span>QUEUED — waiting for Jarvis slot</span>
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
                  // JARVIS_EVALUATING_SYSTEM_SPECS
                </span>
                <div className="p-3 bg-bg-elevated border border-border-grid clip-chamfer flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-accent-primary animate-spin" />
                  <span className="font-mono text-xs text-text-muted">
                    {selectedLanguage === "darija"
                      ? "Jarvis kaychouf l'architecture m3a Gemini w n8n..."
                      : selectedLanguage === "ar"
                      ? "جاري تحليل المتطلبات وهندسة الإجابة عبر Gemini..."
                      : selectedLanguage === "fr"
                      ? "Jarvis évalue les spécifications architecturales..."
                      : "Jarvis analyzing technical specs via Gemini..."}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Jarvis Capabilities Bar */}
          <div className="px-3 py-2 bg-bg-surface border-t border-border-grid flex items-center justify-between gap-1 overflow-x-auto select-none no-scrollbar">
            <button
              type="button"
              onClick={() => sendMessage("🌙 switch dark mode")}
              className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-1 bg-bg-elevated border border-border-grid hover:border-accent-primary text-text-secondary hover:text-text-primary clip-chamfer flex-shrink-0"
            >
              <Moon className="w-2.5 h-2.5 text-accent-signal" />
              <span>Dark Mode</span>
            </button>
            <button
              type="button"
              onClick={() => sendMessage("📁 werili les projets")}
              className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-1 bg-bg-elevated border border-border-grid hover:border-accent-primary text-text-secondary hover:text-text-primary clip-chamfer flex-shrink-0"
            >
              <FolderKanban className="w-2.5 h-2.5 text-accent-primary" />
              <span>Projects</span>
            </button>
            <button
              type="button"
              onClick={() => sendMessage("💰 ch7al y9am projet web Next.js w automation n8n")}
              className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-1 bg-bg-elevated border border-border-grid hover:border-accent-primary text-text-secondary hover:text-text-primary clip-chamfer flex-shrink-0"
            >
              <Calculator className="w-2.5 h-2.5 text-accent-signal" />
              <span>Cost Estimate</span>
            </button>
            <button
              type="button"
              onClick={() => sendMessage("👨‍💻 Bghit nahder m3a un ingénieur humain")}
              className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-1 bg-bg-elevated border border-border-grid hover:border-accent-primary text-text-secondary hover:text-text-primary clip-chamfer flex-shrink-0"
            >
              <UserCheck className="w-2.5 h-2.5 text-status-operational" />
              <span>Human Specialist</span>
            </button>
          </div>

          {/* Attachment Preview Strip */}
          {attachment && (
            <div className="px-3 py-2 bg-bg-elevated border-t border-border-grid flex items-center gap-2 select-none">
              {attachment.previewUrl ? (
                <img
                  src={attachment.previewUrl}
                  alt={attachment.name}
                  className="w-10 h-10 object-cover border border-border-grid flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-bg-surface border border-border-grid flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-accent-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] text-text-primary truncate">{attachment.name}</p>
                <p className="font-mono text-[9px] text-text-muted">
                  {(attachment.size / 1024).toFixed(0)} KB · {attachment.type.split("/")[1].toUpperCase()}
                </p>
              </div>
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
                title="Attach image or PDF"
                className={`w-10 h-10 clip-chamfer flex items-center justify-center transition-colors flex-shrink-0 ${
                  attachment
                    ? "bg-accent-primary text-bg-primary"
                    : "bg-bg-surface border border-border-grid text-text-secondary hover:text-accent-primary hover:border-accent-primary"
                } disabled:opacity-50`}
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isListening
                    ? "Listening... Speak in Darija / Multi..."
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
                    : "border-border-grid"
                }`}
              />

              {/* Voice Note Microphone Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                title={isListening ? "Stop listening" : "Speak voice note"}
                className={`w-10 h-10 clip-chamfer flex items-center justify-center transition-colors flex-shrink-0 ${
                  isListening
                    ? "bg-status-error text-white animate-pulse"
                    : "bg-bg-surface border border-border-grid text-text-secondary hover:text-accent-primary hover:border-accent-primary"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={(!inputMessage.trim() && !attachment) || isLoading}
                aria-label="Send message"
                className="w-10 h-10 bg-accent-primary text-bg-primary clip-chamfer flex items-center justify-center hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-transform disabled:opacity-50 disabled:pointer-events-none flex-shrink-0"
              >
                <Send className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>

            {/* Footer: budget bar + char counter */}
            <div className="flex items-center justify-between text-[9px] font-mono text-text-muted px-1 gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Shield className="w-2.5 h-2.5 text-accent-signal flex-shrink-0" />
                {budgetPct !== null ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="truncate">TOKEN_BUDGET</span>
                    <div className="flex-1 h-1 bg-bg-surface border border-border-grid/50 min-w-[40px]">
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
                    <span className="flex-shrink-0">{budgetPct}%</span>
                  </div>
                ) : (
                  <span className="truncate">JARVIS CONTROLS // TELEGRAM SYNC</span>
                )}
              </div>
              <span className="flex-shrink-0">{inputMessage.length}/1500</span>
            </div>
          </form>
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
        <span className="w-2.5 h-2.5 bg-status-operational rounded-full animate-pulse flex-shrink-0" />
        <div className="flex flex-col text-start leading-tight">
          <span className="font-mono text-[9px] sm:text-[10px] text-accent-signal uppercase tracking-wider font-bold flex items-center gap-1">
            DEVYX // JARVIS COPILOT
            <span className="hidden sm:inline text-[8px] bg-accent-signal/10 px-1 border border-accent-signal/30 text-accent-signal">
              🇲🇦 DARIJA
            </span>
          </span>
          <span className="font-sans text-[11px] sm:text-xs text-text-secondary group-hover:text-text-primary transition-colors">
            {pageLocale === "ar"
              ? "استشر الذكاء الاصطناعي (بالدارجة والتحكم)"
              : pageLocale === "fr"
              ? "Devyx Jarvis (Contrôle & Devis)"
              : "Devyx Jarvis (Control & Estimator)"}
          </span>
        </div>
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-bg-elevated border border-border-grid flex items-center justify-center text-accent-primary group-hover:bg-accent-primary group-hover:text-bg-primary transition-colors flex-shrink-0 clip-chamfer">
          {isOpen ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </div>
      </button>
    </div>
  );
}
