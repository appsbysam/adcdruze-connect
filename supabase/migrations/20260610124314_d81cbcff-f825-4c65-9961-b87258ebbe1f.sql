
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('event','committee','volunteer','business','announcement','donation','welcome'));

-- Seed a sample donation, welcome, and announcement notification for each existing user
INSERT INTO public.notifications (user_id, type, title, body, ref_id, read)
SELECT u.id, 'donation', 'Donation received', 'Thank you for your generous contribution to the community.', NULL, false
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.notifications n WHERE n.user_id = u.id AND n.type = 'donation');

INSERT INTO public.notifications (user_id, type, title, body, ref_id, read)
SELECT u.id, 'welcome', 'Welcome to ADC', 'We are glad to have you in the Australian Druze Community.', NULL, false
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.notifications n WHERE n.user_id = u.id AND n.type = 'welcome');

INSERT INTO public.notifications (user_id, type, title, body, ref_id, read)
SELECT u.id, 'announcement', 'Important community update', 'Please check the latest announcement from the committee.',
  (SELECT id FROM public.announcements ORDER BY created_at DESC LIMIT 1), false
FROM auth.users u
WHERE EXISTS (SELECT 1 FROM public.announcements)
  AND NOT EXISTS (SELECT 1 FROM public.notifications n WHERE n.user_id = u.id AND n.type = 'announcement');
