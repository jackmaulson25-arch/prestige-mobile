"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Users, TrendingUp, AlertTriangle } from "lucide-react";

interface SubscriptionRow {
  id: string;
  user_id: string;
  status: string;
  provider: string;
  billing_cycle: string;
  period_start: string;
  period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  profiles: { email: string; full_name: string } | null;
  subscription_tiers: { name: string; slug: string; price_monthly: number } | null;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueStats, setRevenueStats] = useState({
    totalMrr: 0,
    activeCount: 0,
    cancelledCount: 0,
    pastDueCount: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: subs } = await supabase
        .from("user_subscriptions")
        .select("*, profiles(email, full_name), subscription_tiers(name, slug, price_monthly)")
        .order("created_at", { ascending: false });

      if (subs) {
        setSubscriptions(subs);

        const active = subs.filter((s) => s.status === "active" || s.status === "trial");
        const cancelled = subs.filter((s) => s.status === "cancelled");
        const pastDue = subs.filter((s) => s.status === "past_due");

        const mrr = active.reduce((sum, s) => {
          const price = s.subscription_tiers?.price_monthly || 0;
          return sum + (s.billing_cycle === "yearly" ? price / 12 : price);
        }, 0);

        setRevenueStats({
          totalMrr: mrr,
          activeCount: active.length,
          cancelledCount: cancelled.length,
          pastDueCount: pastDue.length,
        });
      }
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "trial":
        return "secondary";
      case "cancelled":
        return "outline";
      case "past_due":
        return "destructive";
      case "expired":
        return "outline";
      default:
        return "secondary";
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
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">
          Monitor subscriptions and revenue
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueStats.totalMrr)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {revenueStats.activeCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cancelled</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueStats.cancelledCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Past Due</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {revenueStats.pastDueCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Period End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {sub.profiles?.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sub.profiles?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {sub.subscription_tiers?.name || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor(sub.status) as any}>
                      {sub.status}
                      {sub.cancel_at_period_end && " (ending)"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground capitalize">
                    {sub.provider}
                  </TableCell>
                  <TableCell className="text-muted-foreground capitalize">
                    {sub.billing_cycle || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {sub.period_end ? formatDate(sub.period_end) : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {subscriptions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No subscriptions yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
