import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Phone, Mail, Globe, HeartHandshake, Gift, Settings, LogOut, Shield, FileText, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/more")({
  head: () => ({ meta: [{ title: "More — ADC" }] }),
  component: MorePage,
});

function MorePage() {
  const navigate = useNavigate();
  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*").order("business_name").limit(3);
      return data ?? [];
    },
  });

  async function onSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const links: Array<{ icon: typeof HeartHandshake; label: string; color: string; to?: "/impact/volunteer" | "/impact/donate" }> = [
    { icon: HeartHandshake, label: "Volunteer with ADC", color: "var(--brand-home)", to: "/impact/volunteer" },
    { icon: Gift, label: "Donate", color: "#C9A227", to: "/impact/donate" },
    { icon: Shield, label: "Privacy policy", color: "var(--brand-groups)" },
    { icon: FileText, label: "Terms of use", color: "var(--brand-directory)" },
    { icon: Settings, label: "Account settings", color: "#64748B" },
  ];

  return (
    <div className="p-5 space-y-6">
      <header className="pt-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">More</p>
        <h1 className="text-2xl font-bold">Businesses & more</h1>
      </header>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Local businesses</h2>
          <Link to="/businesses" className="text-xs font-medium text-[color:var(--brand-home)] inline-flex items-center gap-1">
            View all <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="space-y-2.5">
          {businesses.map((b) => (
            <Link
              key={b.id}
              to="/businesses/$businessId"
              params={{ businessId: b.id }}
              className="block bg-card border rounded-2xl p-4 shadow-soft hover:shadow-card transition-shadow"
            >
              <div className="flex gap-3 items-start">
                <span className="size-11 rounded-xl bg-[color:var(--brand-home-soft)] flex items-center justify-center shrink-0">
                  <Briefcase className="size-5 text-[color:var(--brand-home)]" />
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-tight">{b.business_name}</h3>
                  <p className="text-xs text-[color:var(--brand-home)] font-medium">{b.category}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.description}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                    {b.phone && <span className="inline-flex items-center gap-1"><Phone className="size-3" />{b.phone}</span>}
                    {b.email && <span className="inline-flex items-center gap-1"><Mail className="size-3" />{b.email}</span>}
                    {b.website && <span className="inline-flex items-center gap-1"><Globe className="size-3" />Website</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3">Community</h2>
        <div className="bg-card border rounded-2xl shadow-soft divide-y divide-border overflow-hidden">
          {links.map((l) => {
            const Icon = l.icon;
            const content = (
              <>
                <span className="size-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "color-mix(in oklab, " + l.color + " 12%, transparent)" }}>
                  <Icon className="size-4" style={{ color: l.color }} />
                </span>
                <span className="text-sm font-medium flex-1">{l.label}</span>
              </>
            );
            return l.to ? (
              <Link key={l.label} to={l.to} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 text-left">
                {content}
              </Link>
            ) : (
              <button key={l.label} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 text-left">
                {content}
              </button>
            );
          })}
          <button onClick={onSignOut} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 text-left">
            <span className="size-9 rounded-lg bg-[color:var(--brand-events-soft)] flex items-center justify-center">
              <LogOut className="size-4 text-[color:var(--brand-events)]" />
            </span>
            <span className="text-sm font-medium flex-1 text-[color:var(--brand-events)]">Sign out</span>
          </button>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground pt-2">Australian Druze Community · v1.0</p>
    </div>
  );
}
