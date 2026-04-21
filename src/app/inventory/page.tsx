"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, Pencil, Trash2, X } from "lucide-react";
import { SiteHeader } from "../../components/SiteHeader";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Toaster } from "../../components/ui/sonner";
import {
  deleteProduct,
  formatPrice,
  getProducts,
  updateProduct,
  type Product,
} from "../../lib/products";
import { toast } from "sonner";

type EditableForm = {
  name: string;
  price: string;
  stockQuantity: string;
};

function toForm(product: Product): EditableForm {
  return {
    name: product.name,
    price: String(product.price),
    stockQuantity: String(product.stockQuantity),
  };
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<EditableForm | null>(null);
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

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + (product.stockQuantity || 0), 0),
    [products],
  );

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm(toForm(product));
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setForm(null);
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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Toaster />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-border/80 bg-white/70 p-6 shadow-[var(--shadow-soft)] backdrop-blur">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Inventory Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length} products · {totalStock} total units in stock
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">
            <Boxes className="h-3.5 w-3.5" /> Admin View
          </div>
        </div>

        {loading ? (
          <div className="rounded-[1.5rem] border border-dashed border-border p-12 text-center text-muted-foreground">
            Loading inventory...
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-[var(--shadow-soft)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-blue-50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Price (LKR)</th>
                    <th className="px-4 py-3">Quantity / Stock</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-border/70 transition hover:bg-muted/30">
                      <td className="px-4 py-4 font-medium">{product.name}</td>
                      <td className="px-4 py-4 font-semibold text-blue-700">{formatPrice(product.price)}</td>
                      <td className="px-4 py-4">{product.stockQuantity} units</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            aria-label={`Edit ${product.name}`}
                            className="h-8 w-8 rounded-full border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => openEditModal(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            aria-label={`Delete ${product.name}`}
                            className="h-8 w-8 rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
                            onClick={() => {
                              void handleDelete(product);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {editingProduct && form ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-[var(--shadow-elevated)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Edit Product</h2>
                <p className="text-sm text-muted-foreground">Update name, price, and quantity.</p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={closeEditModal} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => setForm((current) => (current ? { ...current, name: event.target.value } : current))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                <Label htmlFor="price">Price (LKR)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm((current) => (current ? { ...current, price: event.target.value } : current))}
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
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="ghost" className="rounded-full" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button className="rounded-full" disabled={saving} onClick={() => void saveEdit()}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
