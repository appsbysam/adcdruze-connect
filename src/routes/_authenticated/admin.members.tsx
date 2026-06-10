import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles, type AppRole } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/members")({
  component: AdminMembers,
});

const ROLES: AppRole[] = ["member", "committee_member", "committee_leader", "admin"];

function AdminMembers() {
  const qc = useQueryClient();
  const { isAdmin } = useUserRoles();
  const [search, setSearch] = useState("");

  const { data: members = [] } = useQuery({
    queryKey: ["admin-members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("members").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: rolesByUser = {} } = useQuery({
    queryKey: ["admin-all-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("user_id, role, committee");
      const map: Record<string, { role: AppRole; committee: string | null }[]> = {};
      (data ?? []).forEach((r: any) => {
        if (!map[r.user_id]) map[r.user_id] = [];
        map[r.user_id].push({ role: r.role, committee: r.committee });
      });
      return map;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("members").update({ status: "approved" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member approved");
      qc.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });

  const filtered = members.filter((m: any) => {
    const q = search.toLowerCase();
    return !q || `${m.first_name} ${m.last_name} ${m.email}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Members</h2>
      </div>
      <Input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="space-y-2">
        {filtered.map((m: any) => {
          const userRoles = m.user_id ? rolesByUser[m.user_id] ?? [] : [];
          const isPending = m.status === "pending";
          return (
            <div key={m.id} className="rounded-xl border bg-card p-3 flex items-start gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                {m.first_name?.[0]}{m.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium leading-tight">{m.first_name} {m.last_name}</p>
                  {isPending && <span className="text-[10px] uppercase font-semibold bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">Pending</span>}
                  {userRoles.map((r, i) => (
                    <span key={i} className="text-[10px] font-medium bg-muted rounded-full px-2 py-0.5">
                      {r.role}{r.committee ? ` · ${r.committee}` : ""}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                <p className="text-xs text-muted-foreground">{m.suburb} · {m.occupation ?? "—"}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {isPending && isAdmin && (
                  <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(m.id)}>
                    <CheckCircle2 className="size-4" />
                  </Button>
                )}
                {isAdmin && <EditMemberDialog member={m} userRoles={userRoles} />}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No members found.</p>}
      </div>
    </div>
  );
}

function EditMemberDialog({ member, userRoles }: { member: any; userRoles: { role: AppRole; committee: string | null }[] }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    first_name: member.first_name,
    last_name: member.last_name,
    email: member.email,
    suburb: member.suburb ?? "",
    occupation: member.occupation ?? "",
    committee: member.committee ?? "",
    bio: member.bio ?? "",
  });
  const [newRole, setNewRole] = useState<AppRole>("member");
  const [newCommittee, setNewCommittee] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("members").update(form).eq("id", member.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member updated");
      qc.invalidateQueries({ queryKey: ["admin-members"] });
      setOpen(false);
    },
  });

  const addRole = useMutation({
    mutationFn: async () => {
      if (!member.user_id) throw new Error("Member has no linked account");
      const { error } = await supabase.from("user_roles").insert({
        user_id: member.user_id,
        role: newRole,
        committee: newRole === "committee_leader" || newRole === "committee_member" ? newCommittee || null : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role added");
      qc.invalidateQueries({ queryKey: ["admin-all-roles"] });
      setNewCommittee("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeRole = useMutation({
    mutationFn: async (r: { role: AppRole; committee: string | null }) => {
      let q = supabase.from("user_roles").delete().eq("user_id", member.user_id).eq("role", r.role);
      q = r.committee ? q.eq("committee", r.committee) : q.is("committee", null);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role removed");
      qc.invalidateQueries({ queryKey: ["admin-all-roles"] });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Pencil className="size-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit member</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>First name</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
            <div><Label>Last name</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
          </div>
          <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Suburb</Label><Input value={form.suburb} onChange={(e) => setForm({ ...form, suburb: e.target.value })} /></div>
          <div><Label>Occupation</Label><Input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} /></div>
          <div><Label>Committee</Label><Input value={form.committee} onChange={(e) => setForm({ ...form, committee: e.target.value })} /></div>

          <div className="border-t pt-3">
            <Label>Roles</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {userRoles.map((r, i) => (
                <button key={i} onClick={() => removeRole.mutate(r)} className="text-xs bg-muted rounded-full px-2 py-1 hover:bg-destructive hover:text-destructive-foreground">
                  {r.role}{r.committee ? ` · ${r.committee}` : ""} ×
                </button>
              ))}
              {userRoles.length === 0 && <span className="text-xs text-muted-foreground">No roles assigned</span>}
            </div>
            <div className="mt-3 flex gap-2 items-end">
              <div className="flex-1">
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {(newRole === "committee_leader" || newRole === "committee_member") && (
                <Input className="flex-1" placeholder="Committee name" value={newCommittee} onChange={(e) => setNewCommittee(e.target.value)} />
              )}
              <Button size="sm" onClick={() => addRole.mutate()}>Add</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
