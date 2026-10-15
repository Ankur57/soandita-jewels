import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";

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
  const [categoryError, setCategoryError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = [...e.target.files];
    setImages((prev) => [...prev, ...files]);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...urls]);
    // Reset the input so the same file can be re-selected if needed
    e.target.value = null;
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
      setError(err.response?.data?.message || "Failed to add product");
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    try {
      setCategoryError("");

      if (!newCategoryName.trim()) {
        setCategoryError("Category name is required");
        return;
      }

      const res = await axios.post("/categories", {
        name: newCategoryName,
      });

      const createdCategory = res.data;
      setCategories((prev) => [...prev, createdCategory]);
      setForm((prev) => ({
        ...prev,
        categoryId: createdCategory._id,
      }));

      setNewCategoryName("");
      setShowCategoryModal(false);
    } catch (error) {
      setCategoryError(
        error.response?.data?.message || "Failed to create category"
      );
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
                  placeholder="4999"
                  value={form.price}
                  onChange={handleChange}
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
                  placeholder="50"
                  value={form.stock}
                  onChange={handleChange}
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

            {/* Images */}
            <div className="mb-8">
              <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                Product Images <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer"
                />
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="flex gap-3 flex-wrap mt-3">
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-xl border-2 border-indigo-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Remove image"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h2 className="text-lg font-bold text-white">Add New Category</h2>
                <p className="text-indigo-200 text-sm">Create a new product category</p>
              </div>

              <div className="p-6">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category Name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-300 mb-3"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                />

                {categoryError && (
                  <p className="text-red-500 text-sm mb-3 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                    </svg>
                    {categoryError}
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowCategoryModal(false);
                      setCategoryError("");
                      setNewCategoryName("");
                    }}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCategory}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Create Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AddProduct;