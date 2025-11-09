"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productApi } from "@/lib/api";
import ProductCard from "@/components/products/ProductCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Search,
  Filter,
  ArrowRight,
  Package,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  description?: string;
  handle: string;
  thumbnail?: string;
  variants?: Array<{
    prices?: Array<{
      amount: number;
      currency_code: string;
    }>;
  }>;
  metadata?: {
    min_order_quantity?: number;
    seller_name?: string;
    seller_location?: string;
  };
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = (await productApi.list({ limit: 12 })) as {
        products: Product[];
      };
      setProducts(response.products || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (
      searchQuery &&
      !product.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (priceRange.min || priceRange.max) {
      const price = product.variants?.[0]?.prices?.[0]?.amount || 0;
      const priceInDollars = price / 100;

      if (priceRange.min && priceInDollars < parseFloat(priceRange.min)) {
        return false;
      }
      if (priceRange.max && priceInDollars > parseFloat(priceRange.max)) {
        return false;
      }
    }

    return true;
  });

  const features = [
    {
      icon: Shield,
      title: "Verified Suppliers",
      description: "All sellers are verified for trust and quality assurance",
    },
    {
      icon: Package,
      title: "Bulk Ordering",
      description: "Get competitive prices on bulk orders with MOQ flexibility",
    },
    {
      icon: TrendingUp,
      title: "Competitive Pricing",
      description: "Compare prices from multiple suppliers instantly",
    },
    {
      icon: Users,
      title: "Global Network",
      description: "Connect with businesses worldwide for international trade",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-slate-200 bg-linear-to-b from-primary-50 to-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                Your Global B2B
                <span className="block text-primary-600">Marketplace</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
                Connect with verified suppliers, discover quality products, and
                grow your business with TradePal&apos;s comprehensive B2B
                platform.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/products">
                  <Button size="lg" className="w-full sm:w-auto">
                    Browse Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Become a Seller
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-b border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary-100">
                    <feature.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  Featured Products
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Discover our latest and most popular products
                </p>
              </div>
              <Link href="/products">
                <Button variant="outline">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <Card className="mb-6 border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Filter Products
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>
              </div>

              <div
                className={`grid gap-4 md:grid-cols-3 ${
                  showFilters ? "grid" : "hidden md:grid"
                }`}
              >
                {/* Search filter */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Price range filter */}
                <div className="space-y-2">
                  <Label>Price Range ($)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value })
                      }
                    />
                    <span className="text-slate-400">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Clear filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setPriceRange({ min: "", max: "" });
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </Card>

            {/* Products Grid */}
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden border-slate-200">
                    <div className="aspect-square animate-pulse bg-slate-200" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                      <div className="h-8 animate-pulse rounded bg-slate-200" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="border-slate-200 p-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  No products found
                </h3>
                <p className="text-sm text-slate-600">
                  Try adjusting your filters or search query
                </p>
              </Card>
            ) : (
              <>
                <div className="mb-4 text-sm text-slate-600">
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-slate-200 bg-primary-600 py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Ready to Start Trading?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
              Join thousands of businesses already using TradePal to expand
              their reach and grow their revenue.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white bg-transparent text-white hover:bg-white hover:text-primary-600 sm:w-auto"
                >
                  Create Free Account
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  className="w-full bg-white text-primary-600 hover:bg-primary-50 sm:w-auto"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
