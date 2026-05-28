import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const ROWS = [
  { variant: "Business Classic", old: "MAB ≥ 50%", new_: "MAB ≥ 75%", above: "₹1,500", below: "₹2,500" },
  { variant: "Business Privilege", old: "MAB ≥ 50%", new_: "MAB ≥ 75%", above: "₹2,500", below: "₹4,000" },
  { variant: "Channel One", old: "MAB ≥ 50%", new_: "MAB ≥ 75%", above: "₹4,500", below: "₹7,000" },
];

export function ChargeChangeSummary() {
  return (
    <div className="rounded-xl border border-[#97144D]/20 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#97144D]/15 bg-[#FDF2F6]">
        <h4 className="text-sm font-semibold text-[#5B0E2D]">Charge Change Summary</h4>
        <span className="text-[10px] font-semibold uppercase tracking-wide rounded-full bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5">
          Effective 01-Oct-2025
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FDF2F6]/40">
              <TableHead className="text-[#5B0E2D]">Variant</TableHead>
              <TableHead className="text-[#5B0E2D]">Old Threshold</TableHead>
              <TableHead className="text-[#5B0E2D]">New Threshold</TableHead>
              <TableHead className="text-[#5B0E2D]">Charge (≥ threshold)</TableHead>
              <TableHead className="text-[#5B0E2D]">Charge (&lt; threshold)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((r) => (
              <TableRow key={r.variant}>
                <TableCell className="font-medium text-[#1A1A2E]">{r.variant}</TableCell>
                <TableCell className="text-muted-foreground line-through">{r.old}</TableCell>
                <TableCell className="text-[#97144D] font-semibold">{r.new_}</TableCell>
                <TableCell>{r.above}</TableCell>
                <TableCell>{r.below}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="px-4 py-3 border-t border-border bg-white space-y-1">
        <p className="text-xs text-[#1A1A2E]">
          Threshold changed from <span className="font-semibold">50%</span> to{" "}
          <span className="font-semibold text-[#97144D]">75%</span>. Charge amounts unchanged.
        </p>
        <p className="text-[11px] text-muted-foreground italic">
          Source: Axis Bank Fee Revision Notice, p.1
        </p>
      </div>
    </div>
  );
}
