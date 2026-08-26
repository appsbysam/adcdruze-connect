import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Phone, Mail, Globe, HeartHandshake, Gift, Settings, LogOut, Shield, FileText, ArrowRight, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { useUserRoles } from "@/hooks/use-user-role";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/more")({
  head: () => ({ meta: [{ title: "More — ADC" }] }),
  component: MorePage,
});

type Modal = "privacy" | "terms" | "account" | null;

function MorePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { canAccessAdmin, isAdmin } = useUserRoles();
  const { session } = useSession();
  const userId = session?.user.id;
  const [modal, setModal] = useState<Modal>(null);
  const [accountDraft, setAccountDraft] = useState({ first_name: "", last_name: "", mobile: "", suburb: "", occupation: "" });

  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*").eq("approved", true).order("business_name").limit(3);
      return data ?? [];
    },
  });

  const { data: member } = useQuery({
    queryKey: ["my-member", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from("members").select("*").eq("user_id", userId!).maybeSingle();
      return data;
    },
  });

  const saveAccount = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not signed in");
      const payload = {
        first_name: accountDraft.first_name.trim(),
        last_name: accountDraft.last_name.trim(),
        mobile: accountDraft.mobile.trim() || null,
        suburb: accountDraft.suburb.trim() || null,
        occupation: accountDraft.occupation.trim() || null,
      };
      if (!payload.first_name || !payload.last_name) throw new Error("First and last name are required");
      const { error } = await supabase.from("members").update(payload).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-member", userId] });
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("Account details updated");
      setModal(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openAccount() {
    setAccountDraft({
      first_name: member?.first_name ?? "",
      last_name: member?.last_name ?? "",
      mobile: member?.mobile ?? "",
      suburb: member?.suburb ?? "",
      occupation: member?.occupation ?? "",
    });
    setModal("account");
  }

  async function onSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const links = [
    { icon: HeartHandshake, label: "Volunteer with ADC", color: "var(--brand-home)", to: "/impact/volunteer" as const },
    { icon: Gift, label: "Donate", color: "#C9A227", to: "/impact/donate" as const },
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
          <Link to="/businesses" className="text-xs font-medium text-[color:var(--brand-home)] inline-flex items-center gap-1">View all <ArrowRight className="size-3" /></Link>
        </div>
        <div className="space-y-2.5">
          {businesses.map((b) => (
            <Link key={b.id} to="/businesses/$businessId" params={{ businessId: b.id }} className="block bg-card border rounded-2xl p-4 shadow-soft hover:shadow-card transition-shadow">
              <div className="flex gap-3 items-start">
                <span className="size-11 rounded-xl bg-[color:var(--brand-home-soft)] flex items-center justify-center shrink-0"><Briefcase className="size-5 text-[color:var(--brand-home)]" /></span>
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
          {canAccessAdmin && (
            <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 text-left">
              <span className="size-9 rounded-lg bg-primary/10 flex items-center justify-center"><ShieldCheck className="size-4 text-primary" /></span>
              <span className="text-sm font-medium flex-1">{isAdmin ? "Admin console" : "Committee tools"}</span><ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          )}
          {links.map((l) => { const Icon = l.icon; return (
            <Link key={l.label} to={l.to} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 text-left">
              <span className="size-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "color-mix(in oklab, " + l.color + " 12%, transparent)" }}><Icon className="size-4" style={{ color: l.color }} /></span>
              <span className="text-sm font-medium flex-1">{l.label}</span><ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          ); })}
          <button onClick={() => setModal("privacy")} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 text-left">
            <span className="size-9 rounded-lg bg-[color:var(--brand-groups-soft)] flex items-center justify-center"><Shield className="size-4 text-[color:var(--brand-groups)]" /></span><span className="text-sm font-medium flex-1">Privacy policy</span><ArrowRight className="size-4 text-muted-foreground" />
          </button>
          <button onClick={() => setModal("terms")} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 text-left">
            <span className="size-9 rounded-lg bg-[color:var(--brand-directory-soft)] flex items-center justify-center"><FileText className="size-4 text-[color:var(--brand-directory)]" /></span><span className="text-sm font-medium flex-1">Terms of use</span><ArrowRight className="size-4 text-muted-foreground" />
          </button>
          <button onClick={openAccount} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 text-left">
            <span className="size-9 rounded-lg bg-muted flex items-center justify-center"><Settings className="size-4 text-slate-500" /></span><span className="text-sm font-medium flex-1">Account settings</span><ArrowRight className="size-4 text-muted-foreground" />
          </button>
          <button onClick={onSignOut} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 text-left">
            <span className="size-9 rounded-lg bg-[color:var(--brand-events-soft)] flex items-center justify-center"><LogOut className="size-4 text-[color:var(--brand-events)]" /></span><span className="text-sm font-medium flex-1 text-[color:var(--brand-events)]">Sign out</span>
          </button>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground pt-2">Australian Druze Community</p>

      {modal && (
        <div className="fixed inset-0 z-[10000] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-md max-h-[82vh] overflow-y-auto bg-card rounded-3xl shadow-card p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div><p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Australian Druze Community</p><h2 className="text-xl font-bold">{modal === "privacy" ? "Privacy policy" : modal === "terms" ? "Terms of use" : "Account settings"}</h2></div>
              <button onClick={() => setModal(null)} className="size-9 rounded-full bg-muted flex items-center justify-center" aria-label="Close"><X className="size-4" /></button>
            </div>

            {modal === "privacy" && <div className="space-y-3 text-sm text-muted-foreground leading-relaxed"><p>Your profile and community information are used to provide the private member directory, groups, events, volunteering, donations and related community services.</p><p>Members should only see information made available through their authorised account. Administrative access is restricted by role and database security policies.</p><p>Contact details should not be copied, distributed or used for commercial purposes without the member's permission.</p><p>For a production launch, this policy should be reviewed and approved by the Australian Druze Community before being treated as the formal legal privacy policy.</p></div>}

            {modal === "terms" && <div className="space-y-3 text-sm text-muted-foreground leading-relaxed"><p>Druze Link is provided for legitimate Australian Druze Community activities and member communication.</p><p>Members must use respectful language, protect other members' privacy and avoid misleading, unlawful or unauthorised commercial content.</p><p>Event, business and directory information should be treated as community information and verified where important.</p><p>For a production launch, these terms should be reviewed and approved by the Australian Druze Community before being treated as the formal legal terms.</p></div>}

            {modal === "account" && <div className="space-y-3">
              {([['first_name','First name'],['last_name','Last name'],['mobile','Mobile'],['suburb','Suburb'],['occupation','Occupation']] as const).map(([key,label]) => (
                <label key={key} className="block"><span className="text-xs font-medium">{label}</span><input value={accountDraft[key]} onChange={(e) => setAccountDraft((p) => ({ ...p, [key]: e.target.value }))} className="mt-1 w-full px-3 py-2.5 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" /></label>
              ))}
              <button onClick={() => saveAccount.mutate()} disabled={saveAccount.isPending} className="w-full mt-2 py-3 rounded-xl bg-[color:var(--brand-home)] text-white font-semibold disabled:opacity-50">{saveAccount.isPending ? "Saving…" : "Save changes"}</button>
            </div>}
          </div>
        </div>
      )}
    </div>
  );
}
