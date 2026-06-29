import { z } from "zod";

// =====================
// VALIDATION SCHEMAS
// =====================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const contentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  body: z.string().min(1, "Body is required"),
  excerpt: z.string().max(500).optional(),
  content_type: z.enum(["article", "video", "guide", "recipe", "workout"]),
  required_tier_slug: z.enum(["free", "basic", "premium"]),
  is_published: z.boolean().default(false),
});

export const tierUpdateSchema = z.object({
  price_monthly: z.number().min(0),
  price_yearly: z.number().min(0),
  features: z.array(z.string()),
  revenuecat_product_id: z.string().nullable(),
  stripe_price_id_monthly: z.string().nullable(),
  stripe_price_id_yearly: z.string().nullable(),
});

// =====================
// TYPES
// =====================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContentInput = z.infer<typeof contentSchema>;
export type TierUpdateInput = z.infer<typeof tierUpdateSchema>;

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

export function canAccessTier(userTier: TierSlug, requiredTier: TierSlug): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}
