"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  RotateCcw,
  RefreshCw,
  ArrowUpRight,
  Shield,
  Terminal,
  ChevronDown,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  failed?: boolean;
}

const STORAGE_KEY = "devyx_ai_chat_session_v1";

const STARTER_PROMPTS: Record<string, string[]> = {
  ar: [
    "⚡ استفسار عن منصات الويب المتقدمة",
    "📱 بنية وتطوير تطبيقات الهواتف",
    "⚙️ أتمتة مسارات العمل عبر n8n",
    "📅 حجز استشارة هندسية متخصصة",
  ],
  fr: [
    "⚡ Architecture Plateforme Web",
    "📱 Application Mobile Multiplateforme",
    "⚙️ Automatisation de Workflows n8n",
    "📅 Planifier une Consultation Technique",
  ],
  en: [
    "⚡ Web Platform Architecture",
    "📱 Cross-Platform Mobile App",
    "⚙️ Autonomous n8n Automation",
    "📅 Schedule Technical Consultation",
  ],
};

const WELCOME_MESSAGES: Record<string, string> = {
  ar: "أهلاً بك في نظام التأهيل الذكي لشركة **ديفيكس**. أنا مهندس استشاري مؤتمت مصمم لتحليل متطلبات مشروعك، ومطابقتها مع بنيتنا التحتية (ويب، تطبيقات، وأتمتة n8n).\n\nكيف يمكننا مساعدة مؤسستك اليوم؟",
  fr: "Bienvenue dans le système de qualification **Devyx**. Je suis un ingénieur-conseil automatisé conçu pour évaluer vos spécifications techniques (plateformes web, mobile, et pipelines n8n).\n\nQuel système architectural souhaitez-vous concevoir aujourd'hui ?",
  en: "Welcome to the **Devyx Technical Qualification Terminal**. I am an automated engineering consultant designed to assess your system specifications across web architectures, mobile apps, and self-hosted n8n pipelines.\n\nWhat system requirements are you planning to engineer?",
};

