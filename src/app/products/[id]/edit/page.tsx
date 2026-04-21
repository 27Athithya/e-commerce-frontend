"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductEditor, type ProductFormValues } from "../../../../components/ProductEditor";
import { SiteHeader } from "../../../../components/SiteHeader";
import { Button } from "../../../../components/ui/button";
import { Toaster } from "../../../../components/ui/sonner";
import { getProduct, updateProduct } from "../../../../lib/products";
import { toast } from "sonner";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");
  const [product, setProduct] = useState<ProductFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!id) {
        if (active) {
          setLoadError("Invalid product link");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setLoadError(null);
      try {
        const nextProduct = await getProduct(id);
        if (active) {
          setProduct({
            name: nextProduct.name,
            description: nextProduct.description,
            price: String(nextProduct.price),
            image: nextProduct.image,
            category: nextProduct.category,
            stockQuantity: String(nextProduct.stockQuantity),
            status: nextProduct.status,
          });
        }
      } catch {
        if (active) {
          setLoadError("Could not load product. It may have been deleted.");
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
  }, [id, router]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Toaster />

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {loading ? (
          <div className="rounded-[1.75rem] border border-dashed border-border p-16 text-center text-muted-foreground">
            Loading product...
          </div>
        ) : loadError || !product ? (
          <div className="rounded-[1.75rem] border border-dashed border-border p-16 text-center">
            <p className="text-muted-foreground">{loadError ?? "Product could not be loaded."}</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button variant="outline" onClick={() => router.push("/products")}>
                Back to products
              </Button>
              <Button onClick={() => router.push("/add-product")}>Add new product</Button>
            </div>
          </div>
        ) : (
          <ProductEditor
            heading={`Edit ${product.name}`}
            intro="Update any product field, including the image, status, and inventory count. Changes are saved immediately to MongoDB."
            submitLabel="Save changes"
            initialValues={product}
            onSubmit={async (productInput) => {
              if (!id) {
                toast.error("Invalid product id");
                return;
              }

              try {
                await updateProduct(id, productInput);
                toast.success("Product updated");
                setTimeout(() => router.push("/products"), 400);
              } catch {
                toast.error("Could not update product");
              }
            }}
            onCancel={() => router.push("/products")}
          />
        )}
      </main>
    </div>
  );
}