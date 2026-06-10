import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Phone, Star, X, Briefcase } from "lucide-react";

export const Route = createFileRoute("/_authenticated/businesses")({
  head: () => ({ meta: [{ title: "Businesses — ADC" }] }),
  component: BusinessesPage,
});

function BusinessesPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("All");

  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*").order("business_name");
      return data ?? [];
    },
  });

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(businesses.map((b) => b.category).filter(Boolean) as string[])).sort()];
  }, [businesses]);

  const featured = businesses.filter((b) => b.featured);

  const filtered = businesses.filter((b) => {
    const s = `${b.business_name} ${b.category ?? ""} ${b.address ?? ""}`.toLowerCase();
    if (q && !s.includes(q.toLowerCase())) return false;
    if (category !== "All" && b.category !== category) return false;
    return true;
  });

  const hasFilter = category !== "All" || q;

  return (
    <div className="p-5 space-y-5">
      <header className="pt-2">
        <p className="text-xs uppercase tracking-wider text-[color:var(--brand-home)] font-semibold">Business Directory</p>
        <h1 className="text-2xl font-bold">Local businesses</h1>
        <p className="text-sm text-muted-foreground mt-1">Support community-owned businesses.</p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search businesses"
          className="w-full pl-10 pr-4 py-2.5 bg-card border rounded-xl text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-home)]/30"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-1.5 overflow-x-auto -mx-5 px-5 pb-1">
        {categories.map((cat) => {
          const active = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
              style={{
                backgroundColor: active ? "var(--brand-home)" : "var(--brand-home-soft)",
                color: active ? "white" : "var(--brand-home)",
                borderColor: active ? "var(--brand-home)" : "transparent",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Featured */}
      {!hasFilter && featured.length > 0 && (
        <section>
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="size-4 text-amber-500 fill-amber-500" />
            <h3 className="text-base font-semibold">Featured</h3>
          </div>
          <div className="space-y-2.5">
            {featured.map((b) => (
              <Link
                key={b.id}
                to="/businesses/$businessId"
                params={{ businessId: b.id }}
                className="bg-card border rounded-2xl p-4 flex gap-3 items-start shadow-soft hover:shadow-card transition-shadow"
              >
                <span className="size-12 rounded-xl bg-[color:var(--brand-home-soft)] flex items-center justify-center shrink-0">
                  <Briefcase className="size-6 text-[color:var(--brand-home)]" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm leading-tight">{b.business_name}</h3>
                    <Star className="size-3 text-amber-500 fill-amber-500" />
                  </div>
                  <p className="text-xs text-[color:var(--brand-home)] font-medium">{b.category}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.description}</p>
                  {b.address && (
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <MapPin className="size-3" /> {b.address}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All listings */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">
            {hasFilter ? "Results" : "All businesses"}
          </h3>
          {hasFilter && (
            <button
              onClick={() => { setQ(""); setCategory("All"); }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--brand-events)]"
            >
              <X className="size-3" /> Clear
            </button>
          )}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-10">No businesses match your search.</div>
        )}

        <div className="space-y-2.5">
          {filtered.map((b) => (
            <Link
              key={b.id}
              to="/businesses/$businessId"
              params={{ businessId: b.id }}
              className="bg-card border rounded-2xl p-4 flex gap-3 items-start shadow-soft hover:shadow-card transition-shadow"
            >
              <span className="size-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Briefcase className="size-5 text-muted-foreground" />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight">{b.business_name}</h3>
                <p className="text-xs text-[color:var(--brand-home)] font-medium">{b.category}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.description}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                  {b.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3" />{b.phone}
                    </span>
                  )}
                  {b.address && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" />{b.address}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
