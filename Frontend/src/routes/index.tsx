import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, MessageSquare, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BankIQ — Axis Bank Current Account Co-Pilot" },
      { name: "description", content: "AI co-pilot grounded in Axis Bank current account fees, schemes, and RBI KYC directions." },
      { property: "og:title", content: "BankIQ — Axis Bank Current Account Co-Pilot" },
      { property: "og:description", content: "Cited answers from Axis Bank's official current account documents." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF2F6] via-white to-[#FDF2F6]">
      <header className="border-b border-pink-100/60 backdrop-blur-sm sticky top-0 bg-white/70 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-[#97144D] text-white grid place-items-center">
              <ShieldCheck className="size-4" />
            </div>
            <span className="font-bold tracking-tight text-[#5B0E2D]">BankIQ</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild className="text-[#5B0E2D] hover:bg-pink-100">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-[#97144D] hover:bg-[#5B0E2D] text-white">
              <Link to="/login">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-3 py-1 text-xs text-[#5B0E2D]">
            <Sparkles className="size-3 text-[#C41E5E]" />
            Axis Bank Current Account Co-Pilot
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-[#1A1A2E]">
            Cited answers from
            <span className="block text-[#97144D]">Axis Bank's own documents.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            BankIQ answers questions on fees, schemes, MAB, and RBI KYC — every
            response cites the source document and page number.
          </p>
          <div className="mt-8 flex gap-3">
            <Button size="lg" asChild className="bg-[#97144D] hover:bg-[#5B0E2D] text-white">
              <Link to="/login">Open BankIQ</Link>
            </Button>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-6">
          {[
            { icon: FileText, title: "Grounded in 4 sources", body: "Fee notices, MITC, RBI FAQs and Master Direction on AML/KYC." },
            { icon: MessageSquare, title: "Two expert modes", body: "Switch between CA Charges and KYC/Compliance — each with a dedicated chatflow." },
            { icon: Sparkles, title: "Inline citations", body: "Every answer pill opens the original source chunk and page." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-pink-100 bg-white p-6 shadow-sm">
              <div className="size-9 rounded-lg bg-[#FDF2F6] text-[#97144D] grid place-items-center">
                <f.icon className="size-4" />
              </div>
              <h3 className="mt-4 font-semibold text-[#1A1A2E]">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
