export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  revenuecat_product_id: string | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier_id: string;
  status: "active" | "cancelled" | "expired" | "trial" | "past_due";
  provider: "revenuecat" | "stripe";
  provider_subscription_id: string | null;
  billing_cycle: "monthly" | "yearly" | null;
  period_start: string | null;
  period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface PremiumContent {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  content_type: "article" | "video" | "guide" | "recipe" | "workout";
  required_tier_slug: string;
  thumbnail_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  provider: "revenuecat" | "stripe";
  provider_payment_id: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  description: string | null;
  created_at: string;
}

export type TierSlug = "free" | "basic" | "premium";

export const TIER_HIERARCHY: Record<TierSlug, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};
