import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/volunteer")({
  component: AdminVolunteer,
});

function AdminVolunteer() {
  const qc = useQueryClient();
  const { isAdmin, leaderCommittees } = useUserRoles();

  const { data: opportunities = [] } = useQuery({
    queryKey: ["admin-vol-opps"],
    queryFn: async () => {
      const { data, error } = await supabase.from("volunteer_opportunities").select("*").order("date", { ascending: false });
      if (error) throw error;
      return isAdmin ? data : (data ?? []).filter((o: any) => leaderCommittees.includes(o.committee));
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("volunteer_opportunities").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-vol-opps"] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Volunteer Opportunities</h2>
        <OpportunityDialog />
      </div>
      <div className="space-y-2">
        {opportunities.map((o: any) => (
          <div key={o.id} className="rounded-xl border bg-card p-3 flex gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-tight">{o.event_name}</p>
              <p className="text-xs text-muted-foreground">{o.date} {o.start_time} · {o.location}</p>
              <p className="text-[11px] text-muted-foreground">{o.committee} · {o.volunteers_required} volunteers needed</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <RegistrationsDialog opportunityId={o.id} title={o.event_name} />
              <OpportunityDialog initial={o} />
              <Button size="sm" variant="outline" onClick={() => del.mutate(o.id)}><Trash2 className="size-4" /></Button>
            </div>
          </div>
        ))}
        {opportunities.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No opportunities.</p>}
      </div>
    </div>
  );
}

function OpportunityDialog({ initial }: { initial?: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    event_name: initial?.event_name ?? "",
    description: initial?.description ?? "",
    date: initial?.date ?? "",
    start_time: initial?.start_time ?? "",
    end_time: initial?.end_time ?? "",
    location: initial?.location ?? "",
    committee: initial?.committee ?? "",
    volunteers_required: initial?.volunteers_required ?? 1,
    hours_estimate: initial?.hours_estimate ?? 1,
    requirements: initial?.requirements ?? "",
    time_commitment: initial?.time_commitment ?? "",
    organiser_name: initial?.organiser_name ?? "",
    organiser_phone: initial?.organiser_phone ?? "",
    organiser_email: initial?.organiser_email ?? "",
  });

  const save = useMutation({
    mutationFn: async () => {
      const res = initial
        ? await supabase.from("volunteer_opportunities").update(form).eq("id", initial.id)
        : await supabase.from("volunteer_opportunities").insert(form);
      if (res.error) throw res.error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-vol-opps"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {initial ? <Button size="sm" variant="outline"><Pencil className="size-4" /></Button>
          : <Button size="sm"><Plus className="size-4" /> New</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? "Edit opportunity" : "New opportunity"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Event name</Label><Input value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>Start</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
            <div><Label>End</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
          </div>
          <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><Label>Committee</Label><Input value={form.committee} onChange={(e) => setForm({ ...form, committee: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label># Volunteers</Label><Input type="number" value={form.volunteers_required} onChange={(e) => setForm({ ...form, volunteers_required: +e.target.value })} /></div>
            <div><Label>Hours</Label><Input type="number" step="0.5" value={form.hours_estimate} onChange={(e) => setForm({ ...form, hours_estimate: +e.target.value })} /></div>
          </div>
          <div><Label>Requirements</Label><Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></div>
          <div><Label>Time commitment</Label><Input value={form.time_commitment} onChange={(e) => setForm({ ...form, time_commitment: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Organiser</Label><Input value={form.organiser_name} onChange={(e) => setForm({ ...form, organiser_name: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.organiser_phone} onChange={(e) => setForm({ ...form, organiser_phone: e.target.value })} /></div>
          </div>
          <div><Label>Organiser email</Label><Input value={form.organiser_email} onChange={(e) => setForm({ ...form, organiser_email: e.target.value })} /></div>
        </div>
        <DialogFooter><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RegistrationsDialog({ opportunityId, title }: { opportunityId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const { data: regs = [] } = useQuery({
    queryKey: ["admin-vol-regs", opportunityId],
    enabled: open,
    queryFn: async () => {
      const { data } = await supabase.from("volunteer_registrations").select("*").eq("opportunity_id", opportunityId);
      if (!data?.length) return [];
      const userIds = data.map((r: any) => r.user_id);
      const { data: ms } = await supabase.from("members").select("user_id, first_name, last_name, email").in("user_id", userIds);
      const byId = Object.fromEntries((ms ?? []).map((m: any) => [m.user_id, m]));
      return data.map((r: any) => ({ ...r, member: byId[r.user_id] }));
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Users className="size-4" /></Button></DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Registrations · {title}</DialogTitle></DialogHeader>
        <div className="space-y-1.5">
          {regs.map((r: any) => (
            <div key={r.id} className="border rounded-lg p-2 text-sm">
              <p className="font-medium">{r.member ? `${r.member.first_name} ${r.member.last_name}` : r.user_id}</p>
              <p className="text-xs text-muted-foreground">{r.member?.email}</p>
            </div>
          ))}
          {regs.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No registrations yet.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
