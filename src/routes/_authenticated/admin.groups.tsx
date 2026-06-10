import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UserCog } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/groups")({
  component: AdminGroups,
});

function AdminGroups() {
  const qc = useQueryClient();
  const { isAdmin, leaderCommittees } = useUserRoles();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const { data: groups = [] } = useQuery({
    queryKey: ["admin-groups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const visibleGroups = isAdmin ? groups : groups.filter((g: any) => g.committee && leaderCommittees.includes(g.committee));

  const { data: members = [] } = useQuery({
    queryKey: ["admin-members-mini"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase.from("members").select("user_id, first_name, last_name").not("user_id", "is", null);
      return data ?? [];
    },
  });

  const assignLeader = useMutation({
    mutationFn: async ({ id, leader_user_id, committee }: { id: string; leader_user_id: string | null; committee: string | null }) => {
      const { error } = await supabase.from("groups").update({ leader_user_id, committee }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-groups"] }); },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Groups</h2>
      <div className="space-y-2">
        {visibleGroups.map((g: any) => (
          <div key={g.id} className="rounded-xl border bg-card p-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{g.name}</p>
                <p className="text-xs text-muted-foreground">{g.description}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Committee: {g.committee ?? "—"} · Leader: {g.leader_user_id ? (members.find((m: any) => m.user_id === g.leader_user_id) ? `${members.find((m: any) => m.user_id === g.leader_user_id)?.first_name} ${members.find((m: any) => m.user_id === g.leader_user_id)?.last_name}` : "Assigned") : "None"}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button size="sm" variant="outline" onClick={() => setSelectedGroupId(selectedGroupId === g.id ? null : g.id)}>
                  <Pencil className="size-4" />
                </Button>
                {isAdmin && <AssignLeaderDialog group={g} members={members} onSave={(data) => assignLeader.mutate({ id: g.id, ...data })} />}
              </div>
            </div>
            {selectedGroupId === g.id && <GroupPostsPanel groupId={g.id} />}
          </div>
        ))}
        {visibleGroups.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No groups.</p>}
      </div>
    </div>
  );
}

function AssignLeaderDialog({ group, members, onSave }: { group: any; members: any[]; onSave: (d: { leader_user_id: string | null; committee: string | null }) => void }) {
  const [open, setOpen] = useState(false);
  const [leader, setLeader] = useState<string>(group.leader_user_id ?? "none");
  const [committee, setCommittee] = useState<string>(group.committee ?? "");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><UserCog className="size-4" /></Button></DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Assign committee leader</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Committee key</Label>
            <Input value={committee} onChange={(e) => setCommittee(e.target.value)} placeholder="e.g. Youth" />
            <p className="text-[11px] text-muted-foreground mt-1">Must match the committee assigned in the leader's role.</p>
          </div>
          <div>
            <Label>Leader</Label>
            <Select value={leader} onValueChange={setLeader}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No leader</SelectItem>
                {members.map((m: any) => (
                  <SelectItem key={m.user_id} value={m.user_id}>{m.first_name} {m.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => { onSave({ leader_user_id: leader === "none" ? null : leader, committee: committee || null }); setOpen(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GroupPostsPanel({ groupId }: { groupId: string }) {
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const { data: posts = [] } = useQuery({
    queryKey: ["admin-group-posts", groupId],
    queryFn: async () => {
      const { data } = await supabase.from("group_posts").select("*").eq("group_id", groupId).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("group_posts").insert({ group_id: groupId, content, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Posted"); setContent(""); qc.invalidateQueries({ queryKey: ["admin-group-posts", groupId] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("group_posts").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-group-posts", groupId] }),
  });

  return (
    <div className="mt-3 pt-3 border-t space-y-2">
      <div className="flex gap-2">
        <Textarea rows={2} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a post…" />
        <Button onClick={() => create.mutate()} disabled={!content || create.isPending}><Plus className="size-4" /></Button>
      </div>
      {posts.map((p: any) => (
        <div key={p.id} className="text-sm rounded-lg border p-2 flex gap-2">
          <p className="flex-1">{p.content}</p>
          <button onClick={() => del.mutate(p.id)} className="text-destructive"><Trash2 className="size-4" /></button>
        </div>
      ))}
    </div>
  );
}
