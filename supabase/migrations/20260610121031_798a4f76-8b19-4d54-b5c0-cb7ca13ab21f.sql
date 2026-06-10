
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.group_members TO authenticated;
GRANT ALL ON public.group_members TO service_role;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group memberships readable by authenticated" ON public.group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users join groups themselves" ON public.group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave groups themselves" ON public.group_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.group_posts TO authenticated;
GRANT ALL ON public.group_posts TO service_role;
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group posts readable by authenticated" ON public.group_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members post in groups they joined" ON public.group_posts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_posts.group_id AND gm.user_id = auth.uid())
  );
CREATE POLICY "Users delete own posts" ON public.group_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX group_posts_group_created_idx ON public.group_posts (group_id, created_at DESC);
