import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

const IMAGE_BASE_URL = "http://localhost:5000";

function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [availability, setAvailability] = useState("all"); // all | inStock | outOfStock
  const [sortBy, setSortBy] = useState("newest");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mobile filter toggle
  const [showFilters, setShowFilters] = useState(false);

  // Grid layout
  const [gridCols, setGridCols] = useState(3);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/products/get", {
          params: { page, limit: 12, search },
        });
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, search]);

  // Client-side filtering for category, price, availability
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) => p.categoryId?._id === selectedCategory || p.categoryId === selectedCategory
      );
    }

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (availability === "inStock") {
      filtered = filtered.filter((p) => p.stock > 0);
    } else if (availability === "outOfStock") {
      filtered = filtered.filter((p) => p.stock === 0);
    }

    // Sorting
    switch (sortBy) {
      case "priceLow":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "nameAZ":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameZA":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return filtered;
  }, [products, selectedCategory, priceRange, availability, sortBy]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const clearFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, 500000]);
    setAvailability("all");
    setSortBy("newest");
    setSearch("");
  };

  const activeFilterCount = [
    selectedCategory !== "all",
    priceRange[0] > 0 || priceRange[1] < 500000,
    availability !== "all",
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* ── Page Header ── */}
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-700 font-medium mb-2">Curated Collection</p>
        <h1 className="text-3xl md:text-4xl font-serif italic text-gray-800 mb-3">Our Jewellery</h1>
        <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 mx-auto rounded-full" />
        <p className="text-gray-400 text-sm mt-3 max-w-lg mx-auto">
          Explore our exquisite range of handcrafted jewelry, each piece designed with passion and precision
        </p>
      </div>

      {/* ── Search Bar + Controls ── */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search jewelry by name, category, or SKU…"
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all shadow-sm"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all shadow-sm cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="priceLow">Price: Low → High</option>
          <option value="priceHigh">Price: High → Low</option>
          <option value="nameAZ">Name: A → Z</option>
          <option value="nameZA">Name: Z → A</option>
        </select>

        {/* Grid toggle (desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {[2, 3, 4].map((cols) => (
            <button key={cols} onClick={() => setGridCols(cols)}
              className={`p-2 rounded-lg transition-colors ${gridCols === cols ? "bg-yellow-100 text-yellow-800" : "text-gray-400 hover:text-gray-600"}`}>
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                {cols === 2 && <><rect x="0" y="0" width="7" height="7" rx="1" /><rect x="9" y="0" width="7" height="7" rx="1" /><rect x="0" y="9" width="7" height="7" rx="1" /><rect x="9" y="9" width="7" height="7" rx="1" /></>}
                {cols === 3 && <><rect x="0" y="0" width="4" height="7" rx="1" /><rect x="6" y="0" width="4" height="7" rx="1" /><rect x="12" y="0" width="4" height="7" rx="1" /><rect x="0" y="9" width="4" height="7" rx="1" /><rect x="6" y="9" width="4" height="7" rx="1" /><rect x="12" y="9" width="4" height="7" rx="1" /></>}
                {cols === 4 && <><rect x="0" y="0" width="3" height="7" rx="0.5" /><rect x="4.33" y="0" width="3" height="7" rx="0.5" /><rect x="8.66" y="0" width="3" height="7" rx="0.5" /><rect x="13" y="0" width="3" height="7" rx="0.5" /><rect x="0" y="9" width="3" height="7" rx="0.5" /><rect x="4.33" y="9" width="3" height="7" rx="0.5" /><rect x="8.66" y="9" width="3" height="7" rx="0.5" /><rect x="13" y="9" width="3" height="7" rx="0.5" /></>}
              </svg>
            </button>
          ))}
        </div>

        {/* Mobile filter toggle */}
        <button onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 shadow-sm relative">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 text-[10px] bg-yellow-600 text-white rounded-full flex items-center justify-center font-semibold">{activeFilterCount}</span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* ── Sidebar Filters ── */}
        <aside className={`${showFilters ? "fixed inset-0 z-50 bg-black/40" : "hidden"} md:block md:static md:z-auto md:bg-transparent`}>
          <div className={`${showFilters ? "absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto" : ""} md:w-60 flex-shrink-0 space-y-6`}>
            {/* Mobile close button */}
            {showFilters && (
              <div className="flex items-center justify-between mb-4 md:hidden">
                <h3 className="text-lg font-serif italic text-gray-800">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            {/* Category Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Category</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === "all" ? "bg-yellow-50 text-yellow-800 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat._id ? "bg-yellow-50 text-yellow-800 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Price Range</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span className="flex-1 text-center">—</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={1000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-yellow-600"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Availability</h3>
              <div className="space-y-1.5">
                {[
                  { id: "all", label: "All Items" },
                  { id: "inStock", label: "In Stock" },
                  { id: "outOfStock", label: "Out of Stock" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setAvailability(opt.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${availability === opt.id ? "bg-yellow-50 text-yellow-800 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.id === "inStock" ? "bg-green-400" : opt.id === "outOfStock" ? "bg-red-400" : "bg-gray-300"}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* ── Products Grid ── */}
        <div className="flex-1">
          {/* Results count */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-800">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "product" : "products"}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl aspect-square mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-red-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
              <p className="text-gray-500 mb-1">No products found</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters or search term</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="mt-3 text-sm text-yellow-700 hover:text-yellow-800 font-medium">Clear all filters</button>
              )}
            </div>
          ) : (
            <>
              <div className={`grid gap-6 grid-cols-1 ${gridCols === 2 ? "sm:grid-cols-2" :
                  gridCols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" :
                    "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }`}>
                {filteredProducts.map((product) => (
                  <Link
                    to={`/product/${product._id}`}
                    key={product._id}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-yellow-200/50 transition-all duration-300"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? `${IMAGE_BASE_URL}${product.images[0]}`
                            : "https://via.placeholder.com/600x600?text=No+Image"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Stock badge */}
                      {product.stock === 0 && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-[10px] uppercase tracking-wider font-semibold rounded-full">
                          Sold Out
                        </div>
                      )}

                      {/* Quick-view overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100">
                        <span className="px-5 py-2 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-medium uppercase tracking-wider rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          View Details
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      {/* Category chip */}
                      {product.categoryId?.name && (
                        <p className="text-[10px] uppercase tracking-widest text-yellow-700 font-medium mb-1.5">
                          {product.categoryId.name}
                        </p>
                      )}

                      <h3 className="text-gray-800 font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-yellow-800 transition-colors">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between">
                        <p className="text-gray-800 font-semibold">
                          {formatPrice(product.price)}
                        </p>
                        {product.stock > 0 && product.stock <= 5 && (
                          <span className="text-[10px] text-orange-600 font-medium">
                            Only {product.stock} left
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === i + 1
                          ? "bg-gradient-to-r from-yellow-700 to-yellow-600 text-white shadow-lg shadow-yellow-700/20"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Shop;