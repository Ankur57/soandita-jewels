import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";

import { getImageUrl } from "../../utils/imageHelper";

function AdminProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get(`/products/get/${id}`);
      setProduct(res.data);
    };
    fetchProduct();
  }, [id]);

  /* ─── Loading Skeleton ─── */
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="h-8 w-32 bg-gray-200 rounded-lg mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-10 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-6 w-1/4 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-6 w-1/3 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mainImage = product.images?.[selectedImage] || product.images?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-4 md:p-8 lg:p-10">
      <div className="max-w-5xl mx-auto">

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
          <span className="text-gray-700 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ─── Image Gallery ─── */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden mb-4">
              {mainImage ? (
                <a
                  href={getImageUrl(mainImage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={getImageUrl(mainImage)}
                    alt={product.name}
                    className="w-full h-80 md:h-96 object-contain bg-gray-50 hover:scale-105 transition-transform duration-500"
                  />
                </a>
              ) : (
                <div className="w-full h-80 md:h-96 bg-gray-50 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedImage === index
                        ? "border-indigo-500 shadow-md shadow-indigo-100 scale-105"
                        : "border-gray-100 hover:border-gray-300"
                      }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Product Info ─── */}
          <div>
            {/* Status + SKU */}
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${product.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                {product.isActive ? "Active" : "Inactive"}
              </span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-mono font-medium">
                SKU: {product.sku}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ₹ {product.price?.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Stock</p>
                <p className={`text-xl font-bold ${product.stock > 10 ? "text-emerald-600" : product.stock > 0 ? "text-amber-600" : "text-red-600"
                  }`}>
                  {product.stock > 0 ? product.stock : "Out of Stock"}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Category</p>
                <p className="text-sm font-semibold text-gray-800">
                  {product.categoryId?.name || "Uncategorized"}
                </p>
              </div>
            </div>

            {/* Slug */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Slug</p>
              <p className="text-sm text-gray-600 font-mono">{product.slug}</p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Timestamps */}
            <div className="border-t border-gray-100 pt-4 mb-8">
              <div className="flex gap-6 text-xs text-gray-400">
                {product.createdAt && (
                  <span>
                    Created: {new Date(product.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                )}
                {product.updatedAt && (
                  <span>
                    Updated: {new Date(product.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link
                to={`/admin/edit-product/${product._id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Product
              </Link>
              <Link
                to="/admin/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold text-sm rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                ← Back
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminProductDetails;