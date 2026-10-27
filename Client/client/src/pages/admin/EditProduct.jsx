import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../api/axios";

import { getImageUrl } from "../../utils/imageHelper";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get(`/products/get/${id}`);
      setForm(res.data);
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = [...e.target.files];
    setImages((prev) => [...prev, ...files]);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...urls]);
    e.target.value = null;
  };

  const removeExistingImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category);

      // Send the remaining existing images so the backend keeps only these
      formData.append("existingImages", JSON.stringify(form.images || []));

      images.forEach((img) => {
        formData.append("images", img);
      });

      await axios.put(`/products/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Product updated successfully!");
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Loading Skeleton ─── */
  if (!form.name) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-32 bg-gray-200 rounded-lg mb-8 animate-pulse" />
          <div className="bg-white rounded-2xl p-8 shadow animate-pulse">
            <div className="h-10 w-1/2 bg-gray-200 rounded-lg mb-6" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg mb-4" />
            ))}
            <div className="h-12 w-40 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-4 md:p-8 lg:p-10">
      <div className="max-w-3xl mx-auto">

        {/* ─── Breadcrumb ─── */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/admin/products");
              }
            }}
            className="text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Products
          </button>
          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">Edit Product</span>
        </div>

        {/* ─── Main Card ─── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Edit Product
            </h1>
            <p className="text-indigo-200 text-sm mt-1">
              Update the details for <span className="font-semibold text-white">{form.name}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">

            {/* Alerts */}
            {success && (
              <div className="mb-6 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {success}
              </div>
            )}
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
                Product Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
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
                  min="0.01"
                  step="any"
                  value={form.price}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault();
                  }}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                  value={form.stock}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault();
                  }}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Current Images */}
            {form.images?.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                  Current Images
                </label>
                <div className="flex gap-3 flex-wrap">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <a
                        href={getImageUrl(img)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={getImageUrl(img)}
                          alt=""
                          className="w-20 h-20 object-cover rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                        />
                      </a>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div className="mb-8">
              <label className="block text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                Replace Images <span className="text-gray-400 normal-case">(optional)</span>
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

              {/* New Image Previews */}
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
                        onClick={() => removeNewImage(idx)}
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

            {/* Action Buttons */}
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
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Update Product
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

      </div>
    </div>
  );
}

export default EditProduct;