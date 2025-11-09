import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Building2 } from "lucide-react";

interface ProductCardProps {
  product: {
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
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = product.variants?.[0]?.prices?.[0];
  const priceDisplay = price
    ? `${(price.amount / 100).toFixed(2)} ${price.currency_code.toUpperCase()}`
    : "Contact for price";

  const moq = product.metadata?.min_order_quantity || 1;

  return (
    <Card className="group overflow-hidden border-slate-200 transition-shadow hover:shadow-md">
      <Link href={`/products/${product.handle}`}>
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Building2 className="h-16 w-16 text-slate-300" />
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        {/* Product info */}
        <Link href={`/products/${product.handle}`}>
          <h3 className="mb-1 line-clamp-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-primary-600">
            {product.title}
          </h3>
        </Link>

        {product.description && (
          <p className="mb-3 line-clamp-2 text-sm text-slate-600">
            {product.description}
          </p>
        )}

        {/* Seller info */}
        {product.metadata?.seller_name && (
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="h-3 w-3" />
            <span className="line-clamp-1">{product.metadata.seller_name}</span>
            {product.metadata.seller_location && (
              <>
                <span>•</span>
                <span>{product.metadata.seller_location}</span>
              </>
            )}
          </div>
        )}

        {/* Price and MOQ */}
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <p className="text-lg font-bold text-slate-900">{priceDisplay}</p>
            <p className="text-xs text-slate-500">MOQ: {moq} units</p>
          </div>
        </div>

        {/* Add to cart button */}
        <Button className="w-full" size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
