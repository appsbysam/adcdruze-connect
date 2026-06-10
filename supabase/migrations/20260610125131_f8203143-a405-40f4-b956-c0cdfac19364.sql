
-- Roles
CREATE TYPE public.app_role AS ENUM ('member','committee_member','committee_leader','admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  committee text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, committee)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_committee_leader_of(_user_id uuid, _committee text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'committee_leader' AND committee = _committee)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Member status (pending approval)
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';

-- Groups: committee leader + linked committee key
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS leader_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS committee text;

-- Business approval
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true;

-- Announcement publish
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

-- Admin write policies
CREATE POLICY "Admins manage members" ON public.members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage events" ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Committee leaders manage own events" ON public.events FOR ALL TO authenticated
  USING (public.is_committee_leader_of(auth.uid(), category))
  WITH CHECK (public.is_committee_leader_of(auth.uid(), category));

CREATE POLICY "Admins manage groups" ON public.groups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage group_posts" ON public.group_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Committee leaders manage their group posts" ON public.group_posts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_posts.group_id AND g.leader_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_posts.group_id AND g.leader_user_id = auth.uid()));

CREATE POLICY "Admins manage businesses" ON public.businesses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage volunteer opportunities" ON public.volunteer_opportunities FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Committee leaders manage own opportunities" ON public.volunteer_opportunities FOR ALL TO authenticated
  USING (public.is_committee_leader_of(auth.uid(), committee))
  WITH CHECK (public.is_committee_leader_of(auth.uid(), committee));

CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
