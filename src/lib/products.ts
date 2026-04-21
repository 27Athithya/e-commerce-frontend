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

type ProductApiShape = Partial<Product> & {
  stock?: unknown;
  createdAt?: unknown;
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

  const products = (await response.json()) as ProductApiShape[];
  return products.map((product) => normalizeProduct(product));
}

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load product");
  }

  const product = (await response.json()) as ProductApiShape;
  return normalizeProduct(product);
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

function normalizeProduct(product: ProductApiShape): Product {
  const stockFromApi = product.stockQuantity ?? product.stock;
  const numericStock = Number(stockFromApi);
  const stockQuantity = Number.isFinite(numericStock) && numericStock > 0 ? Math.trunc(numericStock) : 0;

  const createdAtRaw = product.createdAt;
  const createdAtNumber =
    typeof createdAtRaw === "number"
      ? createdAtRaw
      : typeof createdAtRaw === "string"
        ? Date.parse(createdAtRaw)
        : Number.NaN;

  return {
    id: String(product.id ?? ""),
    name: String(product.name ?? ""),
    description: String(product.description ?? ""),
    price: Number(product.price ?? 0),
    image: String(product.image ?? ""),
    category: String(product.category ?? "General"),
    stockQuantity,
    status: normalizeStatus(product.status),
    createdAt: Number.isFinite(createdAtNumber) ? createdAtNumber : Date.now(),
  };
}

function normalizeStatus(status: unknown): ProductStatus {
  if (status === "draft" || status === "active" || status === "archived") {
    return status;
  }

  return "active";
}