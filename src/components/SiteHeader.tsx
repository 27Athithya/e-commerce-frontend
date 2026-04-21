"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { CART_CHANGED_EVENT, getCartCount, getCartItems } from "../lib/cart";

export function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      setCartCount(getCartCount(getCartItems()));
    };

    sync();
    window.addEventListener(CART_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, sync);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/30">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">ShoppyGo</span>
            <span className="block text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Smart Shopping Hub
            </span>
          </div>
        </Link>

        <div className="hidden flex-1 items-center gap-3 lg:flex">
          <div className="flex flex-1 items-center overflow-hidden rounded-full border border-border/70 bg-white/80 shadow-[var(--shadow-soft)]">
            <span className="px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              All
            </span>
            <div className="h-6 w-px bg-border/70" />
            <input
              type="search"
              placeholder="Search products, suppliers, and brands"
              className="h-10 flex-1 bg-transparent px-4 text-sm text-foreground outline-none"
            />
            <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              <Search className="h-4 w-4" /> Search
            </button>
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/products"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Products
          </Link>
          <Link
            href="/cart"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Cart ({cartCount})
          </Link>
          <Link
            href="/inventory"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
          >
            Inventory
          </Link>
        </nav>
      </div>
    </header>
  );
}