const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stockQuantity: number;
  status: ProductStatus;
  createdAt: number;
};

export type ProductInput = Omit<Product, "id" | "createdAt">;

export type ProductFilters = {
  search?: string;
  category?: string;
  status?: ProductStatus | "all";
  minPrice?: string;
  maxPrice?: string;
};

function buildQueryString(filters?: ProductFilters) {
  if (!filters) {
    return "";
  }

  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.category && filters.category !== "all") {
    searchParams.set("category", filters.category);
  }

  if (filters.status && filters.status !== "all") {
    searchParams.set("status", filters.status);
  }

  if (filters.minPrice?.trim()) {
    searchParams.set("minPrice", filters.minPrice.trim());
  }

  if (filters.maxPrice?.trim()) {
    searchParams.set("maxPrice", filters.maxPrice.trim());
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/api/products${buildQueryString(filters)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  return (await response.json()) as Product[];
}

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load product");
  }

  return (await response.json()) as Product;
}

export async function addProduct(productInput: ProductInput): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productInput),
  });

  if (!response.ok) {
    throw new Error("Failed to add product");
  }

  const product = (await response.json()) as Product;
  window.dispatchEvent(new CustomEvent("products:changed"));
  return product;
}

export async function updateProduct(id: string, productInput: Partial<ProductInput>): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productInput),
  });

  if (!response.ok) {
    throw new Error("Failed to update product");
  }

  const product = (await response.json()) as Product;
  window.dispatchEvent(new CustomEvent("products:changed"));
  return product;
}

export async function deleteProduct(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete product");
  }

  window.dispatchEvent(new CustomEvent("products:changed"));
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 2 }).format(
    amount,
  );
}