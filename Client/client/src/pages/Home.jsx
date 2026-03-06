import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import promoPopular from "../assets/promo_popular.png";
import promoWedding from "../assets/promo_wedding.png";
import seasonClassicGold from "../assets/season_classic_gold.png";
import seasonStainlessSteel from "../assets/season_stainless_steel.png";
import seasonEmerald from "../assets/season_emerald.png";
import seasonDemiFine from "../assets/season_demi_fine.png";
import seasonChokers from "../assets/season_chokers.png";
import seasonTemple from "../assets/season_temple.png";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

function Home() {
  const { user } = useAuth();
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const isAdmin = user && user.role === "admin";

  // ── Fetch banners ──
  const fetchBanners = useCallback(async () => {
    try {
      const res = await axios.get("/banners");
      setBanners(res.data);
    } catch (err) {
      console.error("Failed to load banners", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch categories ──
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  }, []);

  // ── Fetch products (best sellers) ──
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get("/products/get?limit=12");
      setProducts(res.data.products || res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
    fetchCategories();
    fetchProducts();
  }, [fetchBanners, fetchCategories, fetchProducts]);

  // ── Auto-slide ──
  const startAutoSlide = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % banners.length);
      }, 5000);
    }
  }, [banners.length]);

  useEffect(() => {
    if (!editMode) startAutoSlide();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoSlide, editMode]);

  const goTo = (idx) => {
    setCurrent(idx);
    startAutoSlide();
  };

  const goPrev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    startAutoSlide();
  };

  const goNext = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
    startAutoSlide();
  };

  // ── Touch/swipe ──
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  // ── Admin: Upload new banner ──
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await axios.post("/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchBanners();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ── Admin: Replace a banner image ──
  const handleReplace = async (bannerId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await axios.put(`/banners/${bannerId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchBanners();
    } catch (err) {
      console.error("Replace failed", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ── Admin: Delete a banner ──
  const handleDelete = async (bannerId) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await axios.delete(`/banners/${bannerId}`);
      await fetchBanners();
      if (current >= banners.length - 1) setCurrent(0);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-3 border-yellow-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Empty state ──
  if (banners.length === 0) {
    return (
      <div className="relative">
        <div className="flex flex-col items-center justify-center h-[50vh] bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg">No banners yet</p>
          {isAdmin && (
            <label className="mt-4 px-6 py-2.5 bg-yellow-700 text-white text-sm rounded-lg cursor-pointer hover:bg-yellow-800 transition-colors">
              + Add First Banner
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative -mx-6" style={{ width: "calc(100% + 3rem)" }}>
      {/* Outer padding: 7% each side */}
      <div className="px-[3.5%]">
        <div
          className="relative w-full overflow-hidden bg-gray-100 rounded-xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides container */}
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {banners.map((banner) => (
              <div key={banner._id} className="w-full flex-shrink-0">
                <img
                  src={`${IMAGE_BASE_URL}${banner.image}`}
                  alt="Banner"
                  className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] object-cover"
                />
              </div>
            ))}
          </div>

          {/* Left arrow */}
          {banners.length > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all z-10"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right arrow */}
          {banners.length > 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all z-10"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Dot indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`rounded-full transition-all duration-300 ${idx === current
                    ? "w-8 h-3 bg-yellow-700"
                    : "w-3 h-3 bg-white/60 hover:bg-white/90"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Admin: Edit button (overlaid on slider) */}
          {isAdmin && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="absolute top-4 right-4 px-4 py-2 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium uppercase tracking-wider rounded-lg shadow-lg backdrop-blur-sm transition-all z-10 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Edit Banners
            </button>
          )}
        </div>

        {/* ════════════ ADMIN EDIT PANEL ════════════ */}
        {isAdmin && editMode && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
            <div className="bg-white w-full sm:w-[600px] sm:max-h-[80vh] max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Manage Banners</h2>
                <button
                  onClick={() => setEditMode(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Banner list */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {uploading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-gray-500">Uploading…</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {banners.map((banner, idx) => (
                    <div
                      key={banner._id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      {/* Thumbnail */}
                      <img
                        src={`${IMAGE_BASE_URL}${banner.image}`}
                        alt={`Banner ${idx + 1}`}
                        className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded-lg flex-shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700">
                          Slide {idx + 1}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {banner.image}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Replace */}
                        <label className="p-2 hover:bg-yellow-50 rounded-lg cursor-pointer transition-colors" title="Replace image">
                          <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleReplace(banner._id, e)}
                          />
                        </label>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete banner"
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer: Add new */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <label className="flex items-center justify-center gap-2 w-full py-3 bg-yellow-700 hover:bg-yellow-800 text-white text-sm font-medium rounded-xl cursor-pointer transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add New Banner
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════════ CATEGORIES SECTION ════════════ */}
      {categories.length > 0 && (
        <div className="px-[5%] py-12 md:py-16">
          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">
              Categories
            </h2>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-700 hover:bg-yellow-800 text-white text-xs font-medium uppercase tracking-wider rounded-full transition-colors"
            >
              Shop Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Categories horizontal slider */}
          <div className="relative group/slider">
            {/* Left arrow */}
            <button
              onClick={() => {
                const el = document.getElementById("cat-slider");
                if (el) el.scrollBy({ left: -300, behavior: "smooth" });
              }}
              className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Scrollable row */}
            <div
              id="cat-slider"
              className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`#cat-slider::-webkit-scrollbar { display: none; }`}</style>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat.slug}`}
                  className="group block flex-shrink-0 w-[140px] sm:w-[170px] md:w-[200px]"
                >
                  <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-yellow-200 transition-all duration-300">
                    {cat.image ? (
                      <img
                        src={`${IMAGE_BASE_URL}${cat.image}`}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-center text-sm md:text-base font-medium text-gray-700 group-hover:text-yellow-800 transition-colors">
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => {
                const el = document.getElementById("cat-slider");
                if (el) el.scrollBy({ left: 300, behavior: "smooth" });
              }}
              className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* ════════════ PROMOTIONAL SECTION ════════════ */}
      <div className="px-[5%] pb-12 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Card 1 — Popular Jewelry */}
          <Link
            to="/shop"
            className="group relative block overflow-hidden rounded-2xl h-[280px] sm:h-[320px] md:h-[360px]"
          >
            <img
              src={promoPopular}
              alt="Popular Jewelry"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-8">
              <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-serif italic leading-snug mb-4">
                Unveil the Essence of<br />Exploration Through<br />Exquisite Jewelry
              </h3>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 hover:bg-white text-gray-800 text-xs font-medium uppercase tracking-wider rounded-full transition-colors">
                Discover our Popular Jewelry
              </span>
            </div>
          </Link>

          {/* Card 2 — Wedding Jewelry */}
          <Link
            to="/shop"
            className="group relative block overflow-hidden rounded-2xl h-[280px] sm:h-[320px] md:h-[360px]"
          >
            <img
              src={promoWedding}
              alt="Wedding Jewelry"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-8">
              <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-serif italic leading-snug mb-4">
                Revel in Love's<br />Splendor with Timeless<br />Elegance
              </h3>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 hover:bg-white text-gray-800 text-xs font-medium uppercase tracking-wider rounded-full transition-colors">
                Discover our Wedding Jewelry
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ════════════ BEST SELLERS SECTION ════════════ */}
      {products.length > 0 && (
        <div className="px-[5%] pb-12 md:pb-16">
          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">
              Best Sellers
            </h2>
            <Link
              to="/shop"
              className="text-sm font-medium text-gray-500 hover:text-yellow-800 underline underline-offset-4 transition-colors"
            >
              All Products
            </Link>
          </div>

          {/* Products horizontal slider */}
          <div className="relative group/products">
            {/* Left arrow */}
            <button
              onClick={() => {
                const el = document.getElementById("products-slider");
                if (el) el.scrollBy({ left: -300, behavior: "smooth" });
              }}
              className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/products:opacity-100 transition-opacity"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Scrollable row */}
            <div
              id="products-slider"
              className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`#products-slider::-webkit-scrollbar { display: none; }`}</style>
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="group block flex-shrink-0 w-[160px] sm:w-[190px] md:w-[220px]"
                >
                  {/* Product image */}
                  <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-yellow-200 transition-all duration-300 relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`${IMAGE_BASE_URL}${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Category tag */}
                    {product.categoryId && product.categoryId.name && (
                      <span className="absolute top-2 left-2 text-[10px] font-medium text-gray-600 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {product.categoryId.name}
                      </span>
                    )}
                  </div>
                  {/* Product info */}
                  <p className="mt-3 text-sm font-medium text-gray-800 truncate group-hover:text-yellow-800 transition-colors">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-600">
                    ₹{product.price?.toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => {
                const el = document.getElementById("products-slider");
                if (el) el.scrollBy({ left: 300, behavior: "smooth" });
              }}
              className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/products:opacity-100 transition-opacity"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ════════════ SHOP BY SEASON TRENDS ════════════ */}
      <div className="px-[5%] pb-12 md:pb-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight text-center mb-8">
          Shop by Season Trends
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {[
            { img: seasonClassicGold, label: "Classic Gold" },
            { img: seasonStainlessSteel, label: "Stainless Steel\n& Tarnish Proof" },
            { img: seasonEmerald, label: "Emerald" },
            { img: seasonDemiFine, label: "Demi Fine" },
            { img: seasonChokers, label: "Chokers" },
            { img: seasonTemple, label: "Temple" },
          ].map((item, idx) => (
            <Link
              key={idx}
              to="/shop"
              className="group relative block overflow-hidden rounded-2xl h-[180px] sm:h-[220px] md:h-[260px]"
            >
              <img
                src={item.img}
                alt={item.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-end p-4 sm:p-5">
                <span className="text-white text-sm sm:text-base md:text-lg font-medium whitespace-pre-line leading-tight">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;