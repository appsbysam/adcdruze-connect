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
import { Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/businesses")({
  component: AdminBusinesses,
});

function AdminBusinesses() {
  const qc = useQueryClient();
  const { data: businesses = [] } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("businesses").select("*").order("business_name");
      if (error) throw error;
      return data;
    },
  });

  const approve = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("businesses").update({ approved: true }).eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Approved"); qc.invalidateQueries({ queryKey: ["admin-businesses"] }); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("businesses").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-businesses"] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Businesses</h2>
        <BusinessDialog />
      </div>
      <div className="space-y-2">
        {businesses.map((b: any) => (
          <div key={b.id} className="rounded-xl border bg-card p-3 flex gap-3">
            {b.logo ? <img src={b.logo} alt="" className="size-14 rounded-lg object-cover" /> : <div className="size-14 rounded-lg bg-muted" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium leading-tight">{b.business_name}</p>
                {!b.approved && <span className="text-[10px] uppercase font-semibold bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">Pending</span>}
                {b.featured && <span className="text-[10px] uppercase font-semibold bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">Featured</span>}
              </div>
              <p className="text-xs text-muted-foreground">{b.category}</p>
              <p className="text-xs text-muted-foreground truncate">{b.phone} · {b.email}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {!b.approved && <Button size="sm" variant="outline" onClick={() => approve.mutate(b.id)}><CheckCircle2 className="size-4" /></Button>}
              <BusinessDialog initial={b} />
              <Button size="sm" variant="outline" onClick={() => del.mutate(b.id)}><Trash2 className="size-4" /></Button>
            </div>
          </div>
        ))}
        {businesses.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No businesses.</p>}
      </div>
    </div>
  );
}

function BusinessDialog({ initial }: { initial?: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    business_name: initial?.business_name ?? "",
    category: initial?.category ?? "",
    description: initial?.description ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    website: initial?.website ?? "",
    address: initial?.address ?? "",
    logo: initial?.logo ?? "",
    featured: initial?.featured ?? false,
    approved: initial?.approved ?? true,
  });

  const save = useMutation({
    mutationFn: async () => {
      const res = initial
        ? await supabase.from("businesses").update(form).eq("id", initial.id)
        : await supabase.from("businesses").insert(form);
      if (res.error) throw res.error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-businesses"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {initial ? <Button size="sm" variant="outline"><Pencil className="size-4" /></Button>
          : <Button size="sm"><Plus className="size-4" /> New</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? "Edit business" : "New business"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} /></div>
          <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div><Label>Website</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
          <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label>Logo URL</Label><Input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://..." /></div>
          <div className="flex items-center justify-between"><Label>Featured</Label><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /></div>
          <div className="flex items-center justify-between"><Label>Approved</Label><Switch checked={form.approved} onCheckedChange={(v) => setForm({ ...form, approved: v })} /></div>
        </div>
        <DialogFooter><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
