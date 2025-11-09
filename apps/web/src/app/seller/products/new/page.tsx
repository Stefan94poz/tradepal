"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    handle: "",
    price: "",
    currency: "USD",
    minOrderQuantity: "1",
    bulkPrice: "",
    bulkQuantity: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate handle from title
    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        handle: value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: Implement product creation API call
      // await productApi.create(formData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      router.push("/seller/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/seller/products"
          className="mb-4 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Add New Product
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Fill in the details to list a new product
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-error-200 bg-error-50 p-4 text-sm text-error-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Basic Information */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Name *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Premium Cotton T-Shirt"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="handle">URL Handle *</Label>
              <Input
                id="handle"
                name="handle"
                value={formData.handle}
                onChange={handleChange}
                placeholder="premium-cotton-t-shirt"
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-500">
                Auto-generated from product name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                rows={4}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Unit Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* B2B-Specific Fields */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>B2B Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minOrderQuantity">Minimum Order Quantity *</Label>
              <Input
                id="minOrderQuantity"
                name="minOrderQuantity"
                type="number"
                min="1"
                value={formData.minOrderQuantity}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-500">
                Minimum units buyers must purchase
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bulkQuantity">Bulk Quantity Threshold</Label>
                <Input
                  id="bulkQuantity"
                  name="bulkQuantity"
                  type="number"
                  min="1"
                  value={formData.bulkQuantity}
                  onChange={handleChange}
                  placeholder="100"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulkPrice">Bulk Price</Label>
                <Input
                  id="bulkPrice"
                  name="bulkPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.bulkPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Optional: Offer discounted pricing for bulk orders
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Product"}
          </Button>
          <Link href="/seller/products">
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
