"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, ShoppingBag } from "lucide-react";
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

  const subtotal = getCartSubtotal(items);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 rounded-3xl border border-border/70 bg-white/70 p-6 shadow-[var(--shadow-soft)] backdrop-blur">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your Cart</h1>
            <p className="mt-1 text-sm text-muted-foreground">Review selected products before checkout.</p>
          </div>
          {items.length > 0 ? (
            <Button variant="outline" className="rounded-full bg-white" onClick={() => clearCart()}>
              Clear cart
            </Button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4 rounded-full">
              <Link href="/products">Go to products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.5fr_0.75fr]">
            <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-[var(--shadow-soft)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-blue-50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.productId} className="border-t border-border/70 transition hover:bg-muted/30">
                        <td className="px-4 py-4 font-medium">{item.name}</td>
                        <td className="px-4 py-4">
                          <div className="inline-flex items-center rounded-full border border-border bg-white">
                            <button
                              className="px-3 py-1 text-base text-blue-700"
                              aria-label={`Decrease quantity for ${item.name}`}
                              onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="min-w-10 text-center font-semibold">{item.quantity}</span>
                            <button
                              className="px-3 py-1 text-base text-blue-700"
                              aria-label={`Increase quantity for ${item.name}`}
                              onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4">{formatPrice(item.price)}</td>
                        <td className="px-4 py-4 font-semibold text-blue-700">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="h-fit rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <ShoppingBag className="h-4 w-4" /> Order Summary
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Items total</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
                <span className="text-base font-semibold">Total</span>
                <span className="text-xl font-semibold text-blue-700">{formatPrice(subtotal)}</span>
              </div>
              <Button className="mt-5 w-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-95">
                <CreditCard className="mr-1.5 h-4 w-4" /> Checkout
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
