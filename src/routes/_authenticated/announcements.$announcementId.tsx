import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Megaphone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/announcements/$announcementId")({
  head: () => ({ meta: [{ title: "Announcement — ADC" }] }),
  component: AnnouncementDetailPage,
});

function AnnouncementDetailPage() {
  const { announcementId } = Route.useParams();
  const { data: a, isLoading } = useQuery({
    queryKey: ["announcement", announcementId],
    queryFn: async () => {
      const { data } = await supabase.from("announcements").select("*").eq("id", announcementId).maybeSingle();
      return data;
    },
  });

  return (
    <div className="p-5 space-y-5">
      <header className="flex items-center gap-3 pt-2">
        <Link to="/notifications" className="size-9 rounded-full bg-white border border-border shadow-soft flex items-center justify-center">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-bold">Announcement</h1>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !a ? (
        <p className="text-sm text-muted-foreground">Announcement not found.</p>
      ) : (
        <article className="bg-card border rounded-2xl p-5 shadow-soft space-y-3">
          <div className="flex items-center gap-2">
            <span className="size-10 rounded-full bg-[color:var(--brand-home)] flex items-center justify-center">
              <Megaphone className="size-5 text-white" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--brand-home)]">Community announcement</p>
              <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("en-AU")}</p>
            </div>
          </div>
          <h2 className="text-xl font-bold leading-tight">{a.title}</h2>
          {a.content && <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{a.content}</p>}
        </article>
      )}
    </div>
  );
}