/**
 * Safe, zero-dependency Markdown renderer for chat messages.
 * Supports bold, inline code, bullet lists, numbered lists, and external links safely.
 */
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");

  const parseInline = (lineText: string): React.ReactNode[] => {
    // Regular expression matching bold, inline code, and markdown links
    const tokens: React.ReactNode[] = [];
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;
    let lastIndex = 0;
    let match;

    // First replace links
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

    // Process bold and code within text segments
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
        // Parse bold **text** and `code`
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

export function ChatWidget() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = React.useState("");
  const [sessionId, setSessionId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Restore or initialize session from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.sessionId) {
          setSessionId(parsed.sessionId);
          if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            setMessages(parsed.messages);
            return;
          }
        }
      }
    } catch {
      // LocalStorage access fallback
    }

    // Initialize fresh session with localized greeting
    const newSessionId = crypto.randomUUID();
    const initialMessage: ChatMessage = {
      id: "initial-welcome",
      sender: "assistant",
      text: WELCOME_MESSAGES[locale] || WELCOME_MESSAGES.en,
      timestamp: new Date().toISOString(),
    };
    setSessionId(newSessionId);
    setMessages([initialMessage]);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sessionId: newSessionId, messages: [initialMessage] })
      );
    } catch {
      // Non-blocking storage
    }
  }, [locale]);

  // Persist messages when updated
  React.useEffect(() => {
    if (sessionId && messages.length > 0) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ sessionId, messages })
        );
      } catch {
        // Storage quota protection
      }
    }
  }, [messages, sessionId]);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Global event listener for opening chat from CTA buttons across the app
  React.useEffect(() => {
    function handleOpenChat(e: Event) {
      setIsOpen(true);
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

  async function sendMessage(textToSend?: string) {
    const rawText = textToSend !== undefined ? textToSend : inputMessage;
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: trimmed,
          language: locale,
          currentPage: window.location.pathname,
        }),
      });

      const data = await response.json();

      if (!response.ok && !data.reply) {
        throw new Error(data.error || "Communication failure");
      }

      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text: data.reply || "Transmission received by engineering pipeline.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      // Mark as failed to allow user retry
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text:
          locale === "ar"
            ? "تعذر إرسال الرسالة إلى مسار التأهيل الآلي. يُرجى التحقق من اتصالك والمحاولة مجدداً."
            : locale === "fr"
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
      text: WELCOME_MESSAGES[locale] || WELCOME_MESSAGES.en,
      timestamp: new Date().toISOString(),
    };
    setSessionId(newSessionId);
    setMessages([initialMessage]);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sessionId: newSessionId, messages: [initialMessage] })
      );
    } catch {
      // Ignore
    }
  }

  const starters = STARTER_PROMPTS[locale] || STARTER_PROMPTS.en;

  return (
    <div className="fixed bottom-3 end-3 sm:bottom-6 sm:end-6 z-50 flex flex-col items-end max-w-[calc(100vw-1.5rem)]">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Devyx AI Qualification Assistant"
          className="mb-3 w-[calc(100vw-1.5rem)] sm:w-[420px] h-[520px] sm:h-[580px] max-h-[84dvh] bg-bg-surface border border-border-grid shadow-2xl clip-chamfer flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 select-text"
        >
          {/* Blueprint Terminal Header */}
          <div className="px-4 py-3 bg-bg-elevated border-b border-border-grid flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-status-operational animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-text-primary tracking-wider uppercase">
                    // DEVYX_AI_AGENT
                  </span>
                  <span className="font-mono text-[9px] text-accent-signal px-1 border border-accent-signal/30">
                    v2.4
                  </span>
                </div>
                <span className="font-mono text-[9px] text-text-muted block">
                  QUALIFICATION_ENGINEER // ONLINE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset conversation memory"
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize chat window"
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
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
                    {isUser ? "// CLIENT_TRANSMIT" : "// DEVYX_QUALIFICATION_ENGINE"}
                  </span>

                  <div
                    className={`max-w-[88%] p-3.5 clip-chamfer text-xs ${
                      isUser
                        ? "bg-accent-primary text-bg-primary font-medium"
                        : "bg-bg-elevated border border-border-grid text-text-primary"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed font-sans">
                        {msg.text}
                      </p>
                    ) : (
                      <RenderMarkdown text={msg.text} />
                    )}

                    {msg.failed && (
                      <div className="mt-3 pt-2 border-t border-border-grid flex items-center justify-between">
                        <span className="text-[10px] text-status-error font-mono">
                          STATUS_500_FAILED
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const lastUser = [...messages]
                              .reverse()
                              .find((m) => m.sender === "user");
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
                  // AGENT_ANALYZING_SYSTEM_SPECS
                </span>
                <div className="p-3 bg-bg-elevated border border-border-grid clip-chamfer flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-accent-primary animate-spin" />
                  <span className="font-mono text-xs text-text-muted">
                    Evaluating architecture requirements...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips (Shown when few messages exist) */}
          {messages.length <= 2 && !isLoading && (
            <div className="p-3 bg-bg-surface border-t border-border-grid flex flex-wrap gap-1.5 select-none">
              {starters.map((starter, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => sendMessage(starter)}
                  className="font-mono text-[10px] px-2.5 py-1 bg-bg-elevated border border-border-grid text-text-secondary hover:text-text-primary hover:border-accent-primary transition-colors text-start clip-chamfer"
                >
                  {starter}
                </button>
              ))}
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
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  locale === "ar"
                    ? "اكتب تفاصيل النظام المطلوب (بحد أقصى 1500 حرف)..."
                    : locale === "fr"
                    ? "Décrivez votre projet (max 1 500 caractères)..."
                    : "Describe system requirements (max 1,500 chars)..."
                }
                maxLength={1500}
                disabled={isLoading}
                className="flex-1 h-10 px-3 bg-bg-surface border border-border-grid text-text-primary font-mono text-base sm:text-xs focus:border-accent-primary focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send message"
                className="w-10 h-10 bg-accent-primary text-bg-primary clip-chamfer flex items-center justify-center hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-transform disabled:opacity-50 disabled:pointer-events-none flex-shrink-0"
              >
                <Send className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-text-muted px-1">
              <div className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-accent-signal flex-shrink-0" />
                <span className="truncate">CONFIDENTIAL // 0 LLM TRAINING</span>
              </div>
              <span className="flex-shrink-0">{inputMessage.length}/1500</span>
            </div>
          </form>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Devyx AI Engineering Assistant"
        className="min-h-[44px] sm:h-13 px-3 sm:px-4 py-2 bg-bg-surface border border-border-grid text-text-primary clip-chamfer shadow-xl hover:border-accent-primary transition-all flex items-center gap-2 sm:gap-3 group relative select-none hover:-translate-y-0.5 active:scale-95"
      >
        <span className="w-2.5 h-2.5 bg-status-operational rounded-full animate-pulse flex-shrink-0" />
        <div className="flex flex-col text-start leading-tight">
          <span className="font-mono text-[9px] sm:text-[10px] text-accent-signal uppercase tracking-wider font-bold">
            DEVYX // AI ENGINEER
          </span>
          <span className="font-sans text-[11px] sm:text-xs text-text-secondary group-hover:text-text-primary transition-colors">
            {locale === "ar"
              ? "استشر الذكاء الاصطناعي"
              : locale === "fr"
              ? "Consulter l'IA"
              : "Technical Consultation"}
          </span>
        </div>
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-bg-elevated border border-border-grid flex items-center justify-center text-accent-primary group-hover:bg-accent-primary group-hover:text-bg-primary transition-colors flex-shrink-0">
          {isOpen ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </div>
      </button>
    </div>
  );
}
