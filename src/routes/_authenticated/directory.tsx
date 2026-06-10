import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Briefcase, Users, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/directory")({
  head: () => ({ meta: [{ title: "Directory — ADC" }] }),
  component: DirectoryPage,
});

function DirectoryPage() {
  const [q, setQ] = useState("");
  const [suburb, setSuburb] = useState<string>("All");
  const [committee, setCommittee] = useState<string>("All");
  const [occupation, setOccupation] = useState<string>("All");

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data } = await supabase.from("members").select("*").order("first_name");
      return data ?? [];
    },
  });

  const { suburbs, committees, occupations } = useMemo(() => {
    const u = (vals: (string | null | undefined)[]) =>
      ["All", ...Array.from(new Set(vals.filter(Boolean) as string[])).sort()];
    return {
      suburbs: u(members.map((m) => m.suburb)),
      committees: u(members.map((m) => m.committee)),
      occupations: u(members.map((m) => m.occupation)),
    };
  }, [members]);

  const filtered = members.filter((m) => {
    const s = `${m.first_name} ${m.last_name} ${m.suburb ?? ""} ${m.occupation ?? ""} ${m.committee ?? ""}`.toLowerCase();
    if (q && !s.includes(q.toLowerCase())) return false;
    if (suburb !== "All" && m.suburb !== suburb) return false;
    if (committee !== "All" && m.committee !== committee) return false;
    if (occupation !== "All" && m.occupation !== occupation) return false;
    return true;
  });

  const hasFilter = suburb !== "All" || committee !== "All" || occupation !== "All" || q;

  return (
    <div className="p-5 space-y-5">
      <header className="pt-2">
        <p className="text-xs uppercase tracking-wider text-[color:var(--brand-directory)] font-semibold">Directory</p>
        <h1 className="text-2xl font-bold">Member directory</h1>
        <p className="text-sm text-muted-foreground mt-1">Find and connect with families in the community.</p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, suburb or role"
          className="w-full pl-10 pr-4 py-2.5 bg-card border rounded-xl text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-directory)]/30"
        />
      </div>

      {/* Filter chips */}
      <div className="space-y-2">
        <FilterRow icon={MapPin} label="Suburb" color="var(--brand-directory)" soft="var(--brand-directory-soft)" options={suburbs} value={suburb} onChange={setSuburb} />
        <FilterRow icon={Users} label="Committee" color="var(--brand-groups)" soft="var(--brand-groups-soft)" options={committees} value={committee} onChange={setCommittee} />
        <FilterRow icon={Briefcase} label="Occupation" color="var(--brand-home)" soft="var(--brand-home-soft)" options={occupations} value={occupation} onChange={setOccupation} />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} {filtered.length === 1 ? "member" : "members"}</span>
        {hasFilter && (
          <button
            onClick={() => { setQ(""); setSuburb("All"); setCommittee("All"); setOccupation("All"); }}
            className="inline-flex items-center gap-1 font-semibold text-[color:var(--brand-events)]"
          >
            <X className="size-3" /> Clear
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-10">No members match your filters.</div>
      )}

      <div className="space-y-2.5">
        {filtered.map((m) => (
          <Link
            key={m.id}
            to="/directory/$memberId"
            params={{ memberId: m.id }}
            className="bg-card border rounded-2xl p-3.5 flex items-center gap-3 shadow-soft hover:shadow-card transition-shadow"
          >
            <span className="size-12 rounded-full bg-[color:var(--brand-directory-soft)] flex items-center justify-center text-[color:var(--brand-directory)] font-bold shrink-0">
              {m.first_name?.[0]}{m.last_name?.[0]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{m.first_name} {m.last_name}</p>
              {m.occupation && <p className="text-xs text-muted-foreground truncate">{m.occupation}</p>}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {m.suburb && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[color:var(--brand-directory-soft)] text-[color:var(--brand-directory)]">
                    <MapPin className="size-2.5" />{m.suburb}
                  </span>
                )}
                {m.committee && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[color:var(--brand-groups-soft)] text-[color:var(--brand-groups)]">
                    <Users className="size-2.5" />{m.committee}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FilterRow({
  icon: Icon, label, color, soft, options, value, onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  soft: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
        <Icon className="size-3" /> {label}
      </p>
      <div className="flex gap-1.5 overflow-x-auto -mx-5 px-5 pb-1">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
              style={{
                backgroundColor: active ? color : soft,
                color: active ? "white" : color,
                borderColor: active ? color : "transparent",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
