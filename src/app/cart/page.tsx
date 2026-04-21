"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { PageFooter } from "../../components/PageFooter";
import { PageHeader } from "../../components/PageHeader";
import { SiteHeader } from "../../components/SiteHeader";
import { Button } from "../../components/ui/button";
import {
  CART_CHANGED_EVENT,
  clearCart,
  getCartItems,
  getCartSubtotal,
  updateCartItemQuantity,
  type CartItem,
} from "../../lib/cart";
import { formatPrice } from "../../lib/products";

const fallbackImage =
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80&auto=format&fit=crop";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const sync = () => {
      setItems(getCartItems());
    };

    sync();
    window.addEventListener(CART_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, sync);
    };
  }, []);

  const subtotal = useMemo(() => getCartSubtotal(items), [items]);
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <PageHeader
          eyebrow="Your selection"
          title="Shopping bag"
          subtitle={
            items.length > 0
              ? `${items.length} item${items.length > 1 ? "s" : ""} reserved in your cart.`
              : "Your cart is currently empty."
          }
        />

        <div className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-10">
          {items.length === 0 ? (
            <div className="border-y border-border py-20 text-center">
              <p className="font-serif text-3xl text-foreground">Your bag is empty.</p>
              <p className="mt-2 text-muted-foreground">Begin with the latest from the collection.</p>
              <Button
                asChild
                className="mt-8 h-auto bg-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] text-background transition-colors hover:bg-gold hover:text-primary-foreground"
              >
                <Link href="/products">
                  Browse products <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="border-y border-border">
                  {items.map((item) => (
                    <article key={item.productId} className="flex gap-6 border-b border-border py-6 last:border-b-0">
                      <div className="h-32 w-32 shrink-0 overflow-hidden rounded bg-muted">
                        <img
                          src={item.image || fallbackImage}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(event) => {
                            (event.currentTarget as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                              Cart item
                            </div>
                            <h3 className="mt-1 font-serif text-2xl text-foreground">{item.name}</h3>
                          </div>
                          <button
                            aria-label={`Remove ${item.name}`}
                            onClick={() => updateCartItemQuantity(item.productId, 0)}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-end justify-between pt-4">
                          <div className="flex items-center rounded border border-border">
                            <button
                              onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                              className="px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
                              aria-label={`Decrease quantity for ${item.name}`}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <div className="w-8 text-center text-sm">{item.quantity}</div>
                            <button
                              onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                              className="px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
                              aria-label={`Increase quantity for ${item.name}`}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="font-serif text-xl text-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="lg:col-span-1">
                <div className="sticky top-28 rounded-md border border-border bg-card p-8 shadow-soft">
                  <h2 className="font-serif text-2xl text-foreground">Order summary</h2>

                  <dl className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd className="text-foreground">{formatPrice(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Shipping</dt>
                      <dd className="text-foreground">
                        {shipping === 0 ? "Complimentary" : formatPrice(shipping)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Estimated tax</dt>
                      <dd className="text-foreground">Calculated at checkout</dd>
                    </div>
                  </dl>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Total</span>
                    <span className="font-serif text-3xl text-foreground">{formatPrice(total)}</span>
                  </div>

                  <button className="mt-8 w-full bg-foreground py-4 text-xs uppercase tracking-[0.25em] text-background transition-colors hover:bg-gold hover:text-primary-foreground">
                    <ShoppingBag className="mr-2 inline h-4 w-4" /> Proceed to checkout
                  </button>

                  <Button
                    variant="outline"
                    className="mt-4 w-full text-[10px] uppercase tracking-[0.25em]"
                    onClick={() => clearCart()}
                  >
                    Clear bag
                  </Button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
