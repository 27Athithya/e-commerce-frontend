"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, Pencil, Plus, Trash2, X } from "lucide-react";
import { SiteHeader } from "../../components/SiteHeader";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Toaster } from "../../components/ui/sonner";
import {
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
  category: "",
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

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
              <Boxes className="h-3.5 w-3.5" /> Admin View
            </div>
            <Button className="rounded-full" onClick={openAddModal}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Product
            </Button>
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
                <thead className="bg-amber-50 text-xs uppercase tracking-wider text-muted-foreground">
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
                      <td className="px-4 py-4 font-semibold text-amber-700">{formatPrice(product.price)}</td>
                      <td className="px-4 py-4">{product.stockQuantity} units</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            aria-label={`Edit ${product.name}`}
                            className="h-8 w-8 rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
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

      {isAdding ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-6 shadow-[var(--shadow-elevated)]">
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
                  <Input
                    id="add-category"
                    value={addForm.category}
                    onChange={(event) => setAddForm((current) => ({ ...current, category: event.target.value }))}
                    placeholder="General"
                  />
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

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="ghost" className="rounded-full" onClick={closeAddModal}>
                Cancel
              </Button>
              <Button className="rounded-full" disabled={saving} onClick={() => void saveAdd()}>
                {saving ? "Saving..." : "Add product"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
