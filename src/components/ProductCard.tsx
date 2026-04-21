"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { type Product, deleteProduct, formatPrice } from "../lib/products";
import { toast } from "sonner";

const statusStyles: Record<Product["status"], string> = {
  active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
  draft: "border-amber-500/20 bg-amber-500/10 text-amber-700",
  archived: "border-slate-500/20 bg-slate-500/10 text-slate-600",
};

export function ProductCard({ product }: { product: Product }) {
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(event) => {
            (event.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80";
          }}
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur ${statusStyles[product.status]}`}
          >
            {product.status}
          </span>
          {isLowStock ? (
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 backdrop-blur">
              Low stock
            </span>
          ) : null}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="icon" variant="secondary" asChild className="h-8 w-8 rounded-full shadow-md">
            <Link href={`/products/${product.id}/edit`} aria-label="Edit product">
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="secondary"
            aria-label="Delete product"
            className="h-8 w-8 rounded-full shadow-md"
            onClick={async () => {
              const confirmed = window.confirm(`Delete ${product.name}?`);
              if (!confirmed) {
                return;
              }

              try {
                await deleteProduct(product.id);
                toast.success("Product removed");
              } catch {
                toast.error("Could not remove product");
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          <span>{product.category}</span>
          <span>{product.stockQuantity} in stock</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold leading-snug tracking-tight">{product.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-lg font-semibold tracking-tight">{formatPrice(product.price)}</span>
          <Button size="sm" variant="outline" className="rounded-full" asChild>
            <Link href={`/products/${product.id}/edit`}>Edit product</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
