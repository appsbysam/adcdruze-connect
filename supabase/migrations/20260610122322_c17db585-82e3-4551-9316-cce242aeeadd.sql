
-- Volunteer opportunities
CREATE TABLE public.volunteer_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT NOT NULL,
  committee TEXT NOT NULL,
  volunteers_required INT NOT NULL DEFAULT 10,
  description TEXT,
  requirements TEXT,
  time_commitment TEXT,
  organiser_name TEXT,
  organiser_phone TEXT,
  organiser_email TEXT,
  hours_estimate NUMERIC(5,2) NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_opportunities TO authenticated;
GRANT ALL ON public.volunteer_opportunities TO service_role;
ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone signed in can view volunteer opportunities"
  ON public.volunteer_opportunities FOR SELECT TO authenticated USING (true);

-- Volunteer registrations
CREATE TABLE public.volunteer_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_registrations TO authenticated;
GRANT ALL ON public.volunteer_registrations TO service_role;
ALTER TABLE public.volunteer_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view all registrations"
  ON public.volunteer_registrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members register themselves"
  ON public.volunteer_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members update their own registration"
  ON public.volunteer_registrations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Members cancel their own registration"
  ON public.volunteer_registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Donations
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'one_time',
  message TEXT,
  donor_name TEXT,
  receipt_number TEXT NOT NULL DEFAULT ('ADC-' || to_char(now(),'YYYY') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view their own donations"
  ON public.donations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Members create donations as themselves"
  ON public.donations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- updated_at trigger reuse
CREATE TRIGGER touch_volunteer_opportunities_updated_at
  BEFORE UPDATE ON public.volunteer_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed opportunities
INSERT INTO public.volunteer_opportunities
  (event_name, date, start_time, end_time, location, committee, volunteers_required, description, requirements, time_commitment, organiser_name, organiser_phone, organiser_email, hours_estimate)
VALUES
  ('Family Picnic 2026', '2026-03-15', '09:00', '16:00', 'Centennial Park, Sydney', 'Community Committee', 25,
   'Help set up, run children''s games, serve food and pack down at the annual ADC Family Picnic.',
   'Friendly attitude, comfortable walking and lifting light items.',
   'Full day (~7 hrs)', 'Maya Halabi', '+61 412 555 102', 'picnic@adc.org.au', 7),
  ('Community Iftar Dinner', '2026-03-28', '16:00', '22:00', 'ADC Hall, Bankstown', 'Religious Committee', 18,
   'Set up tables, serve guests during Iftar and assist with clean-up.',
   'Food handling certificate preferred but not required.',
   'Evening shift (~6 hrs)', 'Ali Atiyeh', '+61 412 555 211', 'iftar@adc.org.au', 6),
  ('Youth Sports Day', '2026-04-12', '08:30', '15:00', 'Greenacre Sports Complex', 'Youth Committee', 15,
   'Marshal sports games, run the registration desk and supervise youth activities.',
   'Working with Children Check (WWCC) required.',
   'Full day (~6.5 hrs)', 'Nada Saleh', '+61 412 555 308', 'youth@adc.org.au', 6.5),
  ('Food Relief Packing Day', '2026-05-04', '10:00', '14:00', 'ADC Warehouse, Padstow', 'Welfare Committee', 20,
   'Pack food hampers for families in need across Sydney.',
   'Comfortable standing for long periods.',
   'Half day (~4 hrs)', 'Samir Khoury', '+61 412 555 412', 'welfare@adc.org.au', 4);
