"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { ProductInput, ProductStatus } from "../lib/products";
import { PRODUCT_STATUSES, formatPrice } from "../lib/products";
import { fileToDataUrl } from "../lib/media";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stockQuantity: string;
  status: ProductStatus;
};

type ProductEditorProps = {
  heading: string;
  intro: string;
  submitLabel: string;
  initialValues: ProductFormValues;
  onSubmit: (values: ProductInput) => Promise<void>;
  onCancel: () => void;
};

const fallbackPreview =
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80&auto=format&fit=crop";

export function ProductEditor({
  heading,
  intro,
  submitLabel,
  initialValues,
  onSubmit,
  onCancel,
}: ProductEditorProps) {
  const [form, setForm] = useState<ProductFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setForm(initialValues);
    setImageError(false);
  }, [initialValues]);

  const updateField =
    (key: keyof ProductFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [key]: event.target.value }));
      if (key === "image") {
        setImageError(false);
      }
    };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((current) => ({ ...current, image: dataUrl }));
      setImageError(false);
    } catch {
      setImageError(true);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();
    const category = form.category.trim();
    const price = Number(form.price);
    const stockQuantity = Number(form.stockQuantity);

    if (!name || !description) {
      toast.error("Name and description are required");
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      toast.error("Enter a valid price");
      return;
    }

    if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
      toast.error("Enter a valid stock quantity");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name,
        description,
        price,
        image: form.image.trim() || fallbackPreview,
        category: category || "General",
        stockQuantity,
        status: form.status,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const previewImage = form.image.trim() || fallbackPreview;

  return (
    <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="space-y-6 rounded-[2rem] border border-border/70 bg-card p-6 shadow-[var(--shadow-elevated)] sm:p-8"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{intro}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Product name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={updateField("name")}
            placeholder="e.g. Minimal Leather Wallet"
            required
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (LKR) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={updateField("price")}
              placeholder="79.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Stock quantity *</Label>
            <Input
              id="stockQuantity"
              type="number"
              min="0"
              step="1"
              value={form.stockQuantity}
              onChange={updateField("stockQuantity")}
              placeholder="12"
              required
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category}
              onChange={updateField("category")}
              placeholder="Accessories"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={updateField("status")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              {PRODUCT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Upload image or paste URL</Label>
          <Input id="image" type="url" value={form.image} onChange={updateField("image")} placeholder="https://..." />
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Use a public URL or upload a local image file.</span>
            <label className="cursor-pointer rounded-full border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-accent">
              Upload file
              <input className="hidden" type="file" accept="image/*" onChange={handleFile} />
            </label>
          </div>
          {imageError ? <p className="text-xs text-destructive">Could not read the selected image.</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={updateField("description")}
            placeholder="Tell customers what makes this product special..."
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel} className="rounded-full">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="rounded-full">
            {submitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>

      <aside className="space-y-4 rounded-[2rem] border border-border/70 bg-card/80 p-4 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Live preview
          </p>
          <h2 className="text-xl font-semibold tracking-tight">{form.name.trim() || "Product preview"}</h2>
          <p className="text-sm text-muted-foreground">
            {form.category.trim() || "General"} · {form.status}
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-muted">
          <img
            src={previewImage}
            alt={form.name.trim() || "Product preview"}
            className="aspect-[4/3] w-full object-cover"
            onError={(event) => {
              (event.currentTarget as HTMLImageElement).src = fallbackPreview;
            }}
          />
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="text-xs uppercase tracking-wider">Price</div>
            <div className="mt-2 text-base font-semibold text-foreground">
              {formatPrice(Number(form.price) || 0)}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="text-xs uppercase tracking-wider">Stock</div>
            <div className="mt-2 text-base font-semibold text-foreground">
              {form.stockQuantity.trim() || "0"} units
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}