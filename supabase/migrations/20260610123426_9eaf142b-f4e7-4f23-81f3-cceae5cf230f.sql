CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('event','committee','volunteer','business','announcement')),
  title TEXT NOT NULL,
  body TEXT,
  ref_id UUID,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

-- Seed sample notifications for all existing users
INSERT INTO public.notifications (user_id, type, title, body, ref_id, read, created_at)
SELECT u.id, 'event', 'New event: ' || e.title, 'RSVP now to secure your spot.', e.id, false, now() - interval '1 hour'
FROM auth.users u CROSS JOIN LATERAL (SELECT id, title FROM public.events ORDER BY date ASC LIMIT 1) e;

INSERT INTO public.notifications (user_id, type, title, body, ref_id, read, created_at)
SELECT u.id, 'committee', 'New post in ' || g.name, 'There is a new update from the committee.', g.id, false, now() - interval '3 hour'
FROM auth.users u CROSS JOIN LATERAL (SELECT id, name FROM public.groups ORDER BY created_at ASC LIMIT 1) g;

INSERT INTO public.notifications (user_id, type, title, body, ref_id, read, created_at)
SELECT u.id, 'volunteer', 'Volunteers needed: ' || v.event_name, 'Sign up to help your community.', v.id, true, now() - interval '1 day'
FROM auth.users u CROSS JOIN LATERAL (SELECT id, event_name FROM public.volunteer_opportunities ORDER BY date ASC LIMIT 1) v;

INSERT INTO public.notifications (user_id, type, title, body, ref_id, read, created_at)
SELECT u.id, 'business', 'New business: ' || b.business_name, 'Check out this new community business.', b.id, true, now() - interval '2 day'
FROM auth.users u CROSS JOIN LATERAL (SELECT id, business_name FROM public.businesses ORDER BY created_at DESC LIMIT 1) b;