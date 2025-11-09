"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  totalProducts: number;
  pendingOrders: number;
  totalRevenue: number;
  growthRate: number;
}

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real stats from API
    // For now, using mock data
    setTimeout(() => {
      setStats({
        totalProducts: 24,
        pendingOrders: 8,
        totalRevenue: 45670,
        growthRate: 12.5,
      });
      setLoading(false);
    }, 500);
  }, []);

  const metrics = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-primary-600",
      bgColor: "bg-primary-50",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: ShoppingBag,
      color: "text-warning-600",
      bgColor: "bg-warning-50",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-success-600",
      bgColor: "bg-success-50",
    },
    {
      title: "Growth Rate",
      value: `${stats.growthRate}%`,
      icon: TrendingUp,
      color: "text-info-600",
      bgColor: "bg-info-50",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Welcome back! Here&apos;s an overview of your seller account.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {metric.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {metric.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Package className="mb-3 h-8 w-8 text-primary-600" />
              <h3 className="mb-1 font-semibold text-slate-900">Add Product</h3>
              <p className="text-sm text-slate-600">
                List a new product in your catalog
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <ShoppingBag className="mb-3 h-8 w-8 text-warning-600" />
              <h3 className="mb-1 font-semibold text-slate-900">View Orders</h3>
              <p className="text-sm text-slate-600">
                Manage your pending orders
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <TrendingUp className="mb-3 h-8 w-8 text-success-600" />
              <h3 className="mb-1 font-semibold text-slate-900">
                View Analytics
              </h3>
              <p className="text-sm text-slate-600">
                Track your sales performance
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity placeholder */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Recent Activity
        </h2>
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-center text-sm text-slate-500">
              No recent activity to display
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
