import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SCHEMES = [
  { code: "CANOR", name: "Normal Current Account" },
  { code: "CAADV", name: "Advantage Current Account" },
  { code: "CASEL", name: "Select Current Account" },
  { code: "CAPHM", name: "Pharmaceutical Current Account" },
  { code: "CAJEW", name: "Jewellers Current Account" },
  { code: "CADEL", name: "Delite Current Account" },
  { code: "CANEG", name: "New Economy Group (Startup)" },
  { code: "CACAP", name: "Capital Market Current Account" },
  { code: "CAGBL", name: "Global Current Account" },
  { code: "CATRS", name: "Trusts Current Account" },
  { code: "CABCA", name: "Business Classic" },
  { code: "CABPL", name: "Business Privilege" },
  { code: "CACH1", name: "Channel One" },
  { code: "CASIL", name: "Current Account for MCA Entities" },
  { code: "CAPBG", name: "Priority Current Account" },
  { code: "CABGY", name: "Burgundy Current Account" },
  { code: "CAPRV", name: "Burgundy Private Current Account" },
];

export function SchemeLookup() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SCHEMES.map((s) => ({ ...s, highlight: false }));
    return SCHEMES.map((s) => ({
      ...s,
      highlight:
        s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    }));
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <h3 className="text-sm font-semibold text-[#5B0E2D] mb-2 flex items-center gap-1.5">
          <Search className="size-3.5" />
          Scheme Code Lookup
        </h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code or name…"
            className="pl-8 h-8 text-xs focus-visible:ring-[#97144D]"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 py-2">
          <div className="grid grid-cols-[80px_1fr] gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 py-1.5 border-b border-border">
            <span>Code</span>
            <span>Variant Name</span>
          </div>
          {filtered.map((s) => (
            <div
              key={s.code}
              className={cn(
                "grid grid-cols-[80px_1fr] gap-1 text-xs px-2 py-1.5 rounded-md transition",
                s.highlight
                  ? "bg-[#97144D] text-white"
                  : "text-[#1A1A2E] hover:bg-muted/50",
              )}
            >
              <span className="font-mono font-semibold">{s.code}</span>
              <span className="truncate">{s.name}</span>
            </div>
          ))}
          {filtered.every((s) => !s.highlight) && query.trim() && (
            <div className="text-xs text-muted-foreground text-center py-4">
              No matching scheme found
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="px-4 py-3 border-t border-border bg-[#FDF2F6]/40">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Source: Axis Bank Fee Revision Notice (Oct 2025)
        </p>
      </div>
    </div>
  );
}
