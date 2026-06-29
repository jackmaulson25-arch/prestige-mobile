-- =============================================
-- PrestigeSupliments — Initial Schema Migration
-- =============================================

-- Enable required extensions

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- PROFILES
-- =====================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================
-- SUBSCRIPTION TIERS
-- =====================
CREATE TABLE public.subscription_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]',
    revenuecat_product_id TEXT,
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tiers_slug ON public.subscription_tiers(slug);

-- =====================
-- USER SUBSCRIPTIONS
-- =====================
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES public.subscription_tiers(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'past_due')),
    provider TEXT NOT NULL CHECK (provider IN ('revenuecat', 'stripe')),
    provider_subscription_id TEXT,
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_provider ON public.user_subscriptions(provider);

CREATE OR REPLACE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================
-- PREMIUM CONTENT
-- =====================
CREATE TABLE public.premium_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    body TEXT NOT NULL,
    excerpt TEXT,
    content_type TEXT NOT NULL DEFAULT 'article' CHECK (content_type IN ('article', 'video', 'guide', 'recipe', 'workout')),
    required_tier_slug TEXT NOT NULL DEFAULT 'free',
    thumbnail_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_slug ON public.premium_content(slug);
CREATE INDEX idx_content_required_tier ON public.premium_content(required_tier_slug);
CREATE INDEX idx_content_published ON public.premium_content(is_published);

CREATE OR REPLACE TRIGGER update_premium_content_updated_at
    BEFORE UPDATE ON public.premium_content
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================
-- PAYMENTS
-- =====================
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    provider TEXT NOT NULL CHECK (provider IN ('revenuecat', 'stripe')),
    provider_payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at);

-- =====================
-- HELPER VIEWS
-- =====================

-- Active subscription for each user
CREATE OR REPLACE VIEW public.v_user_active_subscription AS
SELECT DISTINCT ON (us.user_id)
    us.user_id,
    us.tier_id,
    st.name AS tier_name,
    st.slug AS tier_slug,
    us.status,
    us.provider,
    us.billing_cycle,
    us.period_start,
    us.period_end,
    us.cancel_at_period_end
FROM public.user_subscriptions us
JOIN public.subscription_tiers st ON st.id = us.tier_id
WHERE us.status IN ('active', 'trial')
ORDER BY us.user_id, us.created_at DESC;

-- MRR calculation
CREATE OR REPLACE VIEW public.v_monthly_revenue AS
SELECT
    st.slug AS tier_slug,
    st.name AS tier_name,
    COUNT(*) AS active_subscribers,
    SUM(
        CASE
            WHEN us.billing_cycle = 'yearly' THEN st.price_yearly / 12
            ELSE st.price_monthly
        END
    ) AS mrr
FROM public.user_subscriptions us
JOIN public.subscription_tiers st ON st.id = us.tier_id
WHERE us.status IN ('active', 'trial')
GROUP BY st.slug, st.name;
