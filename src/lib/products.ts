const API_BASE_PATH = "/api";
const MOCK_PRODUCTS_STORAGE_KEY = "shoppygo.mock-products";
const MOCK_ID_PREFIX = "mock-";

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_CATEGORIES = [
  "General",
  "Electronics",
  "Gadgets",
  "Accessories",
  "Apparel",
  "Fitness",
  "Footwear",
  "Home",
  "Kitchen",
  "Office",
  "Travel",
] as const;

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
  minStock?: number;
};

type ProductApiShape = Partial<Product> & {
  stock?: unknown;
  createdAt?: unknown;
};

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "mock-noise-cancelling-headphones",
    name: "Aurora Noise-Cancelling Headphones",
    description: "Wireless over-ear headphones with deep bass, soft cushions, and all-day battery life.",
    price: 24990,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80&auto=format&fit=crop",
    category: "Electronics",
    stockQuantity: 18,
    status: "active",
    createdAt: Date.parse("2026-01-10T09:00:00.000Z"),
  },
  {
    id: "mock-smart-watch",
    name: "Pulse Pro Smart Watch",
    description: "Track workouts, heart rate, and notifications in a polished everyday design.",
    price: 18950,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80&auto=format&fit=crop",
    category: "Gadgets",
    stockQuantity: 11,
    status: "active",
    createdAt: Date.parse("2026-01-14T09:00:00.000Z"),
  },
  {
    id: "mock-leather-backpack",
    name: "Summit Leather Backpack",
    description: "Premium carry bag with laptop sleeve, reinforced straps, and travel-ready storage.",
    price: 15990,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop",
    category: "Travel",
    stockQuantity: 7,
    status: "active",
    createdAt: Date.parse("2026-01-18T09:00:00.000Z"),
  },
  {
    id: "mock-wireless-speaker",
    name: "Echo Mini Wireless Speaker",
    description: "Compact Bluetooth speaker with crisp vocals, strong lows, and splash resistance.",
    price: 11990,
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1200&q=80&auto=format&fit=crop",
    category: "Accessories",
    stockQuantity: 24,
    status: "active",
    createdAt: Date.parse("2026-01-22T09:00:00.000Z"),
  },
  {
    id: "mock-ceramic-mug",
    name: "Nordic Ceramic Mug Set",
    description: "Minimal kitchen mug set designed for daily use with a clean matte finish.",
    price: 6990,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=1200&q=80&auto=format&fit=crop",
    category: "Kitchen",
    stockQuantity: 0,
    status: "active",
    createdAt: Date.parse("2026-01-27T09:00:00.000Z"),
  },
  {
    id: "mock-desk-lamp",
    name: "Halo Desk Lamp",
    description: "Adjustable office lamp with warm light modes and a slim brushed-metal frame.",
    price: 8450,
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80&auto=format&fit=crop",
    category: "Office",
    stockQuantity: 13,
    status: "draft",
    createdAt: Date.parse("2026-02-02T09:00:00.000Z"),
  },
];

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

  if (typeof filters.minStock === "number" && Number.isFinite(filters.minStock)) {
    searchParams.set("minStock", String(filters.minStock));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_PATH}/products${buildQueryString(filters)}`, {
      cache: "no-store",
    });

    if (response.ok) {
      const products = (await response.json()) as ProductApiShape[];
      return applyProductFilters(products.map((product) => normalizeProduct(product)), filters);
    }
  } catch {
    // Fall back to sample products when the backend is unavailable.
  }

  return getMockProducts(filters);
}

export async function getProduct(id: string): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_PATH}/products/${id}`, { cache: "no-store" });

    if (response.ok) {
      const product = (await response.json()) as ProductApiShape;
      return normalizeProduct(product);
    }
  } catch {
    // Fall back to sample products when the backend is unavailable.
  }

  const mockProduct = readMockProducts().find((product) => product.id === id);
  if (mockProduct) {
    return mockProduct;
  }

  throw new Error("Failed to load product");
}

