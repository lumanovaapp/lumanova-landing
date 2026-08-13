"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Send, Sparkles, RotateCcw } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { apiErrorFromText, fetchWithTimeout, toFriendlyMessage } from "@/lib/api-error";

interface CoachChatProps {
  initialMessages: ChatMessage[];
}

interface LocalMessage extends ChatMessage {
  status?: "sending" | "error";
  errorMessage?: string;
  // Only set on an assistant reply that just arrived this session — gates
  // the typewriter effect so page-load history never re-types itself.
  justArrived?: boolean;
}

const STARTER_PROMPTS = [
  "How do I define my beard neckline?",
  "What's a simple morning routine for me?",
  "Which SPF should I use?",
];

const GROUNDED_IN = ["Your analysis", "Your 90-day plan", "Your streak"];

const EASE = [0.16, 1, 0.3, 1] as const;

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function CoachChat({ initialMessages }: CoachChatProps) {
  const reduceMotion = !!useReducedMotion();
  const [messages, setMessages] = useState<LocalMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [messages, sending, reduceMotion]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMessage: LocalMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await fetchWithTimeout("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw await apiErrorFromText(response, "Something went wrong. Try again.");
      }

      const replyText = await response.text();

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: replyText,
          created_at: new Date().toISOString(),
          justArrived: true,
        },
      ]);
    } catch (err) {
      const errorMessage = toFriendlyMessage(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMessage.id ? { ...m, status: "error", errorMessage } : m
        )
      );
    } finally {
      setSending(false);
    }
  }

  function retry(message: LocalMessage) {
    setMessages((prev) => prev.filter((m) => m.id !== message.id));
    sendMessage(message.content);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col">
      {/* Editorial header — left-aligned, matches the rest of the dashboard */}
      <div className="mb-6 md:mb-8 flex-shrink-0">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-3">
          AI Coach
        </p>
        <h1 className="font-manrope text-3xl sm:text-4xl leading-[1.1] tracking-[-0.02em]">
          <span className="font-light text-cream-ivory/80">Your on-demand</span>{" "}
          <span className="font-extrabold text-lumen-gold">grooming coach.</span>
        </h1>
        <p className="text-sm sm:text-base text-cream-ivory/55 mt-3 max-w-xl leading-relaxed">
          Personalized grooming and self-care guidance, grounded in your analysis
          and plan.
        </p>
      </div>

      {/* Wide two-column composition: chat takes the primary width, a slim
          context panel sits alongside on desktop instead of leaving dead
          margins around a narrow centered box. */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start">
        <div className="flex flex-col h-[70dvh] sm:h-[75dvh] rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5 space-y-5">
            {messages.length === 0 ? (
              <EmptyState onPick={sendMessage} />
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  reduceMotion={reduceMotion}
                  onRetry={() => retry(m)}
                  bottomRef={bottomRef}
                />
              ))
            )}

            {sending && <TypingIndicator />}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 border-t border-white/[0.08] bg-white/[0.02] px-4 py-4 sm:px-6 [padding-bottom:max(1rem,env(safe-area-inset-bottom))]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach anything…"
              disabled={sending}
              aria-label="Message"
              className="flex-1 h-12 rounded-2xl border border-white/[0.18] bg-white/[0.07] px-5 text-sm text-cream-ivory placeholder:text-cream-ivory/40 focus:outline-none focus:border-lumen-gold/50 focus:bg-white/[0.10] transition-all duration-300 focus-gold disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send"
              className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-lumen-gold text-pure-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] active:scale-95 transition-all duration-300 focus-gold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Context sidebar — grounds the chat in the rest of the app and
            offers quick prompts without inventing new functionality. */}
        <aside className="hidden lg:flex flex-col gap-4">
          <div className="rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] p-5">
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/60 mb-4">
              Grounded in
            </p>
            <div className="flex flex-col gap-2">
              {GROUNDED_IN.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-xs font-medium text-cream-ivory/70 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-lumen-gold/70 flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] p-5">
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/60 mb-4">
              Try asking
            </p>
            <div className="flex flex-col gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="text-left text-xs font-medium text-cream-ivory/70 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-3.5 py-2.5 leading-relaxed hover:border-lumen-gold/40 hover:text-cream-ivory hover:bg-white/[0.06] transition-all duration-300 focus-gold"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4 py-10">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lumen-gold to-charcoal flex items-center justify-center mb-5">
        <Sparkles className="w-6 h-6 text-pure-black" />
      </div>
      <p className="font-manrope font-semibold text-lg text-cream-ivory mb-1.5">
        Ask your coach anything
      </p>
      <p className="text-sm text-cream-ivory/55 mb-6 max-w-sm leading-relaxed">
        Grounded in your analysis, plan, and streak — ask about skincare, hair,
        grooming, or style.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="text-xs font-medium text-cream-ivory/80 bg-white/[0.05] border border-white/[0.08] rounded-full px-3.5 py-2 hover:border-lumen-gold/40 hover:text-cream-ivory hover:-translate-y-0.5 transition-all duration-300 focus-gold"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  reduceMotion,
  onRetry,
  bottomRef,
}: {
  message: LocalMessage;
  reduceMotion: boolean;
  onRetry: () => void;
  bottomRef: React.RefObject<HTMLDivElement>;
}) {
  const isUser = message.role === "user";
  const shouldType = !isUser && message.justArrived && !reduceMotion;

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.2, ease: EASE }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {isUser ? (
        <div className="max-w-[85%] sm:max-w-[75%]">
          <p className="text-[11px] font-semibold tracking-wide text-cream-ivory/35 mb-1 text-right">
            You
          </p>
          <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-cream-ivory/90">
            {message.content}
          </div>
          {message.status === "error" && (
            <div className="mt-1.5 flex flex-col items-end gap-0.5">
              <p className="text-[11px] text-warm-coral">
                {message.errorMessage || "Couldn't send that message."}
              </p>
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1 text-[11px] font-medium text-warm-coral hover:text-warm-coral/80 focus-gold"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-lumen-gold to-charcoal flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-pure-black" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-lumen-gold/70 mb-1">
              Coach
            </p>
            <div className="border-l-2 border-lumen-gold/30 pl-3.5 text-sm leading-relaxed whitespace-pre-wrap text-cream-ivory/90">
              {shouldType ? (
                <TypingText text={message.content} bottomRef={bottomRef} />
              ) : (
                message.content
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="flex items-start gap-3"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-lumen-gold to-charcoal flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-pure-black" />
      </div>
      <div className="border-l-2 border-lumen-gold/30 pl-3.5 flex items-center gap-2 py-1">
        <span className="text-xs text-cream-ivory/45">Coach is typing</span>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-lumen-gold/60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Reveals `text` progressively at a natural pace instead of popping in all
// at once — total duration is bounded so short replies don't crawl and long
// ones don't take forever. Scrolls the transcript along as it grows.
const MIN_TYPE_DURATION_MS = 400;
const MAX_TYPE_DURATION_MS = 2200;
const TYPE_TICK_MS = 24;

function TypingText({
  text,
  bottomRef,
}: {
  text: string;
  bottomRef: React.RefObject<HTMLDivElement>;
}) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (text.length === 0) {
      setRevealed(0);
      return;
    }

    const totalDurationMs = Math.min(
      MAX_TYPE_DURATION_MS,
      Math.max(MIN_TYPE_DURATION_MS, text.length * 14)
    );
    const totalTicks = Math.max(1, Math.round(totalDurationMs / TYPE_TICK_MS));
    const charsPerTick = Math.max(1, Math.ceil(text.length / totalTicks));

    setRevealed(0);
    const id = setInterval(() => {
      setRevealed((prev) => {
        const next = Math.min(text.length, prev + charsPerTick);
        if (next >= text.length) clearInterval(id);
        return next;
      });
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, TYPE_TICK_MS);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bottomRef identity is stable
  }, [text]);

  const done = revealed >= text.length;

  return (
    <>
      {text.slice(0, revealed)}
      {!done && (
        <motion.span
          aria-hidden="true"
          className="inline-block w-[2px] h-[1em] -mb-[2px] ml-0.5 bg-lumen-gold/80 align-middle"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      )}
    </>
  );
}
