"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { PageFooter } from "../components/PageFooter";
import { SiteHeader } from "../components/SiteHeader";
import { Button } from "../components/ui/button";
import { Toaster } from "../components/ui/sonner";
import { addToCart } from "../lib/cart";
import { formatPrice, getProducts, type Product } from "../lib/products";
import { toast } from "sonner";

const fallbackImage =
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80&auto=format&fit=crop";

const categoryCards = [
  {
    title: "Smart Audio",
    subtitle: "Headphones, speakers",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80&auto=format&fit=crop",
  },
  {
    title: "Studio Mobile",
    subtitle: "Phones and accessories",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80&auto=format&fit=crop",
  },
  {
    title: "Wearables",
    subtitle: "Watches and trackers",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80&auto=format&fit=crop",
  },
  {
    title: "Workspace",
    subtitle: "Desks and gear",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&auto=format&fit=crop",
  },
];

const heroStats = [
  { label: "Vendors", value: "1.2k+" },
  { label: "Products", value: "12k+" },
  { label: "Ship time", value: "3-5 days" },
];

const trustItems = [
  {
    icon: ShieldCheck,
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
        const data = await getProducts({ minStock: 1 });
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
    <div className="min-h-screen">
      <SiteHeader />
      <Toaster />

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="mx-auto grid max-w-[1400px] gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-28 lg:pt-24">
            <div className="order-2 lg:order-1 lg:col-span-5">
              <div className="mb-8 flex items-center gap-3">
                <div className="h-px w-10 bg-gold" />
                <span className="text-[11px] uppercase tracking-[0.3em] text-gold">The 2026 Collection</span>
              </div>

              <h1 className="font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-tight text-foreground">
                Shop,
                <br />
                <span className="text-gradient-gold italic">refined</span>
                <br />
                for scale.
              </h1>

              <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground lg:text-lg">
                Discover curated electronics with marketplace-grade reliability, predictable delivery, and premium presentation.
              </p>

              <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Button
                  asChild
                  className="group h-auto bg-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] text-background transition-colors hover:bg-gold hover:text-primary-foreground"
                >
                  <Link href="/products">
                    Shop the collection
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Link
                  href="/inventory"
                  className="border-b border-border pb-1 text-xs uppercase tracking-[0.25em] text-foreground transition-colors hover:border-gold hover:text-gold"
                >
                  Manage inventory
                </Link>
              </div>

              <div className="mt-16 grid max-w-md grid-cols-3 gap-6">
                {heroStats.map((item) => (
                  <div key={item.label}>
                    <div className="font-serif text-3xl text-gold">{item.value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2 lg:col-span-7">
              <div
                className="absolute inset-0 -z-10 blur-3xl opacity-60"
                style={{
                  background:
                    "radial-gradient(ellipse at center, oklch(0.78 0.12 75 / 0.35), transparent 65%)",
                }}
              />
              <div className="relative aspect-[5/4] overflow-hidden rounded-sm shadow-luxury">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&q=80&auto=format&fit=crop"
                  alt="Electronics banner"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div className="border border-border bg-background/40 px-5 py-3 backdrop-blur-md">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      ShoppyGo Select
                    </div>
                    <div className="font-serif text-2xl text-foreground">Live curated deals</div>
                  </div>
                  <div className="hidden text-[10px] uppercase tracking-[0.25em] text-gold/80 sm:block">
                    Edition 026 / Marketplace
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-y border-border bg-background/40 backdrop-blur-sm">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:px-6 lg:px-10">
              <span>Free island-wide shipping</span>
              <span className="hidden sm:inline">Buyer protection</span>
              <span>Supplier verification</span>
              <span className="hidden md:inline">30-day returns</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Curated</span>
              <h2 className="mt-4 font-serif text-5xl tracking-tight text-foreground lg:text-6xl">
                Marketplace <span className="italic">categories</span>
              </h2>
            </div>
            <p className="max-w-sm text-muted-foreground">
              Browse high-performing product clusters selected for reliability, margin, and demand stability.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {categoryCards.map((category) => (
              <Link key={category.title} href="/products" className="group cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <div className="mt-5 flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      {category.subtitle}
                    </div>
                    <h3 className="mt-1 font-serif text-2xl text-foreground transition-colors group-hover:text-gold">
                      {category.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-border py-24 lg:py-32">
          <div className="mx-auto max-w-[1100px] px-4 text-center sm:px-6 lg:px-10">
            <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Our promise</span>
            <p className="mt-10 font-serif text-3xl leading-[1.2] text-foreground md:text-4xl lg:text-5xl">
              We do not just list products. We curate dependable inventory pipelines so each order feels
              <span className="text-gradient-gold italic"> intentional </span>
              from discovery to delivery.
            </p>

            <div className="mt-14 grid gap-4 text-left sm:grid-cols-3">
              {trustItems.map((item) => (
                <div key={item.title} className="rounded-md border border-border bg-card p-6 shadow-soft">
                  <item.icon className="h-5 w-5" />
                  <h3 className="mt-4 font-serif text-2xl text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 inline-flex items-center gap-4">
              <div className="h-px w-10 bg-gold" />
              <div>
                <div className="font-serif text-lg italic text-foreground">Operations Team</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  ShoppyGo Commerce Network
                </div>
              </div>
              <div className="h-px w-10 bg-gold" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10 lg:py-28">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Featured</span>
              <h2 className="mt-4 font-serif text-5xl tracking-tight text-foreground lg:text-6xl">
                Top movers
              </h2>
              <p className="mt-2 text-muted-foreground">Fast-performing products selected from live inventory.</p>
            </div>
            <Link
              href="/products"
              className="text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-gold"
            >
              View all products
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                  <img
                    src={product.image || fallbackImage}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    loading="lazy"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).src = fallbackImage;
                    }}
                  />
                  <span className="absolute left-3 top-3 rounded bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground">
                    {product.category}
                  </span>
                </div>

                <div className="mt-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-2xl text-foreground transition-colors group-hover:text-gold">
                      {product.name}
                    </h3>
                  </div>
                  <div className="font-serif text-xl text-foreground">{formatPrice(product.price)}</div>
                </div>

                <Button
                  onClick={() => {
                    addToCart(product);
                    toast.success(`${product.name} added to cart`);
                  }}
                  className="mt-4 h-auto w-full bg-foreground px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-background transition-colors hover:bg-gold hover:text-primary-foreground"
                >
                  <Sparkles className="h-4 w-4" /> Add to bag
                </Button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
