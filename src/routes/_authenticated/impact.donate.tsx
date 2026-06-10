import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Users, Sparkles, BookHeart, LifeBuoy, Gift, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/impact/donate")({
  component: DonatePage,
});

const CATEGORIES = [
  { id: "community", label: "Community Programs", icon: Users, blurb: "Fund cultural events & gatherings." },
  { id: "youth", label: "Youth Programs", icon: Sparkles, blurb: "Support youth education & sport." },
  { id: "religious", label: "Religious Activities", icon: BookHeart, blurb: "Preserve traditions & ceremonies." },
  { id: "emergency", label: "Emergency Assistance", icon: LifeBuoy, blurb: "Help families in urgent need." },
  { id: "general", label: "General Donation", icon: Gift, blurb: "Apply where it's needed most." },
];

const PRESETS = [25, 50, 100, 250];
const GOLD = "#C9A227";
const GOLD_SOFT = "#FBF3D8";

function DonatePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [category, setCategory] = useState<string>("general");
  const [amount, setAmount] = useState<number>(50);
  const [custom, setCustom] = useState<string>("");
  const [frequency, setFrequency] = useState<"one_time" | "monthly">("one_time");
  const [message, setMessage] = useState("");
  const [donorName, setDonorName] = useState("");

  const { data: userId } = useQuery({
    queryKey: ["user_id"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
  });

  const donate = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Please sign in");
      const finalAmount = custom ? Number(custom) : amount;
      if (!finalAmount || finalAmount <= 0) throw new Error("Enter a valid amount");
      const { error } = await supabase.from("donations").insert({
        user_id: userId,
        amount: finalAmount,
        category,
        frequency,
        message: message || null,
        donor_name: donorName || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thank you for your generous donation!", { icon: "💚" });
      setCustom("");
      setMessage("");
      qc.invalidateQueries({ queryKey: ["donations"] });
      navigate({ to: "/impact/history" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const selectedCat = CATEGORIES.find((c) => c.id === category)!;

  return (
    <div className="space-y-5">
      <Link
        to="/impact/history"
        className="flex items-center justify-between rounded-2xl p-4 shadow-soft border"
        style={{ backgroundColor: GOLD_SOFT, borderColor: `${GOLD}33` }}
      >
        <div className="flex items-center gap-3">
          <span className="size-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: GOLD }}>
            <Heart className="size-5 text-white" />
          </span>
          <div>
            <p className="font-semibold text-sm">Donation history</p>
            <p className="text-xs text-muted-foreground">View receipts & past donations</p>
          </div>
        </div>
        <ArrowRight className="size-4" style={{ color: GOLD }} />
      </Link>

      <section>
        <h2 className="text-base font-semibold mb-3">Choose a cause</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className="text-left rounded-2xl p-3 border-2 transition-all shadow-soft"
                style={{
                  borderColor: active ? GOLD : "transparent",
                  backgroundColor: active ? GOLD_SOFT : "var(--card)",
                }}
              >
                <span className="size-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: active ? GOLD : GOLD_SOFT }}>
                  <Icon className="size-4" style={{ color: active ? "white" : GOLD }} />
                </span>
                <p className="font-semibold text-sm mt-2">{c.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{c.blurb}</p>
                {active && <CheckCircle2 className="size-4 mt-1.5" style={{ color: GOLD }} />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-card border rounded-2xl p-4 shadow-soft space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Donating to</p>
          <p className="font-semibold" style={{ color: GOLD }}>{selectedCat.label}</p>
        </div>

        <div>
          <p className="text-xs font-medium mb-2">Frequency</p>
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl">
            {(["one_time", "monthly"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className="py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: frequency === f ? GOLD : "transparent", color: frequency === f ? "white" : "#7A6212" }}
              >
                {f === "one_time" ? "One-time" : "Monthly"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium mb-2">Amount (AUD)</p>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => {
              const active = !custom && amount === p;
              return (
                <button
                  key={p}
                  onClick={() => { setAmount(p); setCustom(""); }}
                  className="py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
                  style={{ borderColor: active ? GOLD : "var(--border)", backgroundColor: active ? GOLD_SOFT : "transparent", color: active ? GOLD : "inherit" }}
                >
                  ${p}
                </button>
              );
            })}
          </div>
          <div className="mt-2 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="1"
              max="100000"
              placeholder="Custom amount"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="w-full pl-7 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: custom ? GOLD : undefined }}
            />
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-medium">Display name (optional)</span>
          <input
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="How should we acknowledge you?"
            className="mt-1 w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2"
            maxLength={120}
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium">Message (optional)</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="A note for the committee"
            className="mt-1 w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2"
            maxLength={500}
          />
        </label>

        <button
          onClick={() => donate.mutate()}
          disabled={donate.isPending}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
          style={{ backgroundColor: GOLD }}
        >
          {donate.isPending ? "Processing…" : `Donate $${custom || amount} ${frequency === "monthly" ? "/ month" : ""}`}
        </button>

        <p className="text-[11px] text-muted-foreground text-center">
          Sample flow — no payment is processed. A receipt is generated for your records.
        </p>
      </section>
    </div>
  );
}
