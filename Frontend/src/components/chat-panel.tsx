import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Loader2, Plus, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { sendChat } from "@/lib/dify.functions";
import { ChargeChangeSummary } from "@/components/charge-change-summary";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type TabMode = "ca" | "kyc";

type Citation = { filename: string; page: number | null; snippet: string };
type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

const SAMPLE_QUESTIONS_CA = [
  "What is the revised non-maintenance charge for Business Classic CA from Oct 2025?",
  "What is the scheme code for Axis Bank New Economy Group (startup) CA?",
  "What is the MAB for ordinary Axis Bank CA in metro areas?",
  "What are the non-home-branch cash withdrawal limits for Channel One CA?",
];
const SAMPLE_QUESTIONS_KYC = [
  "Is Aadhaar mandatory for opening a current account?",
  "What happens to a current account that has no transactions for 2 years?",
];

const NOT_FOUND_MARKER = "not in the uploaded Axis Bank documents";
const MAX_CHARS = 400;

export function ChatPanel({ tabMode }: { tabMode: TabMode }) {
  const chat = useServerFn(sendChat);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [citation, setCitation] = useState<Citation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setConversationId("");
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", u.user.id)
        .eq("tab_mode", tabMode)
        .order("created_at", { ascending: true });
      if (data) {
        setMessages(
          data.map((d) => ({
            id: d.id,
            role: d.role as "user" | "assistant",
            content: d.content,
            citations: (d.citations_json as Citation[] | null) ?? undefined,
          })),
        );
        const lastConv = [...data].reverse().find((d) => d.dify_conversation_id);
        if (lastConv) setConversationId(lastConv.dify_conversation_id as string);
      }
    })();
  }, [tabMode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  const newChat = () => {
    setMessages([]);
    setConversationId("");
  };

  const submit = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || busy) return;
    if (q.length > MAX_CHARS) return;

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: q };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBusy(true);

    const { data: u } = await supabase.auth.getUser();
    const userId = u.user?.id;
    if (userId) {
      await supabase.from("chat_history").insert({
        user_id: userId,
        tab_mode: tabMode,
        role: "user",
        content: q,
      });
    }

    try {
      const res = await chat({
        data: { query: q, conversationId, tabMode },
      });
      setConversationId(res.conversationId);
      const answer = res.answer?.trim() || "I could not find this in the uploaded Axis Bank documents.";
      const aMsg: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        citations: res.citations,
      };
      setMessages((m) => [...m, aMsg]);
      if (userId) {
        await supabase.from("chat_history").insert({
          user_id: userId,
          tab_mode: tabMode,
          role: "assistant",
          content: answer,
          citations_json: res.citations,
          dify_conversation_id: res.conversationId,
        });
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("RATE_LIMIT")) {
        toast.error("Rate limit reached. Please wait 15 seconds and retry.");
      } else {
        toast.error("Connection error. Please retry.");
      }
      setMessages((m) => m.slice(0, -1));
      setInput(q);
    } finally {
      setBusy(false);
    }
  };

  const overLimit = input.length > MAX_CHARS;
  const samples = tabMode === "ca" ? SAMPLE_QUESTIONS_CA : SAMPLE_QUESTIONS_KYC;
  const allSamples = [...SAMPLE_QUESTIONS_CA, ...SAMPLE_QUESTIONS_KYC];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border bg-card px-6 h-14 shrink-0">
        <div>
          <h2 className="font-semibold text-[#1A1A2E]">
            {tabMode === "ca" ? "Current Account Charges & Schemes" : "KYC / Compliance"}
          </h2>
          <p className="text-xs text-muted-foreground">Grounded in Axis Bank source documents</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={newChat}
          className="border-[#97144D]/30 text-[#97144D] hover:bg-[#FDF2F6] hover:text-[#5B0E2D]"
        >
          <Plus className="size-4" /> New Chat
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto bg-[#FDF2F6]/40">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
          {messages.length === 0 && !busy && (
            <SampleQuestions samples={tabMode === "ca" ? allSamples.slice(0, 6) : allSamples} onPick={submit} />
          )}
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const showCard =
              m.role === "assistant" &&
              (/revised/i.test(m.content) ||
                (prev?.role === "user" && /non[- ]?maintenance/i.test(prev.content)));
            return (
              <div key={m.id} className="space-y-3">
                <MessageBubble msg={m} onCite={setCitation} />
                {showCard && <ChargeChangeSummary />}
              </div>
            );
          })}
          {busy && <LoadingBubble />}
        </div>
      </div>

      <div className="border-t border-border bg-card p-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-xl border border-border bg-white focus-within:ring-2 focus-within:ring-[#97144D] focus-within:border-[#97144D] transition">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              placeholder={
                tabMode === "ca"
                  ? "Ask about Axis Bank current account fees, schemes, MAB…"
                  : "Ask about KYC, AML, RBI master directions…"
              }
              className="min-h-[60px] max-h-40 resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent pr-14"
            />
            <Button
              onClick={() => submit(input)}
              disabled={!input.trim() || busy || overLimit}
              size="icon"
              className="absolute right-2 bottom-2 size-9 bg-[#97144D] hover:bg-[#5B0E2D] text-white"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
          <div className="flex justify-between mt-2 text-xs px-1">
            <span className="text-muted-foreground">Press Enter to send · Shift+Enter for newline</span>
            <span className={cn(overLimit ? "text-destructive font-semibold" : "text-muted-foreground")}>
              {input.length} / {MAX_CHARS}
            </span>
          </div>
        </div>
      </div>

      <CitationModal citation={citation} onClose={() => setCitation(null)} />
    </div>
  );
}

