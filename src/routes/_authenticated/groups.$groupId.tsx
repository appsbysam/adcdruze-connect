import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { ArrowLeft, UsersRound, Check, LogOut, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/groups/$groupId")({
  head: () => ({ meta: [{ title: "Group — ADC" }] }),
  errorComponent: ({ error }) => (
    <div className="p-8 text-center">
      <p className="text-sm text-destructive">{error.message}</p>
      <Link to="/groups" className="text-sm text-[color:var(--brand-groups)] font-semibold mt-3 inline-block">Back to groups</Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p className="text-sm text-muted-foreground">Group not found.</p>
      <Link to="/groups" className="text-sm text-[color:var(--brand-groups)] font-semibold mt-3 inline-block">Back to groups</Link>
    </div>
  ),
  component: GroupDetailPage,
});

function GroupDetailPage() {
  const { groupId } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const { session } = useSession();
  const userId = session?.user.id;

  const [tab, setTab] = useState<"posts" | "members">("posts");
  const [draft, setDraft] = useState("");

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("*").eq("id", groupId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      const { data } = await supabase.from("group_members").select("user_id, created_at").eq("group_id", groupId);
      return data ?? [];
    },
  });

  const memberUserIds = members.map((m) => m.user_id);
  const { data: memberProfiles = [] } = useQuery({
    queryKey: ["group-member-profiles", groupId, memberUserIds.join(",")],
    enabled: memberUserIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("members")
        .select("id, user_id, first_name, last_name, suburb, occupation")
        .in("user_id", memberUserIds);
      return data ?? [];
    },
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["group-posts", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("group_posts")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const postAuthorIds = Array.from(new Set(posts.map((p) => p.user_id)));
  const { data: postAuthors = [] } = useQuery({
    queryKey: ["group-post-authors", groupId, postAuthorIds.join(",")],
    enabled: postAuthorIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("members")
        .select("user_id, first_name, last_name")
        .in("user_id", postAuthorIds);
      return data ?? [];
    },
  });
  const authorMap = new Map(postAuthors.map((a) => [a.user_id, a]));

  const isJoined = !!userId && members.some((m) => m.user_id === userId);

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("group_members").insert({ group_id: groupId, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-members", groupId] });
      qc.invalidateQueries({ queryKey: ["group-memberships-all"] });
      toast.success("Joined group");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-members", groupId] });
      qc.invalidateQueries({ queryKey: ["group-memberships-all"] });
      toast.success("Left group");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const postMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("group_posts").insert({ group_id: groupId, user_id: userId, content });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["group-posts", groupId] });
      toast.success("Posted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("group_posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group-posts", groupId] }),
  });

  if (isLoading) return <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!group) return <div className="p-8 text-center text-sm text-muted-foreground">Group not found.</div>;

  return (
    <div className="pb-10">
      {/* Header band */}
      <div className="relative bg-gradient-to-br from-[color:var(--brand-groups)] to-[#5B8DEF] h-44">
        <button
          onClick={() => router.history.back()}
          className="absolute top-4 left-4 size-10 rounded-full bg-white/95 flex items-center justify-center shadow-card"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <span className="size-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-2">
            <UsersRound className="size-6 text-white" />
          </span>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-sm opacity-90 mt-1">{members.length} members</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {group.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{group.description}</p>
        )}

        {/* Join / Leave */}
        {isJoined ? (
          <button
            onClick={() => leaveMutation.mutate()}
            disabled={leaveMutation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-card border border-[color:var(--brand-events)] text-[color:var(--brand-events)] font-semibold py-3 rounded-xl"
          >
            <LogOut className="size-4" /> Leave group
          </button>
        ) : (
          <button
            onClick={() => joinMutation.mutate()}
            disabled={joinMutation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--brand-groups)] text-white font-semibold py-3 rounded-xl"
          >
            <Check className="size-4" /> Join group
          </button>
        )}

        {/* Tabs */}
        <div className="flex gap-2 bg-muted p-1 rounded-xl">
          {(["posts", "members"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${
                tab === t ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"
              }`}
            >
              {t} {t === "posts" ? `(${posts.length})` : `(${members.length})`}
            </button>
          ))}
        </div>

        {tab === "posts" && (
          <section className="space-y-3">
            {isJoined && (
              <div className="bg-card border rounded-2xl p-3 shadow-soft">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Share an update with the group…"
                  className="w-full text-sm bg-transparent resize-none focus:outline-none min-h-[60px]"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => draft.trim() && postMutation.mutate(draft.trim())}
                    disabled={!draft.trim() || postMutation.isPending}
                    className="inline-flex items-center gap-1.5 bg-[color:var(--brand-groups)] text-white text-sm font-semibold px-4 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    <Send className="size-3.5" /> Post
                  </button>
                </div>
              </div>
            )}

            {posts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-10">No posts yet. Be the first to share.</p>
            )}

            {posts.map((p) => {
              const author = authorMap.get(p.user_id);
              const name = author ? `${author.first_name} ${author.last_name}` : "Member";
              const initials = author ? `${author.first_name?.[0] ?? ""}${author.last_name?.[0] ?? ""}` : "?";
              return (
                <article key={p.id} className="bg-card border rounded-2xl p-4 shadow-soft">
                  <header className="flex items-center gap-3 mb-2">
                    <span className="size-9 rounded-full bg-[color:var(--brand-groups-soft)] flex items-center justify-center text-[color:var(--brand-groups)] text-xs font-bold">
                      {initials}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(p.created_at).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                    {p.user_id === userId && (
                      <button
                        onClick={() => deletePostMutation.mutate(p.id)}
                        className="size-8 rounded-full text-muted-foreground hover:text-[color:var(--brand-events)] flex items-center justify-center"
                        aria-label="Delete post"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </header>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{p.content}</p>
                </article>
              );
            })}
          </section>
        )}

        {tab === "members" && (
          <section className="space-y-2.5">
            {memberProfiles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-10">No members yet.</p>
            )}
            {memberProfiles.map((m) => (
              <Link
                key={m.id}
                to="/directory/$memberId"
                params={{ memberId: m.id }}
                className="bg-card border rounded-2xl p-3 flex items-center gap-3 shadow-soft hover:shadow-card transition-shadow"
              >
                <span className="size-10 rounded-full bg-[color:var(--brand-directory-soft)] flex items-center justify-center text-[color:var(--brand-directory)] text-xs font-bold">
                  {m.first_name?.[0]}{m.last_name?.[0]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{m.first_name} {m.last_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[m.occupation, m.suburb].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
