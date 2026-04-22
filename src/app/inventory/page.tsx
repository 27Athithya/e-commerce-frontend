"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, Package, Pencil, Plus, Search, Trash2, TrendingUp, X } from "lucide-react";
import { PageFooter } from "../../components/PageFooter";
import { PageHeader } from "../../components/PageHeader";
import { SiteHeader } from "../../components/SiteHeader";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Toaster } from "../../components/ui/sonner";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  addProduct,
  deleteProduct,
  formatPrice,
  getProducts,
  updateProduct,
  type ProductInput,
  type ProductStatus,
  type Product,
} from "../../lib/products";
import { toast } from "sonner";

type EditableForm = {
  name: string;
  price: string;
  stockQuantity: string;
};

type AddProductForm = {
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stockQuantity: string;
  status: ProductStatus;
};

const defaultAddForm: AddProductForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  category: "General",
  stockQuantity: "0",
  status: "active",
};

const fallbackImage =
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80&auto=format&fit=crop";

function toForm(product: Product): EditableForm {
  return {
    name: product.name,
    price: String(product.price),
    stockQuantity: String(product.stockQuantity),
  };
}

function formatStatNumber(value: number) {
  return new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<EditableForm | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<AddProductForm>(defaultAddForm);
  const [saving, setSaving] = useState(false);

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
          toast.error("Could not load inventory");
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

  const stats = useMemo(() => {
    const totalUnits = products.reduce((sum, product) => sum + (product.stockQuantity || 0), 0);
    const totalValue = products.reduce(
      (sum, product) => sum + (product.stockQuantity || 0) * product.price,
      0,
    );
    const outOfStockCount = products.filter((product) => product.stockQuantity === 0).length;
    const lowCount = products.filter(
      (product) => product.stockQuantity > 0 && product.stockQuantity <= 10,
    ).length;

    return {
      skuCount: products.length,
      totalUnits,
      totalValue,
      outOfStockCount,
      lowCount,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const value = query.trim().toLowerCase();

    return products.filter((product) => {
      if (
        value &&
        !product.name.toLowerCase().includes(value) &&
        !product.category.toLowerCase().includes(value)
      ) {
        return false;
      }

      if (stockFilter === "low" && product.stockQuantity > 10) {
        return false;
      }

      if (stockFilter === "out" && product.stockQuantity > 0) {
        return false;
      }

      return true;
    });
  }, [products, query, stockFilter]);

  const statCards = [
    { icon: Boxes, label: "SKUs", value: stats.skuCount.toString() },
    { icon: Package, label: "Units in stock", value: stats.totalUnits.toString() },
    {
      icon: AlertTriangle,
      label: "Out of stock",
      value: stats.outOfStockCount.toString(),
      warn: stats.outOfStockCount > 0,
    },
    {
      icon: AlertTriangle,
      label: "Low stock",
      value: stats.lowCount.toString(),
      warn: stats.lowCount > 0,
    },
    { icon: TrendingUp, label: "Catalog value", value: formatStatNumber(stats.totalValue) },
  ];

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm(toForm(product));
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setForm(null);
    setSaving(false);
  };

  const openAddModal = () => {
    setAddForm(defaultAddForm);
    setIsAdding(true);
  };

  const closeAddModal = () => {
    setIsAdding(false);
    setAddForm(defaultAddForm);
    setSaving(false);
  };

  const saveEdit = async () => {
    if (!editingProduct || !form) {
      return;
    }

    const parsedPrice = Number(form.price);
    const parsedStock = Number(form.stockQuantity);

    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Enter a valid price");
      return;
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      toast.error("Enter a valid stock quantity");
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: parsedPrice,
      stockQuantity: parsedStock,
    };

    setSaving(true);
    try {
      const updated = await updateProduct(editingProduct.id, payload);
      setProducts((current) => current.map((product) => (product.id === updated.id ? updated : product)));
      toast.success("Product updated");
      closeEditModal();
    } catch {
      toast.error("Could not update product");
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Delete ${product.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast.success("Product deleted");
    } catch {
      toast.error("Could not delete product");
    }
  };

  const saveAdd = async () => {
    const name = addForm.name.trim();
    const description = addForm.description.trim();
    const category = addForm.category.trim();
    const image = addForm.image.trim();
    const parsedPrice = Number(addForm.price);
    const parsedStock = Number(addForm.stockQuantity);

    if (!name) {
      toast.error("Product name is required");
      return;
    }

    if (!description || description.length < 5) {
      toast.error("Description must be at least 5 characters");
      return;
    }

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Enter a valid price");
      return;
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      toast.error("Enter a valid stock quantity");
      return;
    }

    const payload: ProductInput = {
      name,
      description,
      price: parsedPrice,
      image: image || fallbackImage,
      category: category || "General",
      stockQuantity: Math.trunc(parsedStock),
      status: addForm.status,
    };

    setSaving(true);
    try {
      const created = await addProduct(payload);
      setProducts((current) => [created, ...current]);
      toast.success("Product added");
      closeAddModal();
    } catch {
      toast.error("Could not add product");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Toaster />

      <main>
        <PageHeader
          eyebrow="Atelier"
          title="Inventory"
          subtitle="Monitor stock health, catalog value, and critical low inventory from one operations view."
        />

        <div className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-10">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-gold">
              <Boxes className="h-3.5 w-3.5" /> Admin view
            </div>
            <Button
              className="h-auto w-full bg-foreground px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-background transition-colors hover:bg-gold hover:text-primary-foreground sm:w-auto"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4" /> Add product
            </Button>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:gap-6">
            {statCards.map((item) => (
              <div key={item.label} className="rounded-md border border-border bg-card p-5 shadow-soft sm:p-6">
                <item.icon className={`h-5 w-5 ${item.warn ? "text-destructive" : "text-gold"}`} />
                <div className="mt-4 min-w-0 whitespace-nowrap text-[clamp(1.25rem,1.8vw,2rem)] font-semibold leading-none tracking-tight text-foreground [font-variant-numeric:tabular-nums]">
                  {item.value}
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-md border border-border bg-card shadow-soft">
            <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by product name or category..."
                  className="w-full rounded border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-gold"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", "low", "out"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setStockFilter(item)}
                    className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.25em] transition-colors ${
                      stockFilter === item
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {item === "all" ? "All" : item === "low" ? "Low stock" : "Out of stock"}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="p-14 text-center text-muted-foreground">Loading inventory...</div>
            ) : (
              <>
                <div className="grid gap-4 p-4 sm:p-5 lg:hidden">
                  {filteredProducts.map((product) => {
                    const statusText =
                      product.stockQuantity === 0
                        ? "Out of stock"
                        : product.stockQuantity <= 10
                          ? "Low stock"
                          : "In stock";

                    const statusClass =
                      product.stockQuantity === 0
                        ? "bg-destructive/10 text-destructive"
                        : product.stockQuantity <= 10
                          ? "bg-gold/15 text-gold"
                          : "bg-foreground/5 text-foreground";

                    return (
                      <article key={product.id} className="rounded-md border border-border bg-background/70 p-4 shadow-soft">
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                            <img
                              src={product.image || fallbackImage}
                              alt={product.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                (event.currentTarget as HTMLImageElement).src = fallbackImage;
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="truncate font-serif text-xl text-foreground">{product.name}</div>
                                <div className="mt-1 text-sm text-muted-foreground">{product.category}</div>
                              </div>
                              <div className="font-serif text-lg text-foreground">{formatPrice(product.price)}</div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              <span className="rounded-full bg-muted px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                Stock {product.stockQuantity}
                              </span>
                              <span
                                className={`inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${statusClass}`}
                              >
                                {statusText}
                              </span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                className="rounded-full"
                                onClick={() => openEditModal(product)}
                              >
                                <Pencil className="h-4 w-4" /> Edit
                              </Button>
                              <Button
                                variant="outline"
                                className="rounded-full"
                                onClick={() => {
                                  void handleDelete(product);
                                }}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {filteredProducts.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border px-5 py-14 text-center text-muted-foreground">
                      No products match your filters.
                    </div>
                  ) : null}
                </div>

                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[820px] text-sm">
                    <thead>
                      <tr className="bg-muted/40 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        <th className="px-5 py-4 text-left font-medium">Product</th>
                        <th className="px-5 py-4 text-left font-medium">Category</th>
                        <th className="px-5 py-4 text-right font-medium">Price</th>
                        <th className="px-5 py-4 text-right font-medium">Stock</th>
                        <th className="px-5 py-4 text-right font-medium">Status</th>
                        <th className="px-5 py-4 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const statusText =
                          product.stockQuantity === 0
                            ? "Out of stock"
                            : product.stockQuantity <= 10
                              ? "Low stock"
                              : "In stock";

                        const statusClass =
                          product.stockQuantity === 0
                            ? "bg-destructive/10 text-destructive"
                            : product.stockQuantity <= 10
                              ? "bg-gold/15 text-gold"
                              : "bg-foreground/5 text-foreground";

                        return (
                          <tr key={product.id} className="border-t border-border transition-colors hover:bg-muted/30">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 overflow-hidden rounded bg-muted">
                                  <img
                                    src={product.image || fallbackImage}
                                    alt={product.name}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                      (event.currentTarget as HTMLImageElement).src = fallbackImage;
                                    }}
                                  />
                                </div>
                                <div className="max-w-[20rem] font-serif text-xl text-foreground [overflow-wrap:anywhere]">
                                  {product.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-muted-foreground">{product.category}</td>
                            <td className="px-5 py-4 text-right font-serif text-base text-foreground">
                              {formatPrice(product.price)}
                            </td>
                            <td className="px-5 py-4 text-right font-medium">{product.stockQuantity}</td>
                            <td className="px-5 py-4 text-right">
                              <span
                                className={`inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${statusClass}`}
                              >
                                {statusText}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  aria-label={`Edit ${product.name}`}
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => openEditModal(product)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  aria-label={`Delete ${product.name}`}
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => {
                                    void handleDelete(product);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                            No products match your filters.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <PageFooter />

      {editingProduct && form ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="grid min-h-full place-items-center">
            <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-border/80 bg-card p-5 shadow-[var(--shadow-elevated)] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Edit Product</h2>
                  <p className="text-sm text-muted-foreground">Update name, price, and quantity.</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={closeEditModal} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => (current ? { ...current, name: event.target.value } : current))
                    }
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (LKR)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        setForm((current) => (current ? { ...current, price: event.target.value } : current))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Quantity / Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={form.stockQuantity}
                      onChange={(event) =>
                        setForm((current) => (current ? { ...current, stockQuantity: event.target.value } : current))
                      }
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <Button variant="ghost" className="rounded-full" onClick={closeEditModal}>
                    Cancel
                  </Button>
                  <Button className="rounded-full" disabled={saving} onClick={() => void saveEdit()}>
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </div>
            </div>
        </div>
      ) : null}

      {isAdding ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="grid min-h-full place-items-center">
            <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border/80 bg-card p-5 shadow-[var(--shadow-elevated)] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Add Product</h2>
                  <p className="text-sm text-muted-foreground">Fill product model fields and save.</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={closeAddModal} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Name *</Label>
                    <Input
                      id="add-name"
                      value={addForm.name}
                      onChange={(event) => setAddForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-category">Category</Label>
                    <select
                      id="add-category"
                      value={addForm.category || "General"}
                      onChange={(event) => setAddForm((current) => ({ ...current, category: event.target.value }))}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {PRODUCT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-description">Description *</Label>
                  <textarea
                    id="add-description"
                    rows={4}
                    value={addForm.description}
                    onChange={(event) => setAddForm((current) => ({ ...current, description: event.target.value }))}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Describe this product"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-image">Image URL</Label>
                  <Input
                    id="add-image"
                    type="url"
                    value={addForm.image}
                    onChange={(event) => setAddForm((current) => ({ ...current, image: event.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="add-price">Price (LKR) *</Label>
                    <Input
                      id="add-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={addForm.price}
                      onChange={(event) => setAddForm((current) => ({ ...current, price: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-stock">Stock Quantity *</Label>
                    <Input
                      id="add-stock"
                      type="number"
                      min="0"
                      step="1"
                      value={addForm.stockQuantity}
                      onChange={(event) =>
                        setAddForm((current) => ({ ...current, stockQuantity: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-status">Status</Label>
                    <select
                      id="add-status"
                      value={addForm.status}
                      onChange={(event) =>
                        setAddForm((current) => ({ ...current, status: event.target.value as ProductStatus }))
                      }
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {PRODUCT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button variant="ghost" className="rounded-full" onClick={closeAddModal}>
                  Cancel
                </Button>
                <Button className="rounded-full" disabled={saving} onClick={() => void saveAdd()}>
                  {saving ? "Saving..." : "Add product"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
