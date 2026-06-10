import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Calendar, Users } from "lucide-react";
import heroPicnic from "@/assets/hero-picnic.jpg";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({ meta: [{ title: "Events — ADC" }] }),
  component: EventsPage,
});

function EventsPage() {
  const { data: events = [] } = useQuery({
    queryKey: ["events", "all"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").order("date");
      return data ?? [];
    },
  });

  return (
    <div className="p-5 space-y-5">
      <header className="pt-2">
        <p className="text-xs uppercase tracking-wider text-[color:var(--brand-events)] font-semibold">Events</p>
        <h1 className="text-2xl font-bold">What's on</h1>
        <p className="text-sm text-muted-foreground mt-1">Community gatherings, lectures and celebrations.</p>
      </header>

      <div className="space-y-4">
        {events.map((e, i) => (
          <article key={e.id} className="bg-card border rounded-2xl overflow-hidden shadow-card">
            {i === 0 && <img src={heroPicnic} alt={e.title} className="w-full h-44 object-cover" width={1280} height={768} loading="lazy" />}
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="size-14 rounded-xl bg-[color:var(--brand-events-soft)] flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] uppercase font-semibold text-[color:var(--brand-events)]">{new Date(e.date).toLocaleDateString("en-AU", { month: "short" })}</span>
                  <span className="text-lg font-bold leading-none text-[color:var(--brand-events)]">{new Date(e.date).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold leading-snug">{e.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{e.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" /> {new Date(e.date).toLocaleString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {e.location}</span>
                {e.capacity && <span className="inline-flex items-center gap-1"><Users className="size-3.5" /> {e.capacity} spots</span>}
              </div>
              <button className="w-full bg-[color:var(--brand-events)] text-white text-sm font-semibold py-2.5 rounded-xl">RSVP</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
