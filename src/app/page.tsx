"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Clock, ShieldCheck, Store, Truck } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { Button } from "../components/ui/button";
import { Toaster } from "../components/ui/sonner";
import { addToCart } from "../lib/cart";
import { formatPrice, getProducts, type Product } from "../lib/products";
import { toast } from "sonner";

const tagline = "Your one-stop electronic market with verified sellers and fast fulfillment.";
const fallbackImage =
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80&auto=format&fit=crop";

const topBarItems = [
  { icon: Truck, title: "Free shipping", description: "Orders over LKR 15,000" },
  { icon: ShieldCheck, title: "Buyer protection", description: "Secure payments" },
  { icon: BadgeCheck, title: "Verified sellers", description: "Trusted marketplace" },
];

const categoryNav = [
  "All categories",
  "Electronics",
  "Home & Kitchen",
  "Apparel",
  "Office",
  "Travel",
  "Fitness",
  "Accessories",
];

const heroHighlights = [
  { label: "Suppliers", value: "1.2k+" },
  { label: "Products", value: "12k+" },
  { label: "Ship time", value: "3-5 days" },
];

const categoryCards = [
  {
    title: "Smart Audio",
    subtitle: "Headphones, speakers",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80&auto=format&fit=crop",
  },
  {
    title: "Home Office",
    subtitle: "Desks and lighting",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=80&auto=format&fit=crop",
  },
  {
    title: "Wearables",
    subtitle: "Watches & fitness",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80&auto=format&fit=crop",
  },
  {
    title: "Kitchen", 
    subtitle: "Everyday essentials",
    image:
      "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?w=1200&q=80&auto=format&fit=crop",
  },
];

const assuranceItems = [
  {
    icon: Store,
    title: "Curated suppliers",
    text: "Only vetted suppliers with verified catalogs.",
  },
  {
    icon: Truck,
    title: "Fast fulfillment",
    text: "Reliable delivery with accurate ETAs.",
  },
  {
    icon: ShieldCheck,
    title: "Trade assurance",
    text: "Protection on every order from payment to delivery.",
  },
];

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
      <div className="border-b border-border/60 bg-white/85">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <div className="flex flex-wrap items-center gap-4">
            {topBarItems.map((item) => (
              <div key={item.title} className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <item.icon className="h-4 w-4" />
                </span>
                <div className="leading-tight">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {item.title}
                  </div>
                  <div className="text-xs font-semibold text-foreground">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            <Clock className="h-4 w-4" /> Daily deals up to 35% off
          </div>
        </div>
      </div>
      <SiteHeader />
      <div className="border-b border-border/60 bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:px-6">
          {categoryNav.map((category) => (
            <span
              key={category}
              className="rounded-full border border-border/60 bg-white/90 px-3 py-1 transition hover:border-amber-200 hover:text-amber-700"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
      <Toaster />

      <main className="space-y-16 pb-20">
        <section className="border-b border-border/70" style={{ background: "var(--gradient-hero)" }}>
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6 animate-fade-up">
              <span className="inline-flex w-fit items-center rounded-full border border-amber-200/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 backdrop-blur">
                Top-rated electronics marketplace
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                  Your one-stop electronic market.
                </h1>
                <p className="text-lg font-medium text-amber-700 sm:text-xl">{tagline}</p>
              </div>
              <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                Shop trusted electronics, track inventory in real time, and keep every order protected with reliable shipping.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/30 hover:opacity-95"
                >
                  <Link href="/products">
                    Shop now <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full bg-white/80">
                  <Link href="/inventory">Manage inventory</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {heroHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/70 bg-white/80 px-4 py-3 shadow-[var(--shadow-soft)]"
                  >
                    <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] animate-fade-up-delay-1">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-white/80 shadow-[var(--shadow-elevated)]">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&q=80&auto=format&fit=crop"
                  alt="Electronics banner"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Block Friday</div>
                  <div className="mt-2 text-sm font-semibold text-foreground">Up to 40% off smart essentials</div>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-white/80 shadow-[var(--shadow-soft)]">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format&fit=crop"
                    alt="Audio deals"
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/70 bg-white/85 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Audio picks</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">Noise-canceling up to 30% off</div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-white/80 shadow-[var(--shadow-soft)]">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format&fit=crop"
                    alt="Smart wear"
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/70 bg-white/85 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Smart wear</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">Best sellers from LKR 5,900</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 sm:px-6 animate-fade-up-delay-2">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Shop by category</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Find what is trending across top marketplace categories.
              </p>
            </div>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/products">Explore all</Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categoryCards.map((category) => (
              <Link
                key={category.title}
                href="/products"
                className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="space-y-1 p-4">
                  <h3 className="text-base font-semibold text-foreground">{category.title}</h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{category.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-3">
            {assuranceItems.map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Featured products</h2>
              <p className="mt-1 text-sm text-muted-foreground">Top picks for fast-moving inventory.</p>
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
                <div className="relative">
                  <img
                    src={product.image || fallbackImage}
                    alt={product.name}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).src = fallbackImage;
                    }}
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                    Hot
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-amber-700">{formatPrice(product.price)}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        addToCart(product);
                        toast.success(`${product.name} added to cart`);
                      }}
                    >
                      Add to cart
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
