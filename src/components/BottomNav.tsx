import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Calendar, Users, UsersRound, MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = {
  to: "/home" | "/events" | "/directory" | "/groups" | "/more";
  label: string;
  icon: LucideIcon;
  color: string;
  soft: string;
};

const items: Item[] = [
  { to: "/home", label: "Home", icon: Home, color: "var(--brand-home)", soft: "var(--brand-home-soft)" },
  { to: "/events", label: "Events", icon: Calendar, color: "var(--brand-events)", soft: "var(--brand-events-soft)" },
  { to: "/directory", label: "Directory", icon: Users, color: "var(--brand-directory)", soft: "var(--brand-directory-soft)" },
  { to: "/groups", label: "Groups", icon: UsersRound, color: "var(--brand-groups)", soft: "var(--brand-groups-soft)" },
  { to: "/more", label: "More", icon: MoreHorizontal, color: "#111111", soft: "#ffffff" },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto grid grid-cols-5">
        {items.map((it) => {
          const active = pathname === it.to || (it.to !== "/home" && pathname.startsWith(it.to));
          const Icon = it.icon;
          const isMore = it.to === "/more";
          return (
            <Link
              key={it.to}
              to={it.to}
              className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs"
            >
              <span
                className="flex items-center justify-center size-10 rounded-full transition-colors"
                style={{
                  backgroundColor: active ? it.soft : "transparent",
                  border: isMore ? "1.5px solid #111111" : "none",
                }}
              >
                <Icon
                  className="size-5"
                  style={{ color: active || isMore ? it.color : "#6B7280" }}
                  strokeWidth={active ? 2.4 : 2}
                />
              </span>
              <span
                className="font-medium"
                style={{ color: active ? it.color : "#6B7280" }}
              >
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
