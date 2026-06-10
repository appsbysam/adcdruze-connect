import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/directory")({
  head: () => ({ meta: [{ title: "Directory — ADC" }] }),
  component: DirectoryPage,
});

function DirectoryPage() {
  const [q, setQ] = useState("");
  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data } = await supabase.from("members").select("*").order("first_name");
      return data ?? [];
    },
  });

  const filtered = members.filter((m) => {
    const s = `${m.first_name} ${m.last_name} ${m.suburb ?? ""}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <div className="p-5 space-y-5">
      <header className="pt-2">
        <p className="text-xs uppercase tracking-wider text-[color:var(--brand-directory)] font-semibold">Directory</p>
        <h1 className="text-2xl font-bold">Member directory</h1>
        <p className="text-sm text-muted-foreground mt-1">Find and connect with families in the community.</p>
      </header>

      <div className="relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or suburb" className="pl-9 bg-card" />
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-10">No members found.</div>
      )}

      <div className="space-y-2.5">
        {filtered.map((m) => (
          <div key={m.id} className="bg-card border rounded-2xl p-3.5 flex items-center gap-3 shadow-soft">
            <span className="size-11 rounded-full bg-[color:var(--brand-directory-soft)] flex items-center justify-center text-[color:var(--brand-directory)] font-semibold">
              {m.first_name?.[0]}{m.last_name?.[0]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{m.first_name} {m.last_name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-3">
                {m.suburb && <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{m.suburb}</span>}
                {m.email && <span className="inline-flex items-center gap-1 truncate"><Mail className="size-3" />{m.email}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
