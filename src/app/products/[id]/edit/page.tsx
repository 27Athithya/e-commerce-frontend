"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
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
  }, [id]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Toaster />

      <main>
        <PageHeader
          eyebrow="Atelier"
          title="Edit product"
          subtitle="Adjust media, pricing, stock, and publishing status with a live preview before saving."
        />

        <div className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-10">
          {loading ? (
            <div className="rounded-md border border-dashed border-border p-16 text-center text-muted-foreground">
              Loading product...
            </div>
          ) : loadError || !product ? (
            <div className="rounded-md border border-dashed border-border p-16 text-center">
              <p className="text-muted-foreground">{loadError ?? "Product could not be loaded."}</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" onClick={() => router.push("/products")}>
                  Back to products
                </Button>
                <Button onClick={() => router.push("/add-product")}>Add new product</Button>
              </div>
            </div>
          ) : (
            <ProductEditor
              heading={`Edit ${product.name}`}
              intro="Update any field and publish the latest catalog state with consistent branding and inventory metadata."
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
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
