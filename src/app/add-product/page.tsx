"use client";

import { useRouter } from "next/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { ProductEditor } from "../../components/ProductEditor";
import { Toaster } from "../../components/ui/sonner";
import { addProduct } from "../../lib/products";
import { toast } from "sonner";

export default function AddProductPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Toaster />

      <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
        <ProductEditor
          heading="Add a new product"
          intro="Create a complete product record with stock tracking, status, and an image upload or URL."
          submitLabel="Add product"
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
              setTimeout(() => router.push("/"), 400);
            } catch {
              toast.error("Could not add product");
            }
          }}
          onCancel={() => router.push("/")}
        />
      </main>
    </div>
  );
}