import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/use-user-role";
import { Users, Calendar, UsersRound, Briefcase, HeartHandshake, Megaphone, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { isAdmin, leaderCommittees } = useUserRoles();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [m, e, g, b, v, a] = await Promise.all([
        supabase.from("members").select("id, status", { count: "exact", head: false }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("groups").select("id", { count: "exact", head: true }),
        supabase.from("businesses").select("id, approved", { count: "exact", head: false }),
        supabase.from("volunteer_opportunities").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
      ]);
      const pendingMembers = (m.data ?? []).filter((x: any) => x.status === "pending").length;
      const pendingBusinesses = (b.data ?? []).filter((x: any) => !x.approved).length;
      return {
        members: m.count ?? 0,
        events: e.count ?? 0,
        groups: g.count ?? 0,
        businesses: b.count ?? 0,
        volunteer: v.count ?? 0,
        announcements: a.count ?? 0,
        pendingMembers,
        pendingBusinesses,
      };
    },
  });

  type Card = { to: string; label: string; icon: typeof Users; count?: number; badge?: string; adminOnly?: boolean };
  const cards: Card[] = [
    { to: "/admin/members", label: "Members", icon: Users, count: stats?.members, badge: stats?.pendingMembers ? `${stats.pendingMembers} pending` : undefined, adminOnly: true },
    { to: "/admin/events", label: "Events", icon: Calendar, count: stats?.events },
    { to: "/admin/groups", label: "Groups", icon: UsersRound, count: stats?.groups },
    { to: "/admin/businesses", label: "Businesses", icon: Briefcase, count: stats?.businesses, badge: stats?.pendingBusinesses ? `${stats.pendingBusinesses} pending` : undefined, adminOnly: true },
    { to: "/admin/volunteer", label: "Volunteer Opportunities", icon: HeartHandshake, count: stats?.volunteer },
    { to: "/admin/announcements", label: "Announcements", icon: Megaphone, count: stats?.announcements, adminOnly: true },
  ];

  return (
    <div className="space-y-5">
      {!isAdmin && (
        <div className="rounded-xl border bg-muted/40 p-4 text-sm">
          You are a committee leader for: <strong>{leaderCommittees.join(", ")}</strong>. You can manage events,
          opportunities and posts for your committee.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {cards.filter((c) => isAdmin || !("adminOnly" in c && c.adminOnly)).map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.to}
              to={c.to}
              className="rounded-2xl border bg-card p-4 hover:shadow-card transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="size-4 text-primary" />
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-xl font-semibold">{c.count ?? "—"}</p>
              {c.badge && (
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-semibold bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
                  {c.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