export async function addProduct(productInput: ProductInput): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_PATH}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productInput),
    });

    if (response.ok) {
      const product = normalizeProduct((await response.json()) as ProductApiShape);
      window.dispatchEvent(new CustomEvent("products:changed"));
      return product;
    }
  } catch {
    // If the backend is unavailable, add the product to the demo catalog instead.
  }

  const createdProduct: Product = {
    ...productInput,
    id: `${MOCK_ID_PREFIX}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };

  const products = [createdProduct, ...readMockProducts()];
  writeMockProducts(products);
  dispatchProductsChanged();
  return createdProduct;
}

export async function updateProduct(id: string, productInput: Partial<ProductInput>): Promise<Product> {
  if (isMockProductId(id)) {
    const products = readMockProducts();
    const currentProduct = products.find((product) => product.id === id);

    if (!currentProduct) {
      throw new Error("Failed to update product");
    }

    const updatedProduct = normalizeProduct({
      ...currentProduct,
      ...productInput,
      id,
      createdAt: currentProduct.createdAt,
    });

    writeMockProducts(products.map((product) => (product.id === id ? updatedProduct : product)));
    dispatchProductsChanged();
    return updatedProduct;
  }

  const response = await fetch(`${API_BASE_PATH}/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productInput),
  });

  if (!response.ok) {
    throw new Error("Failed to update product");
  }

  const product = normalizeProduct((await response.json()) as ProductApiShape);
  dispatchProductsChanged();
  return product;
}

export async function deleteProduct(id: string) {
  if (isMockProductId(id)) {
    writeMockProducts(readMockProducts().filter((product) => product.id !== id));
    dispatchProductsChanged();
    return;
  }

  const response = await fetch(`${API_BASE_PATH}/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete product");
  }

  dispatchProductsChanged();
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 2 }).format(
    amount,
  );
}

function getMockProducts(filters?: ProductFilters) {
  return applyProductFilters(readMockProducts(), filters);
}

function readMockProducts(): Product[] {
  if (typeof window === "undefined") {
    return cloneProducts(SAMPLE_PRODUCTS);
  }

  try {
    const storedProducts = window.localStorage.getItem(MOCK_PRODUCTS_STORAGE_KEY);
    if (!storedProducts) {
      writeMockProducts(SAMPLE_PRODUCTS);
      return cloneProducts(SAMPLE_PRODUCTS);
    }

    const parsedProducts = JSON.parse(storedProducts) as ProductApiShape[];
    if (!Array.isArray(parsedProducts) || parsedProducts.length === 0) {
      writeMockProducts(SAMPLE_PRODUCTS);
      return cloneProducts(SAMPLE_PRODUCTS);
    }

    return parsedProducts.map((product) => normalizeProduct(product));
  } catch {
    writeMockProducts(SAMPLE_PRODUCTS);
    return cloneProducts(SAMPLE_PRODUCTS);
  }
}

function writeMockProducts(products: Product[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MOCK_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function applyProductFilters(products: Product[], filters?: ProductFilters) {
  if (!filters) {
    return products;
  }

  const searchValue = filters.search?.trim().toLowerCase();
  const minPrice = filters.minPrice?.trim() ? Number(filters.minPrice) : Number.NaN;
  const maxPrice = filters.maxPrice?.trim() ? Number(filters.maxPrice) : Number.NaN;

  return products.filter((product) => {
    if (
      searchValue &&
      !product.name.toLowerCase().includes(searchValue) &&
      !product.description.toLowerCase().includes(searchValue) &&
      !product.category.toLowerCase().includes(searchValue)
    ) {
      return false;
    }

    if (filters.category && filters.category !== "all" && product.category !== filters.category) {
      return false;
    }

    if (filters.status && filters.status !== "all" && product.status !== filters.status) {
      return false;
    }

    if (Number.isFinite(minPrice) && product.price < minPrice) {
      return false;
    }

    if (Number.isFinite(maxPrice) && product.price > maxPrice) {
      return false;
    }

    if (typeof filters.minStock === "number" && Number.isFinite(filters.minStock) && product.stockQuantity < filters.minStock) {
      return false;
    }

    return true;
  });
}

function cloneProducts(products: Product[]) {
  return products.map((product) => ({ ...product }));
}

function dispatchProductsChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("products:changed"));
}

function isMockProductId(id: string) {
  return id.startsWith(MOCK_ID_PREFIX);
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
