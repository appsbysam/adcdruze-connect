import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./use-session";

export type AppRole = "member" | "committee_member" | "committee_leader" | "admin";

export interface UserRoleRow {
  role: AppRole;
  committee: string | null;
}

export function useUserRoles() {
  const { user, loading } = useSession();
  const query = useQuery({
    queryKey: ["user-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<UserRoleRow[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, committee")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []) as UserRoleRow[];
    },
  });

  const roles = query.data ?? [];
  const isAdmin = roles.some((r) => r.role === "admin");
  const leaderCommittees = roles
    .filter((r) => r.role === "committee_leader" && r.committee)
    .map((r) => r.committee as string);
  const isCommitteeLeader = leaderCommittees.length > 0;
  const canAccessAdmin = isAdmin || isCommitteeLeader;

  return {
    roles,
    isAdmin,
    isCommitteeLeader,
    leaderCommittees,
    canAccessAdmin,
    loading: loading || query.isLoading,
  };
}
