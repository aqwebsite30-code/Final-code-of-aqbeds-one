import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UploadCloud, X, Save, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { createProduct } from "@/lib/admin-products";

export const Route = createFileRoute("/admin/products/new")({
  component: AddProduct,
});

const CATEGORIES = [
  "all-beds",
  "luxury-beds",
  "ottoman-beds",
  "divan-beds",
  "storage-beds",
  "mattresses",
  "headboards",
  "wardrobes",
  "sliding-wardrobes",
  "bedroom-furniture",
  "sofas",
];

type OptionRow = { name: string; extraPrice: number };
type ColorRow = { name: string; hex: string; image: string };

function OptionEditor({
  label,
  rows,
  setRows,
  priceLabel,
}: {
  label: string;
  rows: OptionRow[];
  setRows: (r: OptionRow[]) => void;
  priceLabel?: string;
}) {
  const add = () => setRows([...rows, { name: "", extraPrice: 0 }]);
  const remove = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof OptionRow, value: string | number) => {
    const copy = [...rows];
    copy[i] = { ...copy[i], [field]: value };
    setRows(copy);
  };

  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</h4>
        <button type="button" onClick={add} className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={row.name}
              onChange={(e) => update(i, "name", e.target.value)}
              placeholder="Name"
              className="flex-1 bg-gray-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500/30"
            />
            <input
              type="number"
              value={row.extraPrice}
              onChange={(e) => update(i, "extraPrice", Number(e.target.value))}
              placeholder={priceLabel || "£"}
              className="w-20 bg-gray-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500/30"
            />
            <button type="button" onClick={() => remove(i)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-[10px] text-gray-600 text-center py-2">No options added yet.</p>
        )}
      </div>
    </div>
  );
}

export function AddProduct() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("0");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [featured, setFeatured] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");

  const [colors, setColors] = useState<ColorRow[]>([]);
  const [fabrics, setFabrics] = useState<OptionRow[]>([]);
  const [sizes, setSizes] = useState<OptionRow[]>([]);
  const [mattressOptions, setMattressOptions] = useState<OptionRow[]>([]);
  const [frameOptions, setFrameOptions] = useState<OptionRow[]>([]);
  const [headboardOptions, setHeadboardOptions] = useState<OptionRow[]>([]);
  const [storageOptions, setStorageOptions] = useState<OptionRow[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((f) => {
      const url = URL.createObjectURL(f);
      setImageUrls((prev) => [...prev, url]);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const addImageUrl = () => {
    if (imageInput.trim()) {
      setImageUrls((prev) => [...prev, imageInput.trim()]);
      setImageInput("");
    }
  };

  const removeImage = (i: number) => setImageUrls((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !category) {
      toast.error("Name, Price, and Category are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const options = {
        colors: colors.filter((c) => c.name.trim()),
        fabrics: fabrics.filter((f) => f.name.trim()),
        sizes: sizes.filter((s) => s.name.trim()),
        mattressOptions: mattressOptions.filter((m) => m.name.trim()),
        frameOptions: frameOptions.filter((f) => f.name.trim()),
        headboardOptions: headboardOptions.filter((h) => h.name.trim()),
        storageOptions: storageOptions.filter((s) => s.name.trim()),
      };

      const result = await createProduct({
        data: {
          name: name.trim(),
          description,
          price: Number(price),
          salePrice: salePrice ? Number(salePrice) : null,
          stock: Number(stock),
          sku: sku.trim() || null,
          category,
          featured,
          imageUrls,
          options,
        },
      });

      if (result?.success) {
        toast.success("Product created successfully!");
        navigate({ to: "/admin/products" });
      } else {
        toast.error(result?.error || "Failed to create product.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/products"
          className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Add New Product</h1>
          <p className="text-gray-400 mt-1 text-sm">Create a new bed or accessory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h2 className="text-lg font-semibold text-white mb-6">General Information</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Product Title</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="e.g. Emperor Ottoman Bed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    placeholder="Describe the product..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Media Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h2 className="text-lg font-semibold text-white mb-6">Media Gallery</h2>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors duration-300 ${
                  isDragActive ? "border-blue-500 bg-blue-500/5" : "border-gray-700 bg-gray-950/50 hover:border-gray-500"
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">SVG, PNG, JPG or GIF</p>
              </div>

              {/* Image URL input */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="Or paste an image URL..."
                  className="flex-1 bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                />
                <button type="button" onClick={addImageUrl} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
                  Add
                </button>
              </div>

              {/* Image previews */}
              {imageUrls.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {imageUrls.map((url, idx) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key={idx}
                        className="relative aspect-square rounded-xl bg-gray-800 border border-gray-700 overflow-hidden group"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => removeImage(idx)} className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* Product Variants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h2 className="text-lg font-semibold text-white mb-6">Product Variants</h2>

              <div className="space-y-6">
                {/* Colors */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Colors</h4>
                    <button type="button" onClick={() => setColors([...colors, { name: "", hex: "#000000", image: "" }])} className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Color
                    </button>
                  </div>
                  <div className="space-y-2">
                    {colors.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="color" value={c.hex} onChange={(e) => { const copy = [...colors]; copy[i] = { ...copy[i], hex: e.target.value }; setColors(copy); }} className="w-8 h-8 rounded-lg border border-white/10 bg-gray-900 cursor-pointer" />
                        <input type="text" value={c.name} onChange={(e) => { const copy = [...colors]; copy[i] = { ...copy[i], name: e.target.value }; setColors(copy); }} placeholder="Color name" className="flex-1 bg-gray-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500/30" />
                        <input type="text" value={c.image} onChange={(e) => { const copy = [...colors]; copy[i] = { ...copy[i], image: e.target.value }; setColors(copy); }} placeholder="Image URL (optional)" className="flex-1 bg-gray-900 border border-white/10 rounded-lg text-xs px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500/30" />
                        <button type="button" onClick={() => setColors(colors.filter((_, idx) => idx !== i))} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {colors.length === 0 && <p className="text-[10px] text-gray-600 text-center py-2">No colors added.</p>}
                  </div>
                </div>

                {/* Fabrics */}
                <OptionEditor label="Fabrics" rows={fabrics} setRows={setFabrics} priceLabel="+£" />

                {/* Sizes */}
                <OptionEditor label="Sizes" rows={sizes} setRows={setSizes} priceLabel="+£" />

                {/* Mattress Options */}
                <OptionEditor label="Mattress Options" rows={mattressOptions} setRows={setMattressOptions} priceLabel="+£" />

                {/* Frame Options */}
                <OptionEditor label="Frame Options" rows={frameOptions} setRows={setFrameOptions} priceLabel="+£" />

                {/* Headboard Options */}
                <OptionEditor label="Headboard Options" rows={headboardOptions} setRows={setHeadboardOptions} priceLabel="+£" />

                {/* Storage Options */}
                <OptionEditor label="Storage Options" rows={storageOptions} setRows={setStorageOptions} priceLabel="+£" />
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Pricing & Stock */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h2 className="text-lg font-semibold text-white mb-6">Pricing & Stock</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Regular Price (£)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Sale Price (£)</label>
                  <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Stock</label>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">SKU</label>
                    <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Categorization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h2 className="text-lg font-semibold text-white mb-6">Categorization</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-950/50 border border-gray-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                    <option value="">Select category...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-5 h-5 rounded border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900 bg-gray-950" />
                    <div>
                      <span className="block text-sm font-medium text-white">Featured Product</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Show this product on the homepage</span>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800 flex justify-end gap-4 z-20">
          <Link to="/admin/products" className="px-6 py-2.5 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
            Discard
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}
