import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UsersRound, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/groups")({
  head: () => ({ meta: [{ title: "Groups — ADC" }] }),
  component: GroupsPage,
});

function GroupsPage() {
  const { data: groups = [] } = useQuery({
    queryKey: ["groups", "all"],
    queryFn: async () => {
      const { data } = await supabase.from("groups").select("*").order("name");
      return data ?? [];
    },
  });

  return (
    <div className="p-5 space-y-5">
      <header className="pt-2">
        <p className="text-xs uppercase tracking-wider text-[color:var(--brand-groups)] font-semibold">Groups</p>
        <h1 className="text-2xl font-bold">Community groups</h1>
        <p className="text-sm text-muted-foreground mt-1">Committees and circles that keep our community moving.</p>
      </header>

      <div className="grid gap-3">
        {groups.map((g) => (
          <article key={g.id} className="bg-card border rounded-2xl p-4 shadow-soft flex items-center gap-4">
            <span className="size-12 rounded-2xl bg-[color:var(--brand-groups-soft)] flex items-center justify-center shrink-0">
              <UsersRound className="size-6 text-[color:var(--brand-groups)]" />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold">{g.name}</h2>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{g.description}</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
          </article>
        ))}
      </div>
    </div>
  );
}
