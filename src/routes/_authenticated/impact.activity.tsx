import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Award, Calendar, Sparkles, ArrowLeft, MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/impact/activity")({
  component: MyActivity,
});

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

function MyActivity() {
  const { data: userId } = useQuery({
    queryKey: ["user_id"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
  });

  const { data: regs = [] } = useQuery({
    enabled: !!userId,
    queryKey: ["my_volunteer_registrations", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("volunteer_registrations")
        .select("*, volunteer_opportunities(*)")
        .eq("user_id", userId!);
      return data ?? [];
    },
  });

  const now = new Date();
  const past = regs.filter((r) => r.volunteer_opportunities && new Date(r.volunteer_opportunities.date) < now);
  const upcoming = regs.filter((r) => r.volunteer_opportunities && new Date(r.volunteer_opportunities.date) >= now);
  const hours = past.reduce((s, r) => s + Number(r.volunteer_opportunities?.hours_estimate ?? 0), 0);
  const points = Math.round(hours * 10 + past.length * 25);

  const stats = [
    { label: "Hours contributed", value: hours.toFixed(1), icon: Clock, color: "var(--brand-home)" },
    { label: "Opportunities completed", value: past.length, icon: Award, color: "var(--brand-groups)" },
    { label: "Upcoming commitments", value: upcoming.length, icon: Calendar, color: "var(--brand-directory)" },
    { label: "Impact points", value: points, icon: Sparkles, color: "#7C3AED" },
  ];

  return (
    <div className="space-y-5">
      <Link to="/impact/volunteer" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" /> Back to volunteer
      </Link>

      <section>
        <h2 className="text-base font-semibold mb-3">My volunteer activity</h2>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-card border rounded-2xl p-4 shadow-soft">
                <span className="size-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `color-mix(in oklab, ${s.color} 14%, transparent)` }}>
                  <Icon className="size-4" style={{ color: s.color }} />
                </span>
                <p className="text-2xl font-bold mt-2" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-2">Upcoming commitments</h3>
        {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No upcoming volunteer commitments yet.</p>}
        <div className="space-y-2.5">
          {upcoming.map((r) => r.volunteer_opportunities && (
            <Link
              key={r.id}
              to="/impact/opportunity/$opportunityId"
              params={{ opportunityId: r.volunteer_opportunities.id }}
              className="block bg-card border rounded-2xl p-3.5 shadow-soft"
            >
              <p className="font-semibold text-sm">{r.volunteer_opportunities.event_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Calendar className="size-3" />{fmtDate(r.volunteer_opportunities.date)}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3" />{r.volunteer_opportunities.location}</p>
            </Link>
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-2">Completed</h3>
          <div className="space-y-2.5">
            {past.map((r) => r.volunteer_opportunities && (
              <div key={r.id} className="bg-card border rounded-2xl p-3.5 shadow-soft opacity-80">
                <p className="font-semibold text-sm">{r.volunteer_opportunities.event_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(r.volunteer_opportunities.date)} · {Number(r.volunteer_opportunities.hours_estimate)}h</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
