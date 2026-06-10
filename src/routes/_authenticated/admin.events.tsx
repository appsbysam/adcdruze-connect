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
import { Plus, Pencil, Users, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/events")({
  component: AdminEvents,
});

type EventForm = {
  title: string; description: string; date: string; location: string;
  image: string; capacity: number | null; category: string; organiser: string;
};

const empty: EventForm = { title: "", description: "", date: "", location: "", image: "", capacity: null, category: "", organiser: "" };

function AdminEvents() {
  const qc = useQueryClient();
  const { isAdmin, leaderCommittees } = useUserRoles();

  const { data: events = [] } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false });
      if (error) throw error;
      return isAdmin ? data : (data ?? []).filter((e: any) => leaderCommittees.includes(e.category));
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("events").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Event deleted"); qc.invalidateQueries({ queryKey: ["admin-events"] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Events</h2>
        <EventDialog />
      </div>
      <div className="space-y-2">
        {events.map((e: any) => (
          <div key={e.id} className="rounded-xl border bg-card p-3 flex gap-3">
            {e.image ? <img src={e.image} alt="" className="size-14 rounded-lg object-cover" /> : <div className="size-14 rounded-lg bg-muted" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-tight">{e.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleString()} · {e.location}</p>
              <p className="text-xs text-muted-foreground">{e.category}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <RsvpsDialog eventId={e.id} title={e.title} />
              <EventDialog initial={e} />
              {isAdmin && <Button size="sm" variant="outline" onClick={() => del.mutate(e.id)}><Trash2 className="size-4" /></Button>}
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No events.</p>}
      </div>
    </div>
  );
}

function EventDialog({ initial }: { initial?: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(initial ? {
    title: initial.title, description: initial.description ?? "",
    date: initial.date ? new Date(initial.date).toISOString().slice(0,16) : "",
    location: initial.location ?? "", image: initial.image ?? "",
    capacity: initial.capacity, category: initial.category ?? "", organiser: initial.organiser ?? "",
  } : empty);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, date: new Date(form.date).toISOString() };
      const res = initial
        ? await supabase.from("events").update(payload).eq("id", initial.id)
        : await supabase.from("events").insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-events"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {initial ? <Button size="sm" variant="outline"><Pencil className="size-4" /></Button>
          : <Button size="sm"><Plus className="size-4" /> New</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? "Edit event" : "New event"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Date & time</Label><Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>Capacity</Label><Input type="number" value={form.capacity ?? ""} onChange={(e) => setForm({ ...form, capacity: e.target.value ? +e.target.value : null })} /></div>
          </div>
          <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
          <div><Label>Committee / Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div><Label>Organiser</Label><Input value={form.organiser} onChange={(e) => setForm({ ...form, organiser: e.target.value })} /></div>
        </div>
        <DialogFooter><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RsvpsDialog({ eventId, title }: { eventId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const { data: rsvps = [] } = useQuery({
    queryKey: ["admin-rsvps", eventId],
    enabled: open,
    queryFn: async () => {
      const { data } = await supabase.from("event_rsvps").select("*").eq("event_id", eventId);
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
        <DialogHeader><DialogTitle>RSVPs · {title}</DialogTitle></DialogHeader>
        <div className="space-y-1.5">
          {rsvps.map((r: any) => (
            <div key={r.id} className="border rounded-lg p-2 text-sm">
              <p className="font-medium">{r.member ? `${r.member.first_name} ${r.member.last_name}` : r.user_id}</p>
              <p className="text-xs text-muted-foreground">{r.member?.email} · {r.status ?? "going"}</p>
            </div>
          ))}
          {rsvps.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No RSVPs yet.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
