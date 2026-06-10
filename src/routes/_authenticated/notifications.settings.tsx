import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Calendar, UsersRound, HeartHandshake, Briefcase, Megaphone, Gift, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications/settings")({
  head: () => ({ meta: [{ title: "Notification settings — ADC" }] }),
  component: NotificationSettingsPage,
});

const items: { key: string; label: string; desc: string; icon: LucideIcon; color: string; soft: string }[] = [
  { key: "event", label: "Event reminders", desc: "Upcoming events and RSVPs", icon: Calendar, color: "var(--brand-events)", soft: "var(--brand-events-soft)" },
  { key: "committee", label: "Committee & group posts", desc: "New posts in your groups", icon: UsersRound, color: "var(--brand-groups)", soft: "var(--brand-groups-soft)" },
  { key: "volunteer", label: "Volunteer opportunities", desc: "New opportunities to help", icon: HeartHandshake, color: "var(--brand-home)", soft: "var(--brand-home-soft)" },
  { key: "donation", label: "Donation confirmations", desc: "Receipts and updates", icon: Gift, color: "#C9A227", soft: "#FBF3D8" },
  { key: "business", label: "New business listings", desc: "New community businesses", icon: Briefcase, color: "#0E8A4A", soft: "var(--brand-home-soft)" },
  { key: "announcement", label: "Community announcements", desc: "Important updates", icon: Megaphone, color: "var(--brand-home)", soft: "var(--brand-home-soft)" },
  { key: "welcome", label: "New member welcomes", desc: "Welcome new members", icon: UserPlus, color: "var(--brand-directory)", soft: "var(--brand-directory-soft)" },
];

function NotificationSettingsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((i) => [i.key, true])),
  );

  return (
    <div className="p-5 space-y-5">
      <header className="flex items-center gap-3 pt-2">
        <Link to="/notifications" className="size-9 rounded-full bg-white border border-border shadow-soft flex items-center justify-center">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Notification settings</h1>
          <p className="text-xs text-muted-foreground">Choose what you'd like to be notified about</p>
        </div>
      </header>

      <ul className="space-y-2.5">
        {items.map((it) => {
          const Icon = it.icon;
          const on = enabled[it.key];
          return (
            <li key={it.key} className="bg-card border rounded-2xl p-3.5 flex items-center gap-3 shadow-soft">
              <span className="size-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: it.soft }}>
                <Icon className="size-5" style={{ color: it.color }} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{it.label}</p>
                <p className="text-xs text-muted-foreground">{it.desc}</p>
              </div>
              <button
                onClick={() => setEnabled((p) => ({ ...p, [it.key]: !p[it.key] }))}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-[color:var(--brand-home)]" : "bg-muted"}`}
                aria-label={`Toggle ${it.label}`}
              >
                <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
