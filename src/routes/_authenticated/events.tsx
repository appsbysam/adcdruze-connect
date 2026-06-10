import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Calendar, Search, Users } from "lucide-react";
import heroPicnic from "@/assets/hero-picnic.jpg";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({ meta: [{ title: "Events — ADC" }] }),
  component: EventsPage,
});

const CATEGORIES = ["All", "Community", "Religious", "Youth", "Women's", "Fundraising"] as const;
type Category = (typeof CATEGORIES)[number];

function EventsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");

  const { data: events = [] } = useQuery({
    queryKey: ["events", "all"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").order("date");
      return data ?? [];
    },
  });

  const { data: rsvpCounts = {} } = useQuery({
    queryKey: ["rsvp-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("event_rsvps").select("event_id, status");
      const map: Record<string, number> = {};
      (data ?? []).forEach((r) => {
        if (r.status === "going") map[r.event_id] = (map[r.event_id] ?? 0) + 1;
      });
      return map;
    },
  });

  const filtered = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => (tab === "upcoming" ? new Date(e.date).getTime() >= now : new Date(e.date).getTime() < now))
      .filter((e) => category === "All" || e.category === category)
      .filter((e) => !query || e.title.toLowerCase().includes(query.toLowerCase()) || (e.location ?? "").toLowerCase().includes(query.toLowerCase()));
  }, [events, tab, category, query]);

  return (
    <div className="p-5 space-y-5">
      <header className="pt-2">
        <p className="text-xs uppercase tracking-wider text-[color:var(--brand-events)] font-semibold">Events</p>
        <h1 className="text-2xl font-bold">What's on</h1>
        <p className="text-sm text-muted-foreground mt-1">Community gatherings, lectures and celebrations.</p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events or location"
          className="w-full pl-10 pr-4 py-2.5 bg-card border rounded-xl text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-events)]/30"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-muted p-1 rounded-xl">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${
              tab === t ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1">
        {CATEGORIES.map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                active
                  ? "bg-[color:var(--brand-events)] text-white border-[color:var(--brand-events)]"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">No events match your filters.</p>
        )}
        {filtered.map((e, i) => (
          <Link
            key={e.id}
            to="/events/$eventId"
            params={{ eventId: e.id }}
            className="block bg-card border rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-shadow"
          >
            {i === 0 && tab === "upcoming" && (
              <img src={heroPicnic} alt={e.title} className="w-full h-44 object-cover" width={1280} height={768} loading="lazy" />
            )}
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="size-14 rounded-xl bg-[color:var(--brand-events-soft)] flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] uppercase font-semibold text-[color:var(--brand-events)]">
                    {new Date(e.date).toLocaleDateString("en-AU", { month: "short" })}
                  </span>
                  <span className="text-lg font-bold leading-none text-[color:var(--brand-events)]">
                    {new Date(e.date).getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {e.category && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[color:var(--brand-events-soft)] text-[color:var(--brand-events)]">
                        {e.category}
                      </span>
                    )}
                  </div>
                  <h2 className="font-semibold leading-snug mt-1">{e.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{e.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {new Date(e.date).toLocaleString("en-AU", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" /> {e.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" /> {rsvpCounts[e.id] ?? 0} going
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
