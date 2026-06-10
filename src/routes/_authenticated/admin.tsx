import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUserRoles } from "@/hooks/use-user-role";
import { Shield, ArrowLeft, Users, Calendar, UsersRound, Briefcase, HeartHandshake, Megaphone, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — ADC" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, adminOnly: true },
  { to: "/admin/members", label: "Members", icon: Users, adminOnly: true },
  { to: "/admin/events", label: "Events", icon: Calendar, adminOnly: false },
  { to: "/admin/groups", label: "Groups", icon: UsersRound, adminOnly: false },
  { to: "/admin/businesses", label: "Businesses", icon: Briefcase, adminOnly: true },
  { to: "/admin/volunteer", label: "Volunteer", icon: HeartHandshake, adminOnly: false },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone, adminOnly: true },
] as const;

function AdminLayout() {
  const { canAccessAdmin, isAdmin, loading } = useUserRoles();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !canAccessAdmin) {
      toast.error("You don't have access to the admin area");
      navigate({ to: "/", replace: true });
    }
  }, [loading, canAccessAdmin, navigate]);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading admin…</div>;
  }
  if (!canAccessAdmin) return null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/" className="size-9 rounded-lg border flex items-center justify-center hover:bg-muted">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Admin Console</p>
            <h1 className="text-base font-semibold leading-tight flex items-center gap-1.5">
              <Shield className="size-4 text-primary" /> {isAdmin ? "Administrator" : "Committee Leader"}
            </h1>
          </div>
        </div>
        <nav className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {NAV.filter((n) => isAdmin || !n.adminOnly).map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                  active ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
                }`}
              >
                <Icon className="size-3.5" /> {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="p-4 pb-10">
        <Outlet />
      </main>
    </div>
  );
}
