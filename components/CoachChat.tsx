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
}

const STARTER_PROMPTS = [
  "How do I define my beard neckline?",
  "What's a simple morning routine for me?",
  "Which SPF should I use?",
];

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
    <div className="max-w-3xl mx-auto flex flex-col h-full">
      <div className="mb-4 flex-shrink-0">
        <h1 className="font-manrope font-bold text-2xl text-cream-ivory">AI Coach</h1>
        <p className="text-sm text-cream-ivory/60 mt-1">
          Personalized grooming and self-care guidance, grounded in your analysis
          and plan.
        </p>
      </div>

      <div className="flex flex-col h-[70dvh] sm:h-[75dvh] rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-3">
          {messages.length === 0 ? (
            <EmptyState onPick={sendMessage} />
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                reduceMotion={reduceMotion}
                onRetry={() => retry(m)}
              />
            ))
          )}

          {sending && <TypingBubble reduceMotion={reduceMotion} />}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-white/10 bg-pure-black/40 px-3 py-3 sm:px-4 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach anything…"
            disabled={sending}
            aria-label="Message"
            className="flex-1 h-11 rounded-xl border border-white/10 bg-pure-black/40 px-4 text-base text-cream-ivory placeholder:text-cream-ivory/40 focus:outline-none focus:border-lumen-gold/50 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="Send"
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-lumen-gold text-pure-black disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4 py-10">
      <div className="w-12 h-12 rounded-2xl bg-lumen-gold/10 flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6 text-lumen-gold" />
      </div>
      <p className="font-manrope font-semibold text-cream-ivory mb-1">
        Ask your coach anything
      </p>
      <p className="text-sm text-cream-ivory/60 mb-6 max-w-sm">
        Grounded in your analysis, plan, and streak — ask about skincare, hair,
        grooming, or style.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="text-xs font-medium text-cream-ivory/80 bg-white/5 border border-white/10 rounded-full px-3 py-2 hover:border-lumen-gold/40 hover:text-cream-ivory transition-colors"
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
}: {
  message: LocalMessage;
  reduceMotion: boolean;
  onRetry: () => void;
}) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex flex-col ${
          isUser ? "items-end" : "items-start"
        } max-w-[85%] sm:max-w-[75%]`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-lumen-gold text-pure-black rounded-br-md"
              : "bg-white/5 border border-white/10 text-cream-ivory rounded-bl-md"
          }`}
        >
          {message.content}
        </div>
        {message.status === "error" && (
          <div className="mt-1 flex flex-col items-end gap-0.5">
            <p className="text-[11px] text-warm-coral">
              {message.errorMessage || "Couldn't send that message."}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1 text-[11px] font-medium text-warm-coral hover:text-warm-coral/80"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingBubble({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3">
        <span className="text-xs text-cream-ivory/50">Coach is thinking</span>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cream-ivory/50"
              animate={
                reduceMotion
                  ? { opacity: [0.4, 1, 0.4] }
                  : { opacity: [0.3, 1, 0.3], y: [0, -3, 0] }
              }
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
