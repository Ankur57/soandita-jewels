import { useEffect, useRef, useState } from "react";
import axios from "../../api/axios";
import { Link, useLocation } from "react-router-dom";

import { getImageUrl } from "../../utils/imageHelper";

/* ─── Icons ─── */
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);


function AdminProducts() {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");
  const dismissTimer = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  // Show success banner when navigated here with a message
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state from history so refresh doesn't re-show it
      window.history.replaceState({}, document.title);
      dismissTimer.current = setTimeout(() => setSuccessMessage(""), 4000);
    }
    return () => clearTimeout(dismissTimer.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `/products/get?page=${page}&limit=5&search=${search}`
      );
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    const res = await axios.put(`/products/update/${id}`, {
      isActive: !products.find((p) => p._id === id).isActive,
    });
    setProducts(products.map((p) => (p._id === id ? res.data : p)));
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/products/delete/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  /* ─── Loading Skeleton ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between mb-8">
            <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-10 w-40 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 rounded-xl animate-pulse mb-3"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-4 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Products
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage your product catalog
            </p>
          </div>
          <Link
            to="/admin/add-product"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5 transition-all duration-300"
          >
            <PlusIcon />
            Add Product
          </Link>
        </div>

        {/* ─── Success Banner ─── */}
        {successMessage && (
          <div className="mb-6 px-5 py-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-emerald-400 hover:text-emerald-700 p-1 rounded-lg hover:bg-emerald-100 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ─── Search Bar ─── */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search by SKU, name or price..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full sm:w-96 pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
          />
        </div>

        {/* ─── Products Table ─── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">

          {products.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">No Products Found</h3>
              <p className="text-gray-400 text-sm">
                {search ? "Try a different search term." : "Add your first product to get started."}
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <div className="col-span-1">Image</div>
                <div className="col-span-2">SKU</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-1">Price</div>
                <div className="col-span-1">Stock</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Product Rows */}
              {products.map((product) => (
                <div
                  key={product._id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-4 border-b border-gray-50 hover:bg-indigo-50/20 transition-colors duration-200 items-center group"
                >
                  {/* Image */}
                  <div className="col-span-1">
                    {product.images?.length > 0 ? (
                      <a
                        href={getImageUrl(product.images[0])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300"
                        />
                      </a>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* SKU */}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 lg:hidden uppercase font-semibold mb-0.5">SKU</p>
                    <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-mono font-medium">
                      {product.sku}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="col-span-3">
                    <p className="text-xs text-gray-400 lg:hidden uppercase font-semibold mb-0.5">Name</p>
                    <Link
                      to={`/admin/products/${product._id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200"
                    >
                      {product.name}
                    </Link>
                  </div>

                  {/* Price */}
                  <div className="col-span-1">
                    <p className="text-xs text-gray-400 lg:hidden uppercase font-semibold mb-0.5">Price</p>
                    <p className="text-sm font-bold text-gray-900">
                      ₹ {product.price?.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Stock */}
                  <div className="col-span-1">
                    <p className="text-xs text-gray-400 lg:hidden uppercase font-semibold mb-0.5">Stock</p>
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${product.stock > 10
                        ? "bg-emerald-50 text-emerald-700"
                        : product.stock > 0
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-600"
                        }`}
                    >
                      {product.stock > 0 ? product.stock : "Out"}
                    </span>
                  </div>

                  {/* Status Toggle */}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 lg:hidden uppercase font-semibold mb-0.5">Status</p>
                    <button
                      onClick={() => toggleStatus(product._id)}
                      className="flex items-center gap-2 group/toggle"
                    >
                      <div
                        className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${product.isActive ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${product.isActive ? "translate-x-5" : "translate-x-0.5"
                            }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-semibold ${product.isActive ? "text-emerald-600" : "text-gray-400"
                          }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Link
                      to={`/admin/products/${product._id}`}
                      className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200"
                      title="View"
                    >
                      <EyeIcon />
                    </Link>
                    <Link
                      to={`/admin/edit-product/${product._id}`}
                      className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                      title="Edit"
                    >
                      <EditIcon />
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deletingId === product._id}
                      className={`p-2 rounded-lg transition-all duration-200 ${deletingId === product._id
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        }`}
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className={`p-2 rounded-xl border transition-all duration-200 ${page === 1
                ? "border-gray-100 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
                }`}
            >
              <ChevronLeftIcon />
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${page === p
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
                    }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className={`p-2 rounded-xl border transition-all duration-200 ${page === totalPages
                ? "border-gray-100 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
                }`}
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminProducts;