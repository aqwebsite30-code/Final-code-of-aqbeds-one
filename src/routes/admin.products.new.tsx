import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UploadCloud, X, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/new")({
  component: AddProduct,
});

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  price: z.number().min(1, "Price must be greater than 0"),
  salePrice: z.number().optional(),
  stock: z.number().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean(),
  // Variants
  fabric: z.string().optional(),
  mattress: z.string().optional(),
  frame: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function AddProduct() {
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stock: 0,
      featured: false,
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Saving product:", data, "Images:", images);
      toast.success("Product created successfully");
      setIsSubmitting(false);
    }, 1500);
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Add New Product</h1>
          <p className="text-gray-400 mt-1">Create a new bed or accessory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-lg font-semibold text-white mb-6">General Information</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Product Title
                  </label>
                  <input
                    {...register("name")}
                    className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="e.g. Emperor Ottoman Bed"
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
                    placeholder="Describe the product..."
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-lg font-semibold text-white mb-6">Media Gallery</h2>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors duration-300 ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-gray-700 bg-gray-950/50 hover:border-gray-500"
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                <p className="text-xs text-emerald-400 mt-2 font-medium">
                  Auto-converts to optimized WebP
                </p>
              </div>

              {images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {images.map((file, idx) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key={idx}
                        className="relative aspect-square rounded-xl bg-gray-800 border border-gray-700 overflow-hidden group"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-lg font-semibold text-white mb-6">Pricing & Stock</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Regular Price (£)
                  </label>
                  <input
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  {errors.price && (
                    <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Sale Price (£)
                  </label>
                  <input
                    type="number"
                    {...register("salePrice", { valueAsNumber: true })}
                    className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Stock</label>
                    <input
                      type="number"
                      {...register("stock", { valueAsNumber: true })}
                      className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">SKU</label>
                    <input
                      {...register("sku")}
                      className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-lg font-semibold text-white mb-6">Categorization</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                  <select
                    {...register("category")}
                    className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                  >
                    <option value="">Select category...</option>
                    <option value="beds">Beds</option>
                    <option value="mattresses">Mattresses</option>
                    <option value="headboards">Headboards</option>
                    <option value="accessories">Accessories</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("featured")}
                      className="w-5 h-5 rounded border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900 bg-gray-950"
                    />
                    <div>
                      <span className="block text-sm font-medium text-white">Featured Product</span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        Show this product on the homepage
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Form Actions fixed at bottom */}
        <div className="fixed bottom-0 left-64 right-0 p-4 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800 flex justify-end gap-4 z-20">
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}
