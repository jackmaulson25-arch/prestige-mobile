-- =============================================
-- PrestigeSupliments — Row Level Security
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- =====================
-- PROFILES POLICIES
-- =====================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================
-- SUBSCRIPTION TIERS POLICIES
-- =====================

-- Anyone can read active tiers
CREATE POLICY "Anyone can read active tiers"
    ON public.subscription_tiers FOR SELECT
    USING (is_active = TRUE);

-- Admins can manage tiers
CREATE POLICY "Admins can manage tiers"
    ON public.subscription_tiers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================
-- USER SUBSCRIPTIONS POLICIES
-- =====================

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
    ON public.user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can read all subscriptions
CREATE POLICY "Admins can read all subscriptions"
    ON public.user_subscriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Service role can insert/update subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
    ON public.user_subscriptions FOR ALL
    USING (auth.role() = 'service_role');

-- =====================
-- PREMIUM CONTENT POLICIES
-- =====================

-- Anyone can read published content
CREATE POLICY "Anyone can read published content"
    ON public.premium_content FOR SELECT
    USING (is_published = TRUE);

-- Admins can manage all content
CREATE POLICY "Admins can manage content"
    ON public.premium_content FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================
-- PAYMENTS POLICIES
-- =====================

-- Users can read their own payments
CREATE POLICY "Users can read own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can read all payments
CREATE POLICY "Admins can read all payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Service role can insert payments
CREATE POLICY "Service role can insert payments"
    ON public.payments FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- =====================
-- CONTENT GATING FUNCTION
-- =====================

-- Function to check if user can access content
CREATE OR REPLACE FUNCTION public.user_can_access_content(
    content_slug TEXT,
    user_uuid UUID
) RETURNS BOOLEAN AS $$
DECLARE
    content_tier TEXT;
    user_tier TEXT;
    tier_hierarchy JSONB := '{"free": 0, "basic": 1, "premium": 2}'::JSONB;
BEGIN
    -- Get content's required tier
    SELECT required_tier_slug INTO content_tier
    FROM public.premium_content
    WHERE slug = content_slug AND is_published = TRUE;

    IF content_tier IS NULL THEN RETURN FALSE; END IF;

    -- Free content is accessible to everyone
    IF content_tier = 'free' THEN RETURN TRUE; END IF;

    -- Get user's active subscription tier
    SELECT tier_slug INTO user_tier
    FROM public.v_user_active_subscription
    WHERE user_id = user_uuid;

    IF user_tier IS NULL THEN user_tier := 'free'; END IF;

    -- Compare tier levels
    RETURN (tier_hierarchy->>user_tier)::INT >= (tier_hierarchy->>content_tier)::INT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
