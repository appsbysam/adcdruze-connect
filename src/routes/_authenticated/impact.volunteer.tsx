import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Users, Activity, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/impact/volunteer")({
  component: VolunteerListing,
});

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(t: string) {
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
}

function VolunteerListing() {
  const { data: opportunities = [] } = useQuery({
    queryKey: ["volunteer_opportunities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("volunteer_opportunities")
        .select("*")
        .order("date", { ascending: true });
      return data ?? [];
    },
  });

  const { data: regCounts = {} } = useQuery({
    queryKey: ["volunteer_registration_counts"],
    queryFn: async () => {
      const { data } = await supabase.from("volunteer_registrations").select("opportunity_id");
      const map: Record<string, number> = {};
      (data ?? []).forEach((r) => { map[r.opportunity_id] = (map[r.opportunity_id] ?? 0) + 1; });
      return map;
    },
  });

  return (
    <div className="space-y-5">
      <Link
        to="/impact/activity"
        className="flex items-center justify-between bg-[color:var(--brand-home-soft)] border border-[color:var(--brand-home)]/15 rounded-2xl p-4 shadow-soft"
      >
        <div className="flex items-center gap-3">
          <span className="size-10 rounded-xl bg-[color:var(--brand-home)] flex items-center justify-center">
            <Activity className="size-5 text-white" />
          </span>
          <div>
            <p className="font-semibold text-sm">My Volunteer Activity</p>
            <p className="text-xs text-muted-foreground">Hours, impact points & upcoming</p>
          </div>
        </div>
        <ArrowRight className="size-4 text-[color:var(--brand-home)]" />
      </Link>

      <section>
        <h2 className="text-base font-semibold mb-3">Upcoming opportunities</h2>
        <div className="space-y-2.5">
          {opportunities.map((o) => {
            const reg = regCounts[o.id] ?? 0;
            const pct = Math.min(100, Math.round((reg / o.volunteers_required) * 100));
            return (
              <Link
                key={o.id}
                to="/impact/opportunity/$opportunityId"
                params={{ opportunityId: o.id }}
                className="block bg-card border rounded-2xl p-4 shadow-soft hover:shadow-card transition-shadow"
              >
                <div className="flex gap-3 items-start">
                  <div className="size-14 rounded-xl bg-[color:var(--brand-home-soft)] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] uppercase font-semibold text-[color:var(--brand-home)]">
                      {new Date(o.date).toLocaleDateString("en-AU", { month: "short" })}
                    </span>
                    <span className="text-lg font-bold leading-none text-[color:var(--brand-home)]">
                      {new Date(o.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold leading-tight">{o.event_name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[color:var(--brand-home-soft)] text-[color:var(--brand-home)]">
                      {o.committee}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Calendar className="size-3" /> {fmtDate(o.date)} · {fmtTime(o.start_time)}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3" /> {o.location}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Users className="size-3" /> {reg} of {o.volunteers_required} registered
                        </span>
                        <span className="font-semibold text-[color:var(--brand-home)]">{pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-[color:var(--brand-home)]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
