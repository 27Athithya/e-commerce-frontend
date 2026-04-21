"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Sparkles } from "lucide-react";
import { PageFooter } from "../../components/PageFooter";
import { PageHeader } from "../../components/PageHeader";
import { SiteHeader } from "../../components/SiteHeader";
import { Button } from "../../components/ui/button";
import { Toaster } from "../../components/ui/sonner";
import { addToCart } from "../../lib/cart";
import { formatPrice, getProducts, type Product } from "../../lib/products";
import { toast } from "sonner";

const fallbackImage =
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80&auto=format&fit=crop";

type SortMode = "featured" | "price-asc" | "price-desc";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortMode>("featured");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
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

  const categories = useMemo(() => {
    return ["All", ...new Set(products.map((product) => product.category))];
  }, [products]);

  const visibleProducts = useMemo(() => {
    let list = category === "All" ? products : products.filter((product) => product.category === category);

    if (sort === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    }

    if (sort === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [category, products, sort]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Toaster />

      <main>
        <PageHeader
          eyebrow="The Collection"
          title="All products"
          subtitle="Filter by category, sort by value, and explore your full catalog with the same premium browsing experience."
        />

        <div className="mx-auto max-w-[1400px] px-4 pb-8 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-6 border-y border-border py-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.25em] transition-colors ${
                    category === item
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Sort</label>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortMode)}
                className="rounded border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-10">
          {loading ? (
            <div className="rounded-md border border-dashed border-border py-16 text-center text-muted-foreground">
              Loading products...
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="rounded-md border border-dashed border-border py-16 text-center text-muted-foreground">
              No products in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <article key={product.id} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                    <img
                      src={product.image || fallbackImage}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      onError={(event) => {
                        (event.currentTarget as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                    <div className="absolute left-3 top-3 rounded bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground">
                      {product.category}
                    </div>
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-2xl text-foreground transition-colors group-hover:text-gold">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        Stock {product.stockQuantity}
                      </p>
                    </div>
                    <div className="font-serif text-xl text-foreground">{formatPrice(product.price)}</div>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

                  <Button
                    onClick={() => {
                      addToCart(product);
                      toast.success(`${product.name} added to cart`);
                    }}
                    className="mt-4 h-auto w-full bg-foreground px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-background transition-colors hover:bg-gold hover:text-primary-foreground"
                  >
                    {sort === "featured" ? <Sparkles className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                    Add to bag
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
