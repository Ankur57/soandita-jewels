import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageHelper";

function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryModalTab, setCategoryModalTab] = useState("create");
  const [updatingCatId, setUpdatingCatId] = useState(null);
  const [categoryError, setCategoryError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = [...e.target.files];
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
    // Reset the input so the same file can be re-selected if needed
    e.target.value = null;
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Number(form.price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    if (Number(form.stock) < 0) {
      setError("Stock cannot be less than 0");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      images.forEach((image) => {
        formData.append("images", image);
      });

      await axios.post("/products/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/admin/products", {
        state: { message: "Product added successfully!" },
      });
    } catch (err) {
      console.log(err.response?.data?.message);
      setError(err.response?.data?.message || "Failed to add product");
      setSaving(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (categoryImagePreview) {
        URL.revokeObjectURL(categoryImagePreview);
      }
      setCategoryImage(file);
      setCategoryImagePreview(URL.createObjectURL(file));
      setCategoryError("");
    }
  };

  const removeCategoryImage = () => {
    if (categoryImagePreview) {
      URL.revokeObjectURL(categoryImagePreview);
    }
    setCategoryImage(null);
    setCategoryImagePreview("");
  };

  const closeCategoryModal = () => {
    if (categoryLoading) return;
    setShowCategoryModal(false);
    setCategoryError("");
    setNewCategoryName("");
    setCategoryModalTab("create");
    removeCategoryImage();
  };

  const handleCreateCategory = async (e) => {
    if (e) e.preventDefault();
    try {
      setCategoryError("");

      if (!newCategoryName.trim()) {
        setCategoryError("Category name is required");
        return;
      }

      setCategoryLoading(true);

      const formData = new FormData();
      formData.append("name", newCategoryName.trim());
      if (categoryImage) {
        formData.append("image", categoryImage);
      }

      const res = await axios.post("/categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const createdCategory = res.data;
      setCategories((prev) => [...prev, createdCategory]);
      setForm((prev) => ({
        ...prev,
        categoryId: createdCategory._id,
      }));

      closeCategoryModal();
    } catch (error) {
      setCategoryError(
        error.response?.data?.message || "Failed to create category"
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleUpdateExistingCategoryImage = async (catId, file) => {
    if (!file) return;
    try {
      setUpdatingCatId(catId);
      setCategoryError("");
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.put(`/categories/${catId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedCategory = res.data;
      setCategories((prev) =>
        prev.map((c) => (c._id === catId ? updatedCategory : c))
      );
    } catch (error) {
      setCategoryError(
        error.response?.data?.message || "Failed to update category image"
      );
    } finally {
      setUpdatingCatId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-4 md:p-8 lg:p-10">
      <div className="max-w-3xl mx-auto">

        {/* ─── Breadcrumb ─── */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link to="/admin/products" className="text-gray-400 hover:text-indigo-600 transition-colors">
            Products
          </Link>
          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">Add New Product</span>
        </div>

        {/* ─── Main Card ─── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Add New Product
            </h1>
            <p className="text-indigo-200 text-sm mt-1">
              Fill in the details to add a product to your store
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">

            {/* Error Alert */}
            {error && (
              <div className="mb-6 px-5 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {/* Name */}
            <div className="mb-5">
              <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                name="name"
                placeholder="e.g., Gold Necklace Set"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                placeholder="Describe your product..."
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none placeholder:text-gray-300"
              />
            </div>

            {/* Price + Stock Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                  Price (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  name="price"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="4999"
                  value={form.price}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault();
                  }}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                  Stock <span className="text-red-400">*</span>
                </label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="50"
                  value={form.stock}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault();
                  }}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200 flex-shrink-0"
                >
                  + New
                </button>
              </div>
            </div>

            {/* Images & Videos */}
            <div className="mb-8">
              <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                Product Images / Videos <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.heic,.heif,.avif"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer"
                />
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="flex gap-3 flex-wrap mt-3">
                  {previews.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {item.type === "video" ? (
                        <video
                          src={item.url}
                          muted
                          className="w-20 h-20 object-cover rounded-xl border-2 border-purple-300 shadow-sm"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-xl border-2 border-indigo-200 shadow-sm"
                        />
                      )}
                      {/* Play icon badge for videos */}
                      {item.type === "video" && (
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className={`inline-flex items-center gap-2 px-8 py-3 font-bold text-sm rounded-xl text-white transition-all duration-300 ${saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-200 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5"
                  }`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </>
                )}
              </button>
              <Link
                to="/admin/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold text-sm rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* ─── Category Modal ─── */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 px-6 py-5 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Categories</h2>
                  <p className="text-indigo-200 text-xs mt-0.5">
                    Create new categories or update existing ones
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  disabled={categoryLoading}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 bg-gray-50/70 px-6 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryModalTab("create");
                    setCategoryError("");
                  }}
                  className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
                    categoryModalTab === "create"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  + Add New Category
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryModalTab("manage");
                    setCategoryError("");
                  }}
                  className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                    categoryModalTab === "manage"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Existing Categories
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full font-bold">
                    {categories.length}
                  </span>
                </button>
              </div>

              {/* Error Alert */}
              {categoryError && (
                <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{categoryError}</span>
                </div>
              )}

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1">
                {categoryModalTab === "create" ? (
                  <form onSubmit={handleCreateCategory} className="space-y-5">
                    {/* Category Name */}
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                        Category Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g., AD Chokers, Bangles, Rings"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-300"
                        autoFocus
                        disabled={categoryLoading}
                      />
                    </div>

                    {/* Category Image */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold">
                          Category Image
                        </label>
                        <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
                          Shown on Home Page
                        </span>
                      </div>

                      {/* Image Upload Box or Preview */}
                      {!categoryImagePreview ? (
                        <label className="group relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl bg-gray-50/60 hover:bg-indigo-50/30 transition-all cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,.heic,.heif,.avif"
                            onChange={handleCategoryImageChange}
                            disabled={categoryLoading}
                            className="hidden"
                          />
                          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                            Click to upload category image
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, WEBP, AVIF up to 10MB (Square 1:1 works best)
                          </p>
                        </label>
                      ) : (
                        <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                          <div className="relative group flex-shrink-0">
                            <img
                              src={categoryImagePreview}
                              alt="Category Preview"
                              className="w-20 h-20 object-cover rounded-xl border border-indigo-200 shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                              Preview
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-700 truncate">
                              {categoryImage?.name}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {categoryImage?.size ? (categoryImage.size / (1024 * 1024)).toFixed(2) : "0"} MB • Ready for Cloudinary
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <label className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                                Change
                                <input
                                  type="file"
                                  accept="image/*,.heic,.heif,.avif"
                                  onChange={handleCategoryImageChange}
                                  className="hidden"
                                />
                              </label>
                              <span className="text-gray-300">•</span>
                              <button
                                type="button"
                                onClick={removeCategoryImage}
                                className="text-xs font-semibold text-red-500 hover:text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={closeCategoryModal}
                        disabled={categoryLoading}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={categoryLoading || !newCategoryName.trim()}
                        className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all ${
                          categoryLoading || !newCategoryName.trim()
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-200 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5"
                        }`}
                      >
                        {categoryLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving to Cloudinary...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Create Category
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Manage Existing Categories Tab */
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 mb-2">
                      Categories displayed on the Home page slider. Click "Upload Image" to add or update any category's image in Cloudinary:
                    </p>
                    <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto pr-1">
                      {categories.map((cat) => (
                        <div
                          key={cat._id}
                          className="py-3 flex items-center justify-between gap-3 group hover:bg-gray-50/80 px-2 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center">
                              {cat.image ? (
                                <img
                                  src={getImageUrl(cat.image)}
                                  alt={cat.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {cat.name}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {cat.image ? (
                                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                                    ✓ Image attached
                                  </span>
                                ) : (
                                  <span className="text-amber-500 font-medium">
                                    ⚠ No image (shows placeholder)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Quick upload/replace button */}
                          <label className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer transition-colors shadow-sm">
                            {updatingCatId === cat._id ? (
                              <>
                                <svg className="animate-spin h-3.5 w-3.5 text-indigo-600" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span>{cat.image ? "Change Image" : "Upload Image"}</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*,.heic,.heif,.avif"
                              disabled={updatingCatId === cat._id}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUpdateExistingCategoryImage(cat._id, file);
                                }
                                e.target.value = null;
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AddProduct;