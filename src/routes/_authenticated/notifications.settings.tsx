import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, UsersRound, HeartHandshake, Briefcase, Megaphone, Gift, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notifications/settings")({ head: () => ({ meta: [{ title: "Notification settings — ADC" }] }), component: NotificationSettingsPage });

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
  const qc = useQueryClient();
  const { session } = useSession();
  const userId = session?.user.id;
  const { data: prefs = {}, isLoading } = useQuery({
    queryKey: ["notification-preferences", userId], enabled: !!userId,
    queryFn: async () => { const { data, error } = await supabase.from("notification_preferences").select("type, enabled").eq("user_id", userId!); if (error) throw error; return Object.fromEntries(items.map((i) => [i.key, data?.find((p) => p.type === i.key)?.enabled ?? true])); },
  });
  const save = useMutation({
    mutationFn: async ({ type, enabled }: { type: string; enabled: boolean }) => { if (!userId) throw new Error("Not signed in"); const { error } = await supabase.from("notification_preferences").upsert({ user_id: userId, type, enabled, updated_at: new Date().toISOString() }, { onConflict: "user_id,type" }); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-preferences", userId] }), onError: (e: Error) => toast.error(e.message),
  });

  return <div className="p-5 space-y-5">
    <header className="flex items-center gap-3 pt-2"><Link to="/notifications" className="size-9 rounded-full bg-white border border-border shadow-soft flex items-center justify-center"><ArrowLeft className="size-4" /></Link><div><h1 className="text-xl font-bold">Notification settings</h1><p className="text-xs text-muted-foreground">Choose what you'd like to be notified about</p></div></header>
    {isLoading ? <p className="text-sm text-muted-foreground text-center py-10">Loading settings…</p> : <ul className="space-y-2.5">{items.map((it) => { const Icon = it.icon; const on = prefs[it.key] ?? true; return <li key={it.key} className="bg-card border rounded-2xl p-3.5 flex items-center gap-3 shadow-soft"><span className="size-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: it.soft }}><Icon className="size-5" style={{ color: it.color }} /></span><div className="flex-1 min-w-0"><p className="font-semibold text-sm">{it.label}</p><p className="text-xs text-muted-foreground">{it.desc}</p></div><button onClick={() => save.mutate({ type: it.key, enabled: !on })} disabled={save.isPending} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-60 ${on ? "bg-[color:var(--brand-home)]" : "bg-muted"}`} aria-label={`Toggle ${it.label}`} aria-pressed={on}><span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} /></button></li>; })}</ul>}
  </div>;
}
