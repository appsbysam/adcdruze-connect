import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Calendar,
  UsersRound,
  HeartHandshake,
  Briefcase,
  Megaphone,
  CheckCheck,
  Bell,
  Gift,
  UserPlus,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — ADC" }] }),
  component: NotificationsPage,
});

type NType =
  | "event"
  | "committee"
  | "volunteer"
  | "business"
  | "announcement"
  | "donation"
  | "welcome";

const meta: Record<NType, { icon: LucideIcon; color: string; soft: string; label: string }> = {
  event: { icon: Calendar, color: "var(--brand-events)", soft: "var(--brand-events-soft)", label: "Event" },
  committee: { icon: UsersRound, color: "var(--brand-groups)", soft: "var(--brand-groups-soft)", label: "Group" },
  volunteer: { icon: HeartHandshake, color: "var(--brand-home)", soft: "var(--brand-home-soft)", label: "Volunteer" },
  business: { icon: Briefcase, color: "#0E8A4A", soft: "var(--brand-home-soft)", label: "Business" },
  announcement: { icon: Megaphone, color: "var(--brand-home)", soft: "var(--brand-home-soft)", label: "Announcement" },
  donation: { icon: Gift, color: "#C9A227", soft: "#FBF3D8", label: "Donation" },
  welcome: { icon: UserPlus, color: "var(--brand-directory)", soft: "var(--brand-directory-soft)", label: "Welcome" },
};

const INVITATION_TYPES: NType[] = ["event", "volunteer", "committee"];

type Filter = "all" | "unread" | "announcements" | "invitations";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await supabase.from("notifications").update({ read: true }).eq("read", false);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "announcements") return n.type === "announcement";
    if (filter === "invitations") return INVITATION_TYPES.includes(n.type as NType);
    return true;
  });

  function handleClick(n: typeof notifications[number]) {
    if (!n.read) markRead.mutate(n.id);
    const type = n.type as NType;
    if (type === "event" && n.ref_id) navigate({ to: "/events/$eventId", params: { eventId: n.ref_id } });
    else if (type === "committee" && n.ref_id) navigate({ to: "/groups/$groupId", params: { groupId: n.ref_id } });
    else if (type === "volunteer" && n.ref_id) navigate({ to: "/impact/opportunity/$opportunityId", params: { opportunityId: n.ref_id } });
    else if (type === "business" && n.ref_id) navigate({ to: "/businesses/$businessId", params: { businessId: n.ref_id } });
    else if (type === "announcement" && n.ref_id) navigate({ to: "/announcements/$announcementId", params: { announcementId: n.ref_id } });
    else if (type === "announcement") navigate({ to: "/" });
    else if (type === "donation") navigate({ to: "/impact/history" });
    else if (type === "welcome" && n.ref_id) navigate({ to: "/directory/$memberId", params: { memberId: n.ref_id } });
    else if (type === "welcome") navigate({ to: "/directory" });
  }

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: `Unread${unread > 0 ? ` (${unread})` : ""}` },
    { key: "announcements", label: "Announcements" },
    { key: "invitations", label: "Invitations" },
  ];

  return (
    <div className="p-5 space-y-5">
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link to="/" className="size-9 rounded-full bg-white border border-border shadow-soft flex items-center justify-center">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Notifications</h1>
            <p className="text-xs text-muted-foreground">{unread > 0 ? `${unread} unread` : "All caught up"}</p>
          </div>
        </div>
        <Link
          to="/notifications/settings"
          className="size-9 rounded-full bg-white border border-border shadow-soft flex items-center justify-center"
          aria-label="Notification settings"
        >
          <Settings className="size-4" />
        </Link>
      </header>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 no-scrollbar">
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                active
                  ? "bg-[color:var(--brand-home)] text-white border-[color:var(--brand-home)]"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {unread > 0 && (
        <button
          onClick={() => markAllRead.mutate()}
          className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--brand-home)] px-3 py-2 rounded-full bg-[color:var(--brand-home-soft)]"
        >
          <CheckCheck className="size-3.5" /> Mark all as read
        </button>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-muted mb-3">
            <Bell className="size-7 text-muted-foreground" />
          </span>
          <p className="font-semibold">No notifications</p>
          <p className="text-sm text-muted-foreground">
            {filter === "all" ? "You'll see updates here when they arrive." : "Nothing in this filter right now."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((n) => {
            const m = meta[n.type as NType] ?? meta.announcement;
            const Icon = m.icon;
            return (
              <li key={n.id}>
                <button
                  onClick={() => handleClick(n)}
                  className={`w-full text-left bg-card border rounded-2xl p-3.5 flex gap-3 items-start shadow-soft hover:shadow-card transition-shadow ${!n.read ? "border-[color:var(--brand-home)]/30" : ""}`}
                  style={!n.read ? { borderLeft: `3px solid ${m.color}` } : undefined}
                >
                  <span
                    className="size-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: m.soft }}
                  >
                    <Icon className="size-5" style={{ color: m.color }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: m.soft, color: m.color }}
                      >
                        {m.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="font-semibold text-sm mt-1">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>}
                  </div>
                  {!n.read && <span className="size-2 rounded-full bg-[color:var(--brand-events)] mt-2 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
