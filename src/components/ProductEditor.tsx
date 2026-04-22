"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { ProductInput, ProductStatus } from "../lib/products";
import { PRODUCT_CATEGORIES, PRODUCT_STATUSES, formatPrice } from "../lib/products";
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

  const categoryOptions = useMemo(() => {
    const options = new Set<string>(PRODUCT_CATEGORIES);
    const current = form.category.trim();

    if (current && !options.has(current)) {
      options.add(current);
    }

    return Array.from(options);
  }, [form.category]);

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
    <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="space-y-6 rounded-md border border-border bg-card p-6 shadow-luxury sm:p-8"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Catalog form</span>
          </div>
          <h2 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">{heading}</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{intro}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Product name
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={updateField("name")}
            placeholder="e.g. Signature Leather Wallet"
            required
            className="h-11 rounded border-border bg-card px-4"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Price (LKR)
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={updateField("price")}
              placeholder="79.00"
              required
              className="h-11 rounded border-border bg-card px-4"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="stockQuantity"
              className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
            >
              Stock quantity
            </Label>
            <Input
              id="stockQuantity"
              type="number"
              min="0"
              step="1"
              value={form.stockQuantity}
              onChange={updateField("stockQuantity")}
              placeholder="12"
              required
              className="h-11 rounded border-border bg-card px-4"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Category
            </Label>
            <select
              id="category"
              value={form.category.trim() || "General"}
              onChange={updateField("category")}
              className="h-11 w-full rounded border border-border bg-card px-4 text-sm text-foreground outline-none transition-colors focus:border-gold"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Status
            </Label>
            <select
              id="status"
              value={form.status}
              onChange={updateField("status")}
              className="h-11 w-full rounded border border-border bg-card px-4 text-sm text-foreground outline-none transition-colors focus:border-gold"
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
          <Label htmlFor="image" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Upload image or paste URL
          </Label>
          <Input
            id="image"
            type="url"
            value={form.image}
            onChange={updateField("image")}
            placeholder="https://..."
            className="h-11 rounded border-border bg-card px-4"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Use a public URL or upload a local image file.</span>
            <label className="cursor-pointer rounded-full border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-foreground transition-colors hover:border-gold hover:text-gold">
              Upload file
              <input className="hidden" type="file" accept="image/*" onChange={handleFile} />
            </label>
          </div>
          {imageError ? <p className="text-xs text-destructive">Could not read the selected image.</p> : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
          >
            Description
          </Label>
          <Textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={updateField("description")}
            placeholder="Tell customers what makes this product special..."
            required
            className="rounded border-border bg-card px-4 py-3"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded px-5">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="h-auto bg-foreground px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-background transition-colors hover:bg-gold hover:text-primary-foreground"
          >
            {submitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>

      <aside className="space-y-5 rounded-md border border-border bg-card/80 p-4 shadow-soft sm:p-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Live preview</p>
          <h3 className="font-serif text-3xl tracking-tight text-foreground">
            {form.name.trim() || "Product preview"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {form.category.trim() || "General"} - {form.status}
          </p>
        </div>

        <div className="overflow-hidden rounded border border-border bg-muted">
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
          <div className="rounded border border-border bg-background/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em]">Price</div>
            <div className="mt-2 font-serif text-2xl text-foreground">{formatPrice(Number(form.price) || 0)}</div>
          </div>
          <div className="rounded border border-border bg-background/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em]">Stock</div>
            <div className="mt-2 font-serif text-2xl text-foreground">{form.stockQuantity.trim() || "0"}</div>
          </div>
        </div>
      </aside>
    </section>
  );
}
