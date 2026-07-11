import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UploadCloud, X, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";

const getProductForEdit = createServerFn({ method: "GET" }).handler(
  async (ctx: { data: string }) => {
    const id = ctx.data;
    if (!process.env.DATABASE_URL) return null;
    return await db.product.findUnique({ where: { id } });
  },
);

const updateProduct = createServerFn({ method: "POST" }).handler(async (ctx: { data: any }) => {
  const data = ctx.data;
  const schema = z.object({
    id: z.string(),
    name: z.string().min(2),
    description: z.string().min(10),
    price: z.number().min(1),
    salePrice: z.number().optional(),
    stock: z.number().min(0),
    category: z.string(),
    featured: z.boolean().optional(),
    images: z.array(z.string()),
  });
  const parsed = schema.parse(data);
  const { id, images: imageLinks, ...updateData } = parsed;
  await db.product.update({
    where: { id },
    data: {
      ...updateData,
      price: Number(updateData.price),
      salePrice: updateData.salePrice ? Number(updateData.salePrice) : null,
      stock: Number(updateData.stock),
      images: {
        deleteMany: {},
        create: imageLinks.map((url: string) => ({ imageUrl: url })),
      },
    },
  });
  return { success: true };
});

export const Route = createFileRoute("/admin/products/edit/$id")({
  loader: ({ params }) => getProductForEdit({ data: params.id }),
  component: EditProduct,
});

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  price: z.number().min(1, "Price must be greater than 0"),
  salePrice: z.number().optional(),
  stock: z.number().min(0, "Stock cannot be negative"),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function EditProduct() {
  const initialProduct = Route.useLoaderData() as any;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialProduct?.name || "",
      description: initialProduct?.description || "",
      price: initialProduct?.price || 0,
      salePrice: initialProduct?.salePrice || undefined,
      stock: initialProduct?.stock || 0,
      category: initialProduct?.category || "",
      featured: initialProduct?.featured || false,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // @ts-ignore
      const res = await updateProduct({
        data: {
          id: initialProduct.id,
          ...data,
          images,
        },
      });
      if (res?.success) {
        toast.success("Product updated successfully");
        navigate({ to: "/admin/products" });
      }
    } catch {
      toast.error("Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/products"
          className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Edit Product</h1>
          <p className="text-gray-400 mt-1">Update details for {initialProduct?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-6">General Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Product Title
                  </label>
                  <input
                    {...register("name")}
                    className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={5}
                    className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-6 shadow-xl text-gray-400 text-sm italic">
              Images can currently be managed in the "Add Product" workflow or by direct DB access.
              Editing existing images is coming in a future update.
              <div className="mt-4 grid grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="w-full aspect-square object-cover rounded-lg border border-white/5"
                    alt=""
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-6">Pricing & Stock</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Price (£)
                  </label>
                  <input
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Stock</label>
                  <input
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                    className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-6">Categorization</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                  <input
                    {...register("category")}
                    className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5"
                  />
                </div>
                <div className="pt-4 border-t border-gray-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("featured")}
                      className="w-5 h-5 rounded border-gray-700 text-blue-500 bg-gray-950"
                    />
                    <div>
                      <span className="block text-sm font-medium text-white">Featured Product</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-64 right-0 p-4 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800 flex justify-end gap-4 z-20">
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/products" })}
            className="px-6 py-2.5 rounded-xl font-medium text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
