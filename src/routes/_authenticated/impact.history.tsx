import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Download, Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/impact/history")({
  component: DonationHistory,
});

const GOLD = "#C9A227";
const GOLD_SOFT = "#FBF3D8";

const CAT_LABELS: Record<string, string> = {
  community: "Community Programs",
  youth: "Youth Programs",
  religious: "Religious Activities",
  emergency: "Emergency Assistance",
  general: "General Donation",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function downloadReceipt(d: {
  receipt_number: string; amount: number; category: string; created_at: string; frequency: string; donor_name: string | null; message: string | null;
}) {
  const lines = [
    "AUSTRALIAN DRUZE COMMUNITY",
    "Donation Receipt",
    "================================",
    `Receipt #: ${d.receipt_number}`,
    `Date: ${fmtDate(d.created_at)}`,
    `Donor: ${d.donor_name || "Anonymous"}`,
    `Category: ${CAT_LABELS[d.category] ?? d.category}`,
    `Frequency: ${d.frequency === "monthly" ? "Monthly" : "One-time"}`,
    `Amount: $${Number(d.amount).toFixed(2)} AUD`,
    d.message ? `Message: ${d.message}` : "",
    "",
    "Thank you for your generous contribution.",
  ].filter(Boolean).join("\n");
  const blob = new Blob([lines], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${d.receipt_number}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Receipt downloaded");
}

function DonationHistory() {
  const { data: donations = [] } = useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      const { data } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const total = donations.reduce((s, d) => s + Number(d.amount), 0);

  return (
    <div className="space-y-5">
      <Link to="/impact/donate" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" /> Back to donate
      </Link>

      <section className="rounded-2xl p-5 shadow-soft border" style={{ backgroundColor: GOLD_SOFT, borderColor: `${GOLD}33` }}>
        <div className="flex items-center gap-3">
          <span className="size-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: GOLD }}>
            <Heart className="size-6 text-white" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: GOLD }}>Total contributed</p>
            <p className="text-3xl font-bold" style={{ color: GOLD }}>${total.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{donations.length} donation{donations.length === 1 ? "" : "s"}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3">My donations</h2>
        {donations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No donations yet. <Link to="/impact/donate" className="font-semibold" style={{ color: GOLD }}>Make your first donation</Link>.</p>
        )}
        <div className="space-y-2.5">
          {donations.map((d) => (
            <div key={d.id} className="bg-card border rounded-2xl p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{CAT_LABELS[d.category] ?? d.category}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(d.created_at)} · {d.frequency === "monthly" ? "Monthly" : "One-time"}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Receipt {d.receipt_number}</p>
                </div>
                <p className="text-lg font-bold shrink-0" style={{ color: GOLD }}>${Number(d.amount).toFixed(2)}</p>
              </div>
              <button
                onClick={() => downloadReceipt(d)}
                className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border"
                style={{ borderColor: `${GOLD}55`, color: GOLD }}
              >
                <Download className="size-3.5" /> Download receipt
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
