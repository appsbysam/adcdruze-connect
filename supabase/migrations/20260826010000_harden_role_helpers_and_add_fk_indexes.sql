-- Prevent direct API execution of authorization helper functions while preserving internal policy use.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_committee_leader_of(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_committee_leader_of(uuid, text) TO service_role;

-- Cover foreign keys flagged by Supabase database advisor.
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id ON public.event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_user_id ON public.group_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_leader_user_id ON public.groups(leader_user_id);
