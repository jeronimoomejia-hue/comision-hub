
-- ============================================================
-- MENSUALISTA FULL DATABASE SCHEMA
-- ============================================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('vendor', 'company', 'admin');
CREATE TYPE public.company_plan AS ENUM ('freemium', 'premium', 'enterprise');
CREATE TYPE public.service_type AS ENUM ('suscripción', 'puntual');
CREATE TYPE public.service_status AS ENUM ('activo', 'inactivo', 'borrador');
CREATE TYPE public.sale_status AS ENUM ('PENDING', 'HELD', 'COMPLETED', 'REFUNDED', 'CANCELLED');
CREATE TYPE public.code_type AS ENUM ('code', 'link', 'credentials');
CREATE TYPE public.code_status AS ENUM ('available', 'delivered', 'expired');
CREATE TYPE public.lead_package_status AS ENUM ('active', 'sold');
CREATE TYPE public.prospect_stage AS ENUM ('sin_contactar', 'contactado', 'interesado', 'negociando', 'cerrado');
CREATE TYPE public.entity_status AS ENUM ('active', 'paused', 'blocked');

-- 2. TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  country TEXT DEFAULT 'Colombia',
  avatar_url TEXT,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. USER ROLES (separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own role on signup" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. COMPANIES
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  country TEXT DEFAULT 'Colombia',
  plan public.company_plan NOT NULL DEFAULT 'freemium',
  status public.entity_status NOT NULL DEFAULT 'active',
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#5007FA',
  secondary_color TEXT,
  cover_image_url TEXT,
  preferred_channel TEXT DEFAULT 'whatsapp',
  instagram TEXT,
  facebook TEXT,
  address TEXT,
  support_hours TEXT,
  sla_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Owners can update their company" ON public.companies FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert their company" ON public.companies FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their company" ON public.companies FOR DELETE USING (auth.uid() = owner_id);

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. SERVICES (Products)
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price_cop BIGINT NOT NULL DEFAULT 0,
  type public.service_type NOT NULL DEFAULT 'puntual',
  status public.service_status NOT NULL DEFAULT 'borrador',
  vendor_commission_pct NUMERIC(5,2) NOT NULL DEFAULT 10,
  mensualista_pct NUMERIC(5,2) DEFAULT 0,
  refund_window_days INT NOT NULL DEFAULT 7,
  auto_refund BOOLEAN NOT NULL DEFAULT false,
  cover_image_url TEXT,
  pitch TEXT,
  objections TEXT,
  sales_material_urls TEXT[],
  additional_notes TEXT,
  code_type public.code_type DEFAULT 'code',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Company owners can manage services" ON public.services FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);
CREATE POLICY "Company owners can update services" ON public.services FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);
CREATE POLICY "Company owners can delete services" ON public.services FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. ACTIVATION CODES
CREATE TABLE public.activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  code_type public.code_type NOT NULL DEFAULT 'code',
  username TEXT,
  password TEXT,
  status public.code_status NOT NULL DEFAULT 'available',
  assigned_to_sale_id UUID,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can manage codes" ON public.activation_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.services s JOIN public.companies c ON s.company_id = c.id WHERE s.id = service_id AND c.owner_id = auth.uid())
);

-- 8. VENDOR-COMPANY LINKS
CREATE TABLE public.vendor_company_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  status public.entity_status NOT NULL DEFAULT 'active',
  training_completed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, company_id)
);

ALTER TABLE public.vendor_company_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own links" ON public.vendor_company_links FOR SELECT USING (auth.uid() = vendor_id);
CREATE POLICY "Company owners can view links" ON public.vendor_company_links FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);
CREATE POLICY "Vendors can join companies" ON public.vendor_company_links FOR INSERT WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Vendors can update their links" ON public.vendor_company_links FOR UPDATE USING (auth.uid() = vendor_id);

-- 9. TRAININGS
CREATE TABLE public.trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  chapters JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainings are viewable by everyone" ON public.trainings FOR SELECT USING (true);
CREATE POLICY "Company owners can manage trainings" ON public.trainings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.services s JOIN public.companies c ON s.company_id = c.id WHERE s.id = service_id AND c.owner_id = auth.uid())
);

CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON public.trainings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. VENDOR TRAINING PROGRESS
CREATE TABLE public.vendor_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  completed_chapters INT[] DEFAULT '{}',
  quiz_scores JSONB DEFAULT '{}'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, training_id)
);

ALTER TABLE public.vendor_training_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage their progress" ON public.vendor_training_progress FOR ALL USING (auth.uid() = vendor_id);
CREATE POLICY "Company owners can view progress" ON public.vendor_training_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trainings t JOIN public.services s ON t.service_id = s.id JOIN public.companies c ON s.company_id = c.id WHERE t.id = training_id AND c.owner_id = auth.uid())
);

CREATE TRIGGER update_vtp_updated_at BEFORE UPDATE ON public.vendor_training_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. SALES
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  gross_amount BIGINT NOT NULL,
  seller_commission_amount BIGINT NOT NULL DEFAULT 0,
  mensualista_fee_amount BIGINT NOT NULL DEFAULT 0,
  provider_net_amount BIGINT NOT NULL DEFAULT 0,
  status public.sale_status NOT NULL DEFAULT 'PENDING',
  hold_start_at DATE,
  hold_end_at DATE,
  payment_provider TEXT DEFAULT 'MercadoPago',
  mp_payment_id TEXT,
  is_subscription BOOLEAN NOT NULL DEFAULT false,
  subscription_active BOOLEAN DEFAULT false,
  activation_code_id UUID REFERENCES public.activation_codes(id),
  coupon_code TEXT,
  coupon_discount_pct NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their sales" ON public.sales FOR SELECT USING (auth.uid() = vendor_id);
CREATE POLICY "Company owners can view sales" ON public.sales FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);
CREATE POLICY "Vendors can create sales" ON public.sales FOR INSERT WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Company owners can update sales" ON public.sales FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. COUPONS
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  discount_pct NUMERIC(5,2) NOT NULL,
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coupons viewable by linked vendors" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Company owners can manage coupons" ON public.coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);

-- 13. LEAD PACKAGES
CREATE TABLE public.lead_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cop BIGINT NOT NULL DEFAULT 0,
  status public.lead_package_status NOT NULL DEFAULT 'active',
  sold_to UUID REFERENCES auth.users(id),
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lead packages viewable by everyone" ON public.lead_packages FOR SELECT USING (true);
CREATE POLICY "Company owners can manage packages" ON public.lead_packages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);

-- 14. LEADS (inside packages)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.lead_packages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leads viewable with package" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Company owners can manage leads" ON public.leads FOR ALL USING (
  EXISTS (SELECT 1 FROM public.lead_packages lp JOIN public.companies c ON lp.company_id = c.id WHERE lp.id = package_id AND c.owner_id = auth.uid())
);

-- 15. PROSPECTS (Vendor CRM)
CREATE TABLE public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  context TEXT,
  stage public.prospect_stage NOT NULL DEFAULT 'contactado',
  from_lead_package BOOLEAN NOT NULL DEFAULT false,
  follow_up_date DATE,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage their prospects" ON public.prospects FOR ALL USING (auth.uid() = vendor_id);

CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON public.prospects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 16. PAYMENTS (transfers to vendors/companies)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('vendor', 'company')),
  amount_cop BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processing', 'completed', 'failed')),
  period_start DATE,
  period_end DATE,
  bank_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipients can view their payments" ON public.payments FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 17. AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 18. AUTO-ASSIGN ROLE ON SIGNUP (from metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
DECLARE
  _role public.app_role;
BEGIN
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'vendor')::public.app_role;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- 19. INDEXES
CREATE INDEX idx_services_company ON public.services(company_id);
CREATE INDEX idx_sales_vendor ON public.sales(vendor_id);
CREATE INDEX idx_sales_company ON public.sales(company_id);
CREATE INDEX idx_sales_service ON public.sales(service_id);
CREATE INDEX idx_vendor_links_vendor ON public.vendor_company_links(vendor_id);
CREATE INDEX idx_vendor_links_company ON public.vendor_company_links(company_id);
CREATE INDEX idx_prospects_vendor ON public.prospects(vendor_id);
CREATE INDEX idx_activation_codes_service ON public.activation_codes(service_id);
CREATE INDEX idx_lead_packages_company ON public.lead_packages(company_id);
