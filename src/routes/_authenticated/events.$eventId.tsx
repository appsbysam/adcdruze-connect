import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Share2, Check, Star, X, ExternalLink, User } from "lucide-react";
import { toast } from "sonner";
import heroPicnic from "@/assets/hero-picnic.jpg";

export const Route = createFileRoute("/_authenticated/events/$eventId")({
  head: () => ({ meta: [{ title: "Event — ADC" }] }),
  errorComponent: ({ error }) => (
    <div className="p-8 text-center">
      <p className="text-sm text-destructive">{error.message}</p>
      <Link to="/events" className="text-sm text-[color:var(--brand-events)] font-semibold mt-3 inline-block">
        Back to events
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p className="text-sm text-muted-foreground">Event not found.</p>
      <Link to="/events" className="text-sm text-[color:var(--brand-events)] font-semibold mt-3 inline-block">
        Back to events
      </Link>
    </div>
  ),
  component: EventDetailsPage,
});

type Status = "going" | "interested" | "not_attending";

function EventDetailsPage() {
  const { eventId } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const { session } = useSession();
  const userId = session?.user.id;

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: rsvps = [] } = useQuery({
    queryKey: ["rsvps", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("event_rsvps").select("user_id, status").eq("event_id", eventId);
      return data ?? [];
    },
  });

  const myStatus = rsvps.find((r) => r.user_id === userId)?.status as Status | undefined;
  const goingCount = rsvps.filter((r) => r.status === "going").length;
  const interestedCount = rsvps.filter((r) => r.status === "interested").length;

  const rsvpMutation = useMutation({
    mutationFn: async (status: Status) => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("event_rsvps")
        .upsert({ event_id: eventId, user_id: userId, status }, { onConflict: "event_id,user_id" });
      if (error) throw error;
    },
    onSuccess: (_, status) => {
      qc.invalidateQueries({ queryKey: ["rsvps", eventId] });
      qc.invalidateQueries({ queryKey: ["rsvp-counts"] });
      toast.success(
        status === "going" ? "You're going! 🎉" : status === "interested" ? "Marked as interested" : "Marked as not attending"
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: event?.title, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!event) return <div className="p-8 text-center text-sm text-muted-foreground">Event not found.</div>;

  const date = new Date(event.date);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location ?? "")}`;

  return (
    <div className="pb-32">
      {/* Banner */}
      <div className="relative">
        <img src={event.image || heroPicnic} alt={event.title} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        <button
          onClick={() => router.history.back()}
          className="absolute top-4 left-4 size-10 rounded-full bg-white/95 flex items-center justify-center shadow-card"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 size-10 rounded-full bg-white/95 flex items-center justify-center shadow-card"
          aria-label="Share"
        >
          <Share2 className="size-5" />
        </button>
        {event.category && (
          <span className="absolute bottom-4 left-4 inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[color:var(--brand-events)] text-white">
            {event.category}
          </span>
        )}
      </div>

      <div className="p-5 space-y-5">
        <div>
          <h1 className="text-2xl font-bold leading-tight">{event.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4 text-[color:var(--brand-events)]" />
              <strong className="text-foreground">{goingCount}</strong> going
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4 text-[color:var(--brand-directory)]" />
              <strong className="text-foreground">{interestedCount}</strong> interested
            </span>
          </div>
        </div>

        {/* Date / Location cards */}
        <div className="bg-card border rounded-2xl divide-y shadow-soft">
          <div className="p-4 flex items-center gap-3">
            <span className="size-10 rounded-xl bg-[color:var(--brand-events-soft)] flex items-center justify-center shrink-0">
              <Calendar className="size-5 text-[color:var(--brand-events)]" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                {date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <Clock className="size-3" />
                {date.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}
                {event.capacity ? ` · Capacity ${event.capacity}` : ""}
              </p>
            </div>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="p-4 flex items-center gap-3 hover:bg-muted/40 transition-colors"
          >
            <span className="size-10 rounded-xl bg-[color:var(--brand-groups-soft)] flex items-center justify-center shrink-0">
              <MapPin className="size-5 text-[color:var(--brand-groups)]" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{event.location}</p>
              <p className="text-xs text-[color:var(--brand-groups)] inline-flex items-center gap-1">
                Open in Google Maps <ExternalLink className="size-3" />
              </p>
            </div>
          </a>
          {event.organiser && (
            <div className="p-4 flex items-center gap-3">
              <span className="size-10 rounded-xl bg-[color:var(--brand-home-soft)] flex items-center justify-center shrink-0">
                <User className="size-5 text-[color:var(--brand-home)]" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Organised by</p>
                <p className="text-sm font-semibold">{event.organiser}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <section>
            <h2 className="text-base font-semibold mb-2">About this event</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
          </section>
        )}
      </div>

      {/* Sticky RSVP bar */}
      <div className="fixed bottom-20 inset-x-0 z-30 px-4">
        <div className="max-w-md mx-auto bg-card border rounded-2xl shadow-card p-2 grid grid-cols-3 gap-2">
          <RsvpButton
            label="Going"
            icon={Check}
            color="var(--brand-home)"
            soft="var(--brand-home-soft)"
            active={myStatus === "going"}
            onClick={() => rsvpMutation.mutate("going")}
            disabled={rsvpMutation.isPending}
          />
          <RsvpButton
            label="Interested"
            icon={Star}
            color="var(--brand-directory)"
            soft="var(--brand-directory-soft)"
            active={myStatus === "interested"}
            onClick={() => rsvpMutation.mutate("interested")}
            disabled={rsvpMutation.isPending}
          />
          <RsvpButton
            label="Can't go"
            icon={X}
            color="var(--brand-events)"
            soft="var(--brand-events-soft)"
            active={myStatus === "not_attending"}
            onClick={() => rsvpMutation.mutate("not_attending")}
            disabled={rsvpMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}

function RsvpButton({
  label, icon: Icon, color, soft, active, onClick, disabled,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  soft: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all text-xs font-semibold disabled:opacity-60"
      style={{
        backgroundColor: active ? color : soft,
        color: active ? "white" : color,
      }}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
