"use client";

import { useRouter } from "next/navigation";
import { PageFooter } from "../../components/PageFooter";
import { PageHeader } from "../../components/PageHeader";
import { ProductEditor } from "../../components/ProductEditor";
import { SiteHeader } from "../../components/SiteHeader";
import { Toaster } from "../../components/ui/sonner";
import { addProduct } from "../../lib/products";
import { toast } from "sonner";

export default function AddProductPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Toaster />

      <main>
        <PageHeader
          eyebrow="Atelier"
          title="Add a product"
          subtitle="Compose a new catalog entry with pricing, inventory, media, and publishing status in one place."
        />

        <div className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-10">
          <ProductEditor
            heading="Product details"
            intro="Complete the full profile before publishing to keep catalog quality high and inventory data clean."
            submitLabel="Publish product"
            initialValues={{
              name: "",
              description: "",
              price: "",
              image: "",
              category: "",
              stockQuantity: "0",
              status: "active",
            }}
            onSubmit={async (productInput) => {
              try {
                await addProduct(productInput);
                toast.success("Product added");
                setTimeout(() => router.push("/products"), 400);
              } catch {
                toast.error("Could not add product");
              }
            }}
            onCancel={() => router.push("/products")}
          />
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
