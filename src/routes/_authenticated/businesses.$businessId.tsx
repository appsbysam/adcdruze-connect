import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Mail, Phone, Globe, Briefcase, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/businesses/$businessId")({
  head: () => ({ meta: [{ title: "Business — ADC" }] }),
  errorComponent: ({ error }) => (
    <div className="p-8 text-center">
      <p className="text-sm text-destructive">{error.message}</p>
      <Link to="/businesses" className="text-sm text-[color:var(--brand-home)] font-semibold mt-3 inline-block">Back to directory</Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p className="text-sm text-muted-foreground">Business not found.</p>
      <Link to="/businesses" className="text-sm text-[color:var(--brand-home)] font-semibold mt-3 inline-block">Back to directory</Link>
    </div>
  ),
  component: BusinessProfilePage,
});

function BusinessProfilePage() {
  const { businessId } = Route.useParams();
  const router = useRouter();

  const { data: business, isLoading } = useQuery({
    queryKey: ["business", businessId],
    queryFn: async () => {
      const { data, error } = await supabase.from("businesses").select("*").eq("id", businessId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!business) return <div className="p-8 text-center text-sm text-muted-foreground">Business not found.</div>;

  return (
    <div className="pb-10">
      {/* Header band */}
      <div className="relative bg-gradient-to-br from-[color:var(--brand-home)] to-[#059669] h-40">
        <button
          onClick={() => router.history.back()}
          className="absolute top-4 left-4 size-10 rounded-full bg-white/95 flex items-center justify-center shadow-card"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        {business.featured && (
          <div className="absolute top-4 right-4 inline-flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full shadow-card text-xs font-semibold text-amber-600">
            <Star className="size-3 fill-amber-500 text-amber-500" /> Featured
          </div>
        )}
      </div>

      <div className="px-5 -mt-12 space-y-5">
        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center">
          <span className="size-24 rounded-full bg-card border-4 border-card shadow-card flex items-center justify-center text-3xl font-bold text-[color:var(--brand-home)]">
            <Briefcase className="size-10" />
          </span>
          <h1 className="mt-3 text-2xl font-bold">{business.business_name}</h1>
          {business.category && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <Briefcase className="size-3.5" /> {business.category}
            </p>
          )}
          {business.address && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="size-3" /> {business.address}
            </p>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          {business.phone && (
            <a href={`tel:${business.phone}`} className="flex flex-col items-center gap-1 bg-card border rounded-2xl py-3 shadow-soft active:scale-95 transition-transform">
              <Phone className="size-5 text-[color:var(--brand-home)]" />
              <span className="text-xs font-semibold">Call</span>
            </a>
          )}
          {business.email && (
            <a href={`mailto:${business.email}`} className="flex flex-col items-center gap-1 bg-card border rounded-2xl py-3 shadow-soft active:scale-95 transition-transform">
              <Mail className="size-5 text-[color:var(--brand-events)]" />
              <span className="text-xs font-semibold">Email</span>
            </a>
          )}
          {business.website && (
            <a href={business.website} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 bg-card border rounded-2xl py-3 shadow-soft active:scale-95 transition-transform">
              <Globe className="size-5 text-[color:var(--brand-groups)]" />
              <span className="text-xs font-semibold">Website</span>
            </a>
          )}
        </div>

        {/* Description */}
        {business.description && (
          <section className="bg-card border rounded-2xl p-4 shadow-soft">
            <h2 className="text-sm font-semibold mb-1.5">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{business.description}</p>
          </section>
        )}

        {/* Details */}
        <section className="bg-card border rounded-2xl divide-y shadow-soft">
          {business.phone && <DetailRow icon={Phone} label="Phone" value={business.phone} href={`tel:${business.phone}`} />}
          {business.email && <DetailRow icon={Mail} label="Email" value={business.email} href={`mailto:${business.email}`} />}
          {business.website && <DetailRow icon={Globe} label="Website" value={business.website.replace(/^https?:\/\//, "")} href={business.website} />}
          {business.address && <DetailRow icon={MapPin} label="Address" value={business.address} />}
          {business.category && <DetailRow icon={Briefcase} label="Category" value={business.category} />}
        </section>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="p-4 flex items-center gap-3">
      <span className="size-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
        {inner}
      </a>
    );
  }
  return inner;
}
