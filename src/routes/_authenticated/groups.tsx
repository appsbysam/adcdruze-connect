import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { UsersRound, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/groups")({
  head: () => ({ meta: [{ title: "Groups — ADC" }] }),
  component: GroupsPage,
});

function GroupsPage() {
  const { session } = useSession();
  const userId = session?.user.id;

  const { data: groups = [] } = useQuery({
    queryKey: ["groups", "all"],
    queryFn: async () => {
      const { data } = await supabase.from("groups").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ["group-memberships-all"],
    queryFn: async () => {
      const { data } = await supabase.from("group_members").select("group_id, user_id");
      return data ?? [];
    },
  });

  const counts = memberships.reduce<Record<string, number>>((acc, m) => {
    acc[m.group_id] = (acc[m.group_id] ?? 0) + 1;
    return acc;
  }, {});
  const joined = new Set(memberships.filter((m) => m.user_id === userId).map((m) => m.group_id));

  return (
    <div className="p-5 space-y-5">
      <header className="pt-2">
        <p className="text-xs uppercase tracking-wider text-[color:var(--brand-groups)] font-semibold">Groups</p>
        <h1 className="text-2xl font-bold">Community groups</h1>
        <p className="text-sm text-muted-foreground mt-1">Committees and circles that keep our community moving.</p>
      </header>

      <div className="grid gap-3">
        {groups.map((g) => {
          const isJoined = joined.has(g.id);
          return (
            <Link
              key={g.id}
              to="/groups/$groupId"
              params={{ groupId: g.id }}
              className="bg-card border rounded-2xl p-4 shadow-soft hover:shadow-card transition-shadow flex items-center gap-4"
            >
              <span className="size-12 rounded-2xl bg-[color:var(--brand-groups-soft)] flex items-center justify-center shrink-0">
                <UsersRound className="size-6 text-[color:var(--brand-groups)]" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold truncate">{g.name}</h2>
                  {isJoined && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[color:var(--brand-home-soft)] text-[color:var(--brand-home)]">
                      <Check className="size-2.5" /> Joined
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{g.description}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{counts[g.id] ?? 0} members</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
