"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { CART_CHANGED_EVENT, getCartCount, getCartItems } from "../lib/cart";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Inventory", href: "/inventory" },
];

function isActivePath(currentPath: string, href: string) {
  if (href === "/") {
    return currentPath === "/";
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex h-20 items-center justify-between">
          <button
            className="inline-flex items-center justify-center text-muted-foreground transition-colors hover:text-gold lg:hidden"
            aria-label="Toggle navigation"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-3xl tracking-tight text-foreground">
              ShoppyGo<span className="text-gold italic">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs uppercase tracking-[0.2em] transition-colors ${
                    isActive ? "text-gold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Search"
              className="text-muted-foreground transition-colors hover:text-gold"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              aria-label="Account"
              className="hidden text-muted-foreground transition-colors hover:text-gold sm:block"
            >
              <User className="h-[18px] w-[18px]" />
            </button>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative text-muted-foreground transition-colors hover:text-gold"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-primary-foreground">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {open ? (
          <nav className="flex flex-col gap-4 pb-6 lg:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs uppercase tracking-[0.2em] transition-colors ${
                    isActive ? "text-gold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </header>
  );
}