"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, AlertCircle, CheckCircle } from "lucide-react";
import type { SubscriptionTier } from "@/types";

export default function SettingsPage() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    const { data } = await supabase
      .from("subscription_tiers")
      .select("*")
      .order("sort_order");

    if (data) setTiers(data);
    setLoading(false);
  };

  const updateTier = (
    id: string,
    field: keyof SubscriptionTier,
    value: any
  ) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      for (const tier of tiers) {
        const { error } = await supabase
          .from("subscription_tiers")
          .update({
            price_monthly: tier.price_monthly,
            price_yearly: tier.price_yearly,
            features: tier.features,
            stripe_price_id_monthly: tier.stripe_price_id_monthly,
            stripe_price_id_yearly: tier.stripe_price_id_yearly,
            revenuecat_product_id: tier.revenuecat_product_id,
          })
          .eq("id", tier.id);

        if (error) throw error;
      }

      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure tiers, pricing, and integrations
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-500"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Tier Configuration */}
      <div className="space-y-6">
        {tiers.map((tier) => (
          <Card key={tier.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {tier.name}
                    <Badge
                      variant={
                        tier.slug === "premium"
                          ? "default"
                          : tier.slug === "basic"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {tier.slug}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Configure pricing and integration IDs for {tier.name} tier
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Monthly Price (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tier.price_monthly}
                    onChange={(e) =>
                      updateTier(
                        tier.id,
                        "price_monthly",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Yearly Price (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tier.price_yearly}
                    onChange={(e) =>
                      updateTier(
                        tier.id,
                        "price_yearly",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>RevenueCat Product ID</Label>
                  <Input
                    value={tier.revenuecat_product_id || ""}
                    onChange={(e) =>
                      updateTier(
                        tier.id,
                        "revenuecat_product_id",
                        e.target.value || null
                      )
                    }
                    placeholder="e.g., prestige_basic_monthly"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stripe Price ID (Monthly)</Label>
                  <Input
                    value={tier.stripe_price_id_monthly || ""}
                    onChange={(e) =>
                      updateTier(
                        tier.id,
                        "stripe_price_id_monthly",
                        e.target.value || null
                      )
                    }
                    placeholder="price_xxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stripe Price ID (Yearly)</Label>
                  <Input
                    value={tier.stripe_price_id_yearly || ""}
                    onChange={(e) =>
                      updateTier(
                        tier.id,
                        "stripe_price_id_yearly",
                        e.target.value || null
                      )
                    }
                    placeholder="price_xxxxx"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label>Features (one per line)</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={(tier.features as string[]).join("\n")}
                  onChange={(e) =>
                    updateTier(
                      tier.id,
                      "features",
                      e.target.value.split("\n").filter(Boolean)
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Environment Variables Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Required environment variables for integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">NEXT_PUBLIC_SUPABASE_URL</span>
              <span>Supabase project URL</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <span>Supabase anonymous key</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">SUPABASE_SERVICE_ROLE_KEY</span>
              <span>Supabase service role key</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">STRIPE_SECRET_KEY</span>
              <span>Stripe secret key</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">STRIPE_WEBHOOK_SECRET</span>
              <span>Stripe webhook signing secret</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">REVENUECAT_WEBHOOK_SECRET</span>
              <span>RevenueCat webhook secret</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
