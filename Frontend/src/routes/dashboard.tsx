import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, MessageSquare, ShieldCheck, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ChatPanel, type TabMode } from "@/components/chat-panel";
import { SchemeLookup } from "@/components/scheme-lookup";
import { cn } from "@/lib/utils";

const CORPUS_DOCS = [
  { label: "Doc 1", title: "Fee Revision Notice (Oct 2025)" },
  { label: "Doc 2", title: "MITC — Current Account" },
  { label: "Doc 3", title: "RBI KYC FAQs" },
  { label: "Doc 4", title: "RBI Master Direction AML/KYC" },
];

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "BankIQ — Axis Bank CA Co-Pilot" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<TabMode>("ca");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="size-6 animate-spin text-[#97144D]" />
      </div>
    );
  }

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="h-screen flex bg-background">
      <aside className="w-[280px] shrink-0 bg-[#5B0E2D] text-white flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <h1 className="text-2xl font-bold tracking-tight">BankIQ</h1>
          <p className="text-xs text-pink-100/80 mt-0.5">Axis Bank CA Expert</p>
        </div>

        <div className="p-3 space-y-1">
          <TabButton
            active={tab === "ca"}
            onClick={() => setTab("ca")}
            icon={<MessageSquare className="size-4" />}
            label="Chat"
            sub="CA Charges & Schemes"
          />
          <TabButton
            active={tab === "kyc"}
            onClick={() => setTab("kyc")}
            icon={<ShieldCheck className="size-4" />}
            label="KYC / Compliance"
            sub="RBI Directions"
          />
        </div>

        <div className="px-3 pb-3">
          <div className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-pink-100 uppercase tracking-wide">
              <FileText className="size-3.5" /> Knowledge Base
            </div>
            <ul className="mt-2 space-y-1.5">
              {CORPUS_DOCS.map((d) => (
                <li key={d.label} className="text-xs leading-snug">
                  <span className="text-pink-200/70">{d.label}: </span>
                  <span className="text-white/90">{d.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-1" />

        <div className="border-t border-white/10 p-3 flex items-center gap-2">
          <div className="size-8 rounded-full bg-white/10 grid place-items-center text-xs font-semibold">
            {user.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate text-white">{user.email}</div>
            <div className="text-[10px] text-pink-100/60">Signed in</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Sign out"
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <ChatPanel key={tab} tabMode={tab} />
      </main>

      <aside className="w-[260px] shrink-0 bg-card border-l border-border flex flex-col">
        <SchemeLookup />
      </aside>
    </div>
  );
}

function TabButton({
  active, onClick, icon, label, sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg px-3 py-2.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        active
          ? "bg-[#97144D] text-white shadow-sm"
          : "text-pink-100/90 hover:bg-white/5",
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon} {label}
      </div>
      <div className={cn("text-[11px] mt-0.5 ml-6", active ? "text-pink-100/90" : "text-pink-100/60")}>
        {sub}
      </div>
    </button>
  );
}
