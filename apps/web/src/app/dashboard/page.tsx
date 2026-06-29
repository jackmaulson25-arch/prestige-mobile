"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    mrr: 0,
    churnRate: 0,
    conversionRate: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [tierBreakdown, setTierBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Total users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Active subscriptions
      const { count: subCount } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .in("status", ["active", "trial"]);

      // Recent payments
      const { data: payments } = await supabase
        .from("payments")
        .select("*, profiles(email, full_name)")
        .order("created_at", { ascending: false })
        .limit(10);

      // MRR from view
      const { data: mrrData } = await supabase
        .from("v_monthly_revenue")
        .select("*");

      const totalMrr =
        mrrData?.reduce((sum, row) => sum + Number(row.mrr || 0), 0) || 0;

      setStats({
        totalUsers: userCount || 0,
        activeSubscriptions: subCount || 0,
        mrr: totalMrr,
        churnRate: userCount ? ((userCount - (subCount || 0)) / userCount) : 0,
        conversionRate: userCount ? ((subCount || 0) / userCount) : 0,
      });

      setRecentPayments(payments || []);
      setTierBreakdown(mrrData || []);
    } catch (error) {
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubscriptions.toLocaleString(),
      icon: CreditCard,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Monthly Recurring Revenue",
      value: formatCurrency(stats.mrr),
      icon: DollarSign,
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      title: "Conversion Rate",
      value: `${(stats.conversionRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      change: stats.conversionRate > 0.1 ? "+5%" : "-2%",
      changeType: stats.conversionRate > 0.1 ? "positive" : "negative",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your supplements platform
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.changeType === "positive" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    stat.changeType === "positive"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {stat.change}
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tierBreakdown.map((tier) => (
                <div
                  key={tier.tier_slug}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        tier.tier_slug === "premium"
                          ? "default"
                          : tier.tier_slug === "basic"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {tier.tier_name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {tier.active_subscribers} subscribers
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(Number(tier.mrr || 0))}
                  </span>
                </div>
              ))}
              {tierBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No revenue data yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {payment.profiles?.full_name ||
                        payment.profiles?.email ||
                        "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.description} •{" "}
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <Badge
                      variant={
                        payment.status === "completed"
                          ? "default"
                          : payment.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentPayments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No payments yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
