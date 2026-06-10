import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  component: AdminAnnouncements,
});

function AdminAnnouncements() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const togglePub = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("announcements").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-announcements"] }),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("announcements").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-announcements"] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Announcements</h2>
        <AnnouncementDialog />
      </div>
      <div className="space-y-2">
        {items.map((a: any) => (
          <div key={a.id} className="rounded-xl border bg-card p-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{a.title}</p>
                  {!a.published && <span className="text-[10px] uppercase font-semibold bg-muted rounded-full px-2 py-0.5">Draft</span>}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{new Date(a.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Switch checked={a.published} onCheckedChange={(v) => togglePub.mutate({ id: a.id, published: v })} />
                </div>
                <AnnouncementDialog initial={a} />
                <Button size="sm" variant="outline" onClick={() => del.mutate(a.id)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No announcements.</p>}
      </div>
    </div>
  );
}

function AnnouncementDialog({ initial }: { initial?: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    content: initial?.content ?? "",
    published: initial?.published ?? true,
  });

  const save = useMutation({
    mutationFn: async () => {
      const res = initial
        ? await supabase.from("announcements").update(form).eq("id", initial.id)
        : await supabase.from("announcements").insert(form);
      if (res.error) throw res.error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-announcements"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {initial ? <Button size="sm" variant="outline"><Pencil className="size-4" /></Button>
          : <Button size="sm"><Plus className="size-4" /> New</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{initial ? "Edit announcement" : "New announcement"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Content</Label><Textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <div className="flex items-center justify-between"><Label>Published</Label><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /></div>
        </div>
        <DialogFooter><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