function SampleQuestions({
  samples,
  onPick,
}: {
  samples: string[];
  onPick: (q: string) => void;
}) {
  return (
    <div className="py-8">
      <h3 className="text-sm font-semibold text-[#5B0E2D] mb-3">Try a sample question</h3>
      <div className="flex flex-wrap gap-2">
        {samples.map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            className="text-left text-sm rounded-full border border-[#97144D]/25 bg-white px-4 py-2 text-[#1A1A2E] hover:bg-[#FDF2F6] hover:border-[#97144D] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#97144D]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  onCite,
}: {
  msg: Msg;
  onCite: (c: Citation) => void;
}) {
  const isUser = msg.role === "user";
  const isNotFound = !isUser && msg.content.includes(NOT_FOUND_MARKER);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#97144D] text-white px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-sm">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        <div className="rounded-2xl rounded-tl-sm bg-white border border-border shadow-sm px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed text-[#1A1A2E]">
          {isNotFound && (
            <Info className="inline-block size-4 text-[#C41E5E] mr-1.5 -mt-0.5" />
          )}
          {msg.content}
        </div>
        {msg.citations && msg.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {msg.citations.map((c, i) => (
              <button
                key={i}
                onClick={() => onCite(c)}
                className="bg-pink-100 text-[#5B0E2D] text-xs rounded-full px-3 py-1 hover:bg-pink-200 transition inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#97144D]"
              >
                <FileText className="size-3" />
                {c.filename}{c.page ? `, p.${c.page}` : ""}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] w-full">
        <div className="rounded-2xl rounded-tl-sm bg-[#FDF2F6] border border-pink-100 px-4 py-3 space-y-2">
          <div className="h-3 rounded bg-pink-200/60 animate-pulse w-3/4" />
          <div className="h-3 rounded bg-pink-200/60 animate-pulse w-1/2" />
          <div className="h-3 rounded bg-pink-200/60 animate-pulse w-2/3" />
        </div>
      </div>
    </div>
  );
}

function CitationModal({
  citation,
  onClose,
}: {
  citation: Citation | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!citation} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#5B0E2D] text-lg">
            {citation?.filename}
            {citation?.page ? (
              <span className="text-muted-foreground font-normal text-sm ml-2">
                · Page {citation.page}
              </span>
            ) : null}
          </DialogTitle>
        </DialogHeader>
        <blockquote className="bg-pink-50 border-l-4 border-[#C41E5E] rounded-md p-4 font-mono text-xs text-[#1A1A2E] whitespace-pre-wrap max-h-[50vh] overflow-auto">
          {citation?.snippet || "No source text available."}
        </blockquote>
        <DialogFooter>
          <Button onClick={onClose} className="bg-[#97144D] hover:bg-[#5B0E2D] text-white">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
