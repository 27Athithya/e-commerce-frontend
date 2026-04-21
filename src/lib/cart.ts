import type { Product } from "./products";

const CART_STORAGE_KEY = "ecommerce:cart";
const CART_CHANGED_EVENT = "cart:changed";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

export function addToCart(product: Product): CartItem[] {
  const current = getCartItems();
  const existing = current.find((item) => item.productId === product.id);

  let next: CartItem[];
  if (existing) {
    next = current.map((item) =>
      item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
    );
  } else {
    next = [
      ...current,
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      },
    ];
  }

  persistCart(next);
  return next;
}

export function updateCartItemQuantity(productId: string, quantity: number): CartItem[] {
  const current = getCartItems();
  const safeQuantity = Math.max(0, Math.floor(quantity));

  const next =
    safeQuantity === 0
      ? current.filter((item) => item.productId !== productId)
      : current.map((item) => (item.productId === productId ? { ...item, quantity: safeQuantity } : item));

  persistCart(next);
  return next;
}

export function clearCart() {
  persistCart([]);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function persistCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number"
  );
}

export { CART_CHANGED_EVENT };
