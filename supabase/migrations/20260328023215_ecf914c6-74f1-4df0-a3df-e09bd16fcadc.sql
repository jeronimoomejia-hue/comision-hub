
-- Commission tiers per service (max 3 per service)
CREATE TABLE public.commission_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Básico',
  commission_pct NUMERIC NOT NULL DEFAULT 10,
  is_public BOOLEAN NOT NULL DEFAULT false,
  tier_order INTEGER NOT NULL DEFAULT 1 CHECK (tier_order BETWEEN 1 AND 3),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (service_id, tier_order)
);

ALTER TABLE public.commission_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Commission tiers viewable by everyone"
  ON public.commission_tiers FOR SELECT USING (true);

CREATE POLICY "Company owners can manage commission tiers"
  ON public.commission_tiers FOR ALL USING (
    EXISTS (
      SELECT 1 FROM services s JOIN companies c ON s.company_id = c.id
      WHERE s.id = commission_tiers.service_id AND c.owner_id = auth.uid()
    )
  );

-- Vendor commission assignments (which tier a vendor is on for a service)
CREATE TABLE public.vendor_commission_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.commission_tiers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, service_id)
);

ALTER TABLE public.vendor_commission_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignments viewable by everyone"
  ON public.vendor_commission_assignments FOR SELECT USING (true);

CREATE POLICY "Company owners can manage assignments"
  ON public.vendor_commission_assignments FOR ALL USING (
    EXISTS (
      SELECT 1 FROM services s JOIN companies c ON s.company_id = c.id
      WHERE s.id = vendor_commission_assignments.service_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can view their assignments"
  ON public.vendor_commission_assignments FOR SELECT USING (auth.uid() = vendor_id);

-- Add commission_tier_id to sales
ALTER TABLE public.sales ADD COLUMN commission_tier_id UUID REFERENCES public.commission_tiers(id);
