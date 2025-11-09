"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Package as PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { productApi } from "@/lib/api";

interface Product {
  id: string;
  title: string;
  description: string;
  handle: string;
  status: string;
  created_at: string;
  updated_at: string;
  variants?: Array<{
    id: string;
    title: string;
    prices?: Array<{
      amount: number;
      currency_code: string;
    }>;
  }>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = (await productApi.list()) as { products: Product[] };
      setProducts(response.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      // TODO: Implement delete API call
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200" />
        </div>
        <Card className="border-slate-200 p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 flex-1 animate-pulse rounded bg-slate-200" />
                <div className="h-12 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-12 w-24 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your product catalog
          </p>
        </div>
        <Link href="/seller/products/new">
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-error-200 bg-error-50 p-4 text-sm text-error-800">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <Card className="border-slate-200 p-12 text-center">
          <PackageIcon className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            No products yet
          </h3>
          <p className="mb-6 text-sm text-slate-600">
            Get started by creating your first product
          </p>
          <Link href="/seller/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {products.map((product) => {
                  const price = product.variants?.[0]?.prices?.[0];
                  const priceDisplay = price
                    ? `${(price.amount / 100).toFixed(2)} ${price.currency_code.toUpperCase()}`
                    : "N/A";

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            {product.title}
                          </div>
                          <div className="text-sm text-slate-500">
                            {product.handle}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            product.status === "published"
                              ? "bg-success-100 text-success-700"
                              : "bg-warning-100 text-warning-700"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {priceDisplay}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <Link href={`/seller/products/${product.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-error-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
