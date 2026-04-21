"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { CART_CHANGED_EVENT, getCartCount, getCartItems } from "../lib/cart";
import { Button } from "./ui/button";

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
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/30">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">ShoppyGo</span>
            <span className="block text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Smart Shopping Hub
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
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
          <Button asChild className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-400/35 hover:opacity-95">
            <Link href="/add-product">Add Product</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}