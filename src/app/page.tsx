"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Truck, WalletCards } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { Button } from "../components/ui/button";
import { Toaster } from "../components/ui/sonner";
import { formatPrice, getProducts, type Product } from "../lib/products";

const tagline = "Everything you love, delivered in a click.";
const fallbackImage =
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80&auto=format&fit=crop";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await getProducts({ status: "active" });
        if (active) {
          setProducts(data.slice(0, 4));
        }
      } catch {
        if (active) {
          setProducts([]);
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

      <main>
        <section className="border-b border-border/70" style={{ background: "var(--gradient-hero)" }}>
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-blue-300/60 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 backdrop-blur">
                Welcome to modern ecommerce
              </span>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                ShoppyGo
              </h1>
              <p className="mt-3 text-lg font-medium text-blue-700 sm:text-xl">{tagline}</p>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Shop trending products, manage your cart in seconds, and keep inventory operations efficient from one streamlined platform.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white">
                  <Link href="/products">
                    Start Shopping <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full bg-white/80">
                  <Link href="/inventory">Manage Inventory</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 rounded-[2rem] border border-border/70 bg-white/70 p-4 shadow-[var(--shadow-elevated)] backdrop-blur sm:grid-cols-2">
              {[
                { icon: Truck, title: "Fast Delivery", text: "Islandwide dispatch with reliable tracking." },
                { icon: ShieldCheck, title: "Trusted Quality", text: "Curated products from verified sources." },
                { icon: WalletCards, title: "Secure Checkout", text: "Simple, protected payment experience." },
                { icon: ArrowRight, title: "Quick Reorder", text: "Revisit and reorder your favorites instantly." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/70 bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
                  <item.icon className="h-4 w-4 text-blue-600" />
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Featured products</h2>
              <p className="mt-1 text-sm text-muted-foreground">Fresh picks selected for ShoppyGo shoppers.</p>
            </div>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/products">View all products</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
              >
                <img
                  src={product.image || fallbackImage}
                  alt={product.name}
                  className="aspect-[4/3] w-full object-cover"
                  onError={(event) => {
                    (event.currentTarget as HTMLImageElement).src = fallbackImage;
                  }}
                />
                <div className="space-y-2 p-4">
                  <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>
                  <p className="text-base font-semibold text-blue-700">{formatPrice(product.price)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
