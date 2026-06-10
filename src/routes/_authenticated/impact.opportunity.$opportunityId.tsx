import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, MapPin, Users, Clock, Phone, Mail, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/impact/opportunity/$opportunityId")({
  component: OpportunityDetail,
});

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function fmtTime(t?: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
}

function OpportunityDetail() {
  const { opportunityId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const { data: opp } = useQuery({
    queryKey: ["volunteer_opportunity", opportunityId],
    queryFn: async () => {
      const { data } = await supabase.from("volunteer_opportunities").select("*").eq("id", opportunityId).maybeSingle();
      return data;
    },
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ["volunteer_registrations", opportunityId],
    queryFn: async () => {
      const { data } = await supabase.from("volunteer_registrations").select("*").eq("opportunity_id", opportunityId);
      return data ?? [];
    },
  });

  const { data: userId } = useQuery({
    queryKey: ["user_id"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
  });

  const myReg = registrations.find((r) => r.user_id === userId);

  const register = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("volunteer_registrations").insert({
        opportunity_id: opportunityId,
        user_id: userId,
        message: message || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("You're registered! Thank you for volunteering.");
      setShowForm(false);
      setMessage("");
      qc.invalidateQueries({ queryKey: ["volunteer_registrations"] });
      qc.invalidateQueries({ queryKey: ["volunteer_registration_counts"] });
      qc.invalidateQueries({ queryKey: ["my_volunteer_registrations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: async () => {
      if (!myReg) return;
      const { error } = await supabase.from("volunteer_registrations").delete().eq("id", myReg.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Registration cancelled");
      qc.invalidateQueries({ queryKey: ["volunteer_registrations"] });
      qc.invalidateQueries({ queryKey: ["volunteer_registration_counts"] });
      qc.invalidateQueries({ queryKey: ["my_volunteer_registrations"] });
    },
  });

  if (!opp) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  const reg = registrations.length;
  const pct = Math.min(100, Math.round((reg / opp.volunteers_required) * 100));
  const full = reg >= opp.volunteers_required;

  return (
    <div className="pb-8">
      <div className="bg-gradient-to-br from-[color:var(--brand-home)] to-emerald-600 text-white p-5 pt-6 rounded-b-3xl shadow-card">
        <button onClick={() => navigate({ to: "/impact/volunteer" })} className="inline-flex items-center gap-1 text-sm font-medium opacity-90 hover:opacity-100">
          <ArrowLeft className="size-4" /> Back
        </button>
        <span className="inline-block mt-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/20">
          {opp.committee}
        </span>
        <h1 className="mt-2 text-2xl font-bold">{opp.event_name}</h1>
        <p className="text-sm opacity-90 mt-1 flex items-center gap-1.5"><Calendar className="size-4" />{fmtDate(opp.date)}</p>
        <p className="text-sm opacity-90 flex items-center gap-1.5"><Clock className="size-4" />{fmtTime(opp.start_time)}{opp.end_time ? ` – ${fmtTime(opp.end_time)}` : ""}</p>
        <p className="text-sm opacity-90 flex items-center gap-1.5"><MapPin className="size-4" />{opp.location}</p>
      </div>

      <div className="p-5 space-y-5">
        <section className="bg-card border rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold"><Users className="size-4 text-[color:var(--brand-home)]" /> {reg} of {opp.volunteers_required} volunteers</span>
            <span className="font-semibold text-[color:var(--brand-home)]">{pct}%</span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-[color:var(--brand-home)]" style={{ width: `${pct}%` }} />
          </div>
        </section>

        {opp.description && (
          <section>
            <h2 className="text-sm font-semibold mb-1.5">About this opportunity</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{opp.description}</p>
          </section>
        )}

        {opp.requirements && (
          <section>
            <h2 className="text-sm font-semibold mb-1.5">Requirements</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{opp.requirements}</p>
          </section>
        )}

        {opp.time_commitment && (
          <section>
            <h2 className="text-sm font-semibold mb-1.5">Time commitment</h2>
            <p className="text-sm text-muted-foreground">{opp.time_commitment}</p>
          </section>
        )}

        <section className="bg-card border rounded-2xl p-4 shadow-soft">
          <h2 className="text-sm font-semibold mb-2">Organiser</h2>
          <p className="text-sm font-medium">{opp.organiser_name}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {opp.organiser_phone && (
              <a href={`tel:${opp.organiser_phone}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--brand-home)]">
                <Phone className="size-3.5" /> {opp.organiser_phone}
              </a>
            )}
            {opp.organiser_email && (
              <a href={`mailto:${opp.organiser_email}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--brand-home)]">
                <Mail className="size-3.5" /> {opp.organiser_email}
              </a>
            )}
          </div>
        </section>

        {myReg ? (
          <div className="bg-[color:var(--brand-home-soft)] border border-[color:var(--brand-home)]/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-[color:var(--brand-home)] font-semibold">
              <CheckCircle2 className="size-5" /> You're registered to volunteer
            </div>
            <button
              onClick={() => cancel.mutate()}
              disabled={cancel.isPending}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-white border border-[color:var(--brand-events)]/30 text-[color:var(--brand-events)]"
            >
              <X className="size-4" /> Cancel registration
            </button>
          </div>
        ) : showForm ? (
          <div className="bg-card border rounded-2xl p-4 shadow-soft space-y-3">
            <h3 className="text-sm font-semibold">Volunteer registration</h3>
            <p className="text-xs text-muted-foreground">Confirm your spot — the organiser will follow up with details.</p>
            <label className="block">
              <span className="text-xs font-medium">Message (optional)</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Anything the organiser should know?"
                className="mt-1 w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-home)]/30"
                maxLength={500}
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
              >Cancel</button>
              <button
                onClick={() => register.mutate()}
                disabled={register.isPending}
                className="flex-1 py-2.5 rounded-xl bg-[color:var(--brand-home)] text-white text-sm font-semibold"
              >{register.isPending ? "Registering…" : "Confirm"}</button>
            </div>
          </div>
        ) : (
          <button
            disabled={full}
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl bg-[color:var(--brand-home)] text-white font-semibold disabled:opacity-50"
          >
            {full ? "Fully booked" : "Register to volunteer"}
          </button>
        )}

        <Link to="/impact/volunteer" className="block text-center text-xs font-medium text-muted-foreground">
          ← All opportunities
        </Link>
      </div>
    </div>
  );
}
