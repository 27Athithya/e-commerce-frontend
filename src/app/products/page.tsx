"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Sparkles } from "lucide-react";
import { SiteHeader } from "../../components/SiteHeader";
import { Button } from "../../components/ui/button";
import { Toaster } from "../../components/ui/sonner";
import { addToCart } from "../../lib/cart";
import { formatPrice, getProducts, type Product } from "../../lib/products";
import { toast } from "sonner";

const fallbackImage =
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80&auto=format&fit=crop";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getProducts({ status: "active" });
        if (active) {
          setProducts(data);
        }
      } catch {
        if (active) {
          setProducts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Toaster />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 rounded-3xl border border-border/70 bg-white/70 p-6 shadow-[var(--shadow-soft)] backdrop-blur">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/60 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            <Sparkles className="h-3.5 w-3.5" /> Collection
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Shop All Products</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Discover essentials and trending picks with transparent LKR pricing.
          </p>
        </div>

        {loading ? (
          <div className="rounded-[1.5rem] border border-dashed border-border p-12 text-center text-muted-foreground">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border p-12 text-center text-muted-foreground">
            No products are currently available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={product.image || fallbackImage}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).src = fallbackImage;
                    }}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">{product.name}</h2>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-lg font-semibold text-blue-700">{formatPrice(product.price)}</span>
                    <Button
                      className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-400/30 hover:opacity-95"
                      onClick={() => {
                        addToCart(product);
                        toast.success(`${product.name} added to cart`);
                        router.push("/cart");
                      }}
                    >
                      <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
