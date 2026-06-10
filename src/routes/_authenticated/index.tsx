import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Calendar, Users, UsersRound, Briefcase, HeartHandshake, Gift, MapPin, ArrowRight, Megaphone } from "lucide-react";
import heroPicnic from "@/assets/hero-picnic.jpg";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Home — Australian Druze Community" },
      { name: "description", content: "Your community front door: events, announcements, groups and businesses." },
    ],
  }),
  component: HomePage,
});

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
}

function HomePage() {
  const { data: events = [] } = useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(4);
      return data ?? [];
    },
  });
  const { data: announcement } = useQuery({
    queryKey: ["announcements", "latest"],
    queryFn: async () => {
      const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [members, evs, biz] = await Promise.all([
        supabase.from("members").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }).gte("date", new Date().toISOString()),
        supabase.from("businesses").select("*", { count: "exact", head: true }),
      ]);
      return {
        members: members.count ?? 0,
        events: evs.count ?? 0,
        businesses: biz.count ?? 0,
        volunteers: 124,
      };
    },
  });
  const { data: groups = [] } = useQuery({
    queryKey: ["groups", "home"],
    queryFn: async () => {
      const { data } = await supabase.from("groups").select("*").limit(3);
      return data ?? [];
    },
  });

  const featured = events[0];
  const upcoming = events.slice(1, 4);

  const quick = [
    { label: "Events", icon: Calendar, color: "var(--brand-events)", soft: "var(--brand-events-soft)", to: "/events" as const },
    { label: "Directory", icon: Users, color: "var(--brand-directory)", soft: "var(--brand-directory-soft)", to: "/directory" as const },
    { label: "Groups", icon: UsersRound, color: "var(--brand-groups)", soft: "var(--brand-groups-soft)", to: "/groups" as const },
    { label: "Businesses", icon: Briefcase, color: "#0E8A4A", soft: "var(--brand-home-soft)", to: "/businesses" as const },
    { label: "Volunteer", icon: HeartHandshake, color: "var(--brand-home)", soft: "var(--brand-home-soft)", to: "/impact/volunteer" as const },
    { label: "Donate", icon: Gift, color: "#C9A227", soft: "#FBF3D8", to: "/impact/donate" as const },
  ];

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between pt-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-[color:var(--brand-home)] font-semibold">ADC</p>
          <h1 className="text-2xl font-bold tracking-tight leading-tight">Australian Druze<br />Community</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay connected. Stay informed. Stay involved.</p>
        </div>
        <Link to="/notifications" className="relative size-10 rounded-full bg-white border border-border shadow-soft flex items-center justify-center">
          <Bell className="size-5 text-foreground" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-[color:var(--brand-events)]" />
        </Link>
      </header>

      {/* Featured event */}
      {featured && (
        <Link to="/events/$eventId" params={{ eventId: featured.id }} className="block relative overflow-hidden rounded-2xl shadow-card">
          <img src={heroPicnic} alt={featured.title} className="w-full h-56 object-cover" width={1280} height={768} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[color:var(--brand-events)]">Featured event</span>
            <h2 className="mt-2 text-xl font-bold">{featured.title}</h2>
            <p className="text-sm opacity-90 mt-1 flex items-center gap-3">
              <span>{fmtDate(featured.date)} · {fmtTime(featured.date)}</span>
            </p>
            <p className="text-sm opacity-90 flex items-center gap-1.5"><MapPin className="size-3.5" />{featured.location}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 bg-white text-foreground text-sm font-semibold px-4 py-2 rounded-full">
              View & RSVP <ArrowRight className="size-4" />
            </span>
          </div>
        </Link>
      )}


      {/* Quick access */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick access</h3>
        <div className="grid grid-cols-3 gap-3">
          {quick.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.label} to={q.to} className="bg-card border rounded-2xl p-4 flex flex-col items-center text-center shadow-soft hover:shadow-card transition-shadow">
                <span className="size-11 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: q.soft }}>
                  <Icon className="size-5" style={{ color: q.color }} />
                </span>
                <span className="text-xs font-medium">{q.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Announcement */}
      {announcement && (
        <section className="bg-[color:var(--brand-home-soft)] border border-[color:var(--brand-home)]/15 rounded-2xl p-4 flex gap-3">
          <span className="size-9 rounded-full bg-[color:var(--brand-home)] flex items-center justify-center shrink-0">
            <Megaphone className="size-4 text-white" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[color:var(--brand-home)] uppercase tracking-wider">Announcement</p>
            <p className="text-sm font-semibold mt-0.5">{announcement.title}</p>
            {announcement.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{announcement.content}</p>}
          </div>
        </section>
      )}

      {/* Upcoming events */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Upcoming events</h3>
          <Link to="/events" className="text-xs font-medium text-[color:var(--brand-events)]">See all</Link>
        </div>
        <div className="space-y-2.5">
          {upcoming.map((e) => (
            <Link
              key={e.id}
              to="/events/$eventId"
              params={{ eventId: e.id }}
              className="bg-card border rounded-2xl p-3.5 flex gap-3 items-center shadow-soft hover:shadow-card transition-shadow"
            >
              <div className="size-14 rounded-xl bg-[color:var(--brand-events-soft)] flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] uppercase font-semibold text-[color:var(--brand-events)]">{new Date(e.date).toLocaleDateString("en-AU", { month: "short" })}</span>
                <span className="text-lg font-bold leading-none text-[color:var(--brand-events)]">{new Date(e.date).getDate()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{e.title}</p>
                <p className="text-xs text-muted-foreground">{fmtTime(e.date)} · {e.location}</p>
              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* Latest from groups */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Latest from groups</h3>
          <Link to="/groups" className="text-xs font-medium text-[color:var(--brand-groups)]">See all</Link>
        </div>
        <div className="space-y-2.5">
          {groups.map((g) => (
            <div key={g.id} className="bg-card border rounded-2xl p-3.5 flex gap-3 shadow-soft">
              <span className="size-10 rounded-full bg-[color:var(--brand-groups-soft)] flex items-center justify-center shrink-0">
                <UsersRound className="size-5 text-[color:var(--brand-groups)]" />
              </span>
              <div>
                <p className="font-semibold text-sm">{g.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{g.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section>
        <h3 className="text-base font-semibold mb-3">Community at a glance</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Members" value={stats?.members ?? 0} color="var(--brand-home)" soft="var(--brand-home-soft)" />
          <StatCard label="Upcoming events" value={stats?.events ?? 0} color="var(--brand-events)" soft="var(--brand-events-soft)" />
          <StatCard label="Businesses" value={stats?.businesses ?? 0} color="var(--brand-directory)" soft="var(--brand-directory-soft)" />
          <StatCard label="Volunteers" value={stats?.volunteers ?? 0} color="var(--brand-groups)" soft="var(--brand-groups-soft)" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, color, soft }: { label: string; value: number; color: string; soft: string }) {
  return (
    <div className="rounded-2xl p-4 shadow-soft border" style={{ backgroundColor: soft, borderColor: "transparent" }}>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs font-medium mt-1" style={{ color }}>{label}</p>
    </div>
  );
}
