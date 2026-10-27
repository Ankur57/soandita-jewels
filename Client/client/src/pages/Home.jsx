import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

import { getImageUrl } from "../utils/imageHelper";

const defaultPromos = [
  {
    _id: "default-1",
    image: promoPopular,
    title: "Unveil the Essence of\nExploration Through\nExquisite Jewelry",
    buttonText: "Discover our Popular Jewelry",
    link: "/shop",
  },
  {
    _id: "default-2",
    image: promoWedding,
    title: "Revel in Love's\nSplendor with Timeless\nElegance",
    buttonText: "Discover our Wedding Jewelry",
    link: "/shop",
  },
];

const defaultSeasons = [
  { _id: "default-s1", image: seasonClassicGold, label: "Classic Gold", link: "/shop" },
  { _id: "default-s2", image: seasonStainlessSteel, label: "Stainless Steel\n& Tarnish Proof", link: "/shop" },
  { _id: "default-s3", image: seasonEmerald, label: "Emerald", link: "/shop" },
  { _id: "default-s4", image: seasonDemiFine, label: "Demi Fine", link: "/shop" },
  { _id: "default-s5", image: seasonChokers, label: "Chokers", link: "/shop" },
  { _id: "default-s6", image: seasonTemple, label: "Temple", link: "/shop" },
];

function Home() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
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

  // ── Promos State ──
  const [promos, setPromos] = useState([]);
  const [editPromosMode, setEditPromosMode] = useState(false);
  const [uploadingPromo, setUploadingPromo] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState(null);
  const [promoForm, setPromoForm] = useState({ title: "", buttonText: "", link: "" });
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [newPromo, setNewPromo] = useState({ title: "", buttonText: "Discover Now", link: "/shop" });
  const [newPromoFile, setNewPromoFile] = useState(null);

  // ── Season Trends State ──
  const [seasonTrends, setSeasonTrends] = useState([]);
  const [editSeasonsMode, setEditSeasonsMode] = useState(false);
  const [uploadingSeason, setUploadingSeason] = useState(false);
  const [editingSeasonId, setEditingSeasonId] = useState(null);
  const [seasonForm, setSeasonForm] = useState({ label: "", link: "" });
  const [showAddSeason, setShowAddSeason] = useState(false);
  const [newSeason, setNewSeason] = useState({ label: "", link: "/shop" });
  const [newSeasonFile, setNewSeasonFile] = useState(null);

  const isAdmin = user && user.role === "admin";

  const displayPromos = promos.length > 0 ? promos : defaultPromos;
  const displaySeasons = seasonTrends.length > 0 ? seasonTrends : defaultSeasons;

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

  // ── Fetch promos ──
  const fetchPromos = useCallback(async () => {
    try {
      const res = await axios.get("/promos");
      setPromos(res.data);
    } catch (err) {
      console.error("Failed to load promos", err);
    }
  }, []);

  // ── Fetch season trends ──
  const fetchSeasonTrends = useCallback(async () => {
    try {
      const res = await axios.get("/season-trends");
      setSeasonTrends(res.data);
    } catch (err) {
      console.error("Failed to load season trends", err);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
    fetchCategories();
    fetchProducts();
    fetchPromos();
    fetchSeasonTrends();
  }, [fetchBanners, fetchCategories, fetchProducts, fetchPromos, fetchSeasonTrends]);

  // Open edit modal directly if URL query param exists (e.g. from Admin Dashboard)
  useEffect(() => {
    if (isAdmin) {
      const edit = searchParams.get("edit");
      if (edit === "banners") setEditMode(true);
      if (edit === "promos") setEditPromosMode(true);
      if (edit === "seasons") setEditSeasonsMode(true);
    }
  }, [searchParams, isAdmin]);

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
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
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

  const [uploadingCatId, setUploadingCatId] = useState(null);

  // ── Admin: Upload / update category image ──
  const handleCategoryUpload = async (catId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCatId(catId);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await axios.put(`/categories/${catId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchCategories();
    } catch (err) {
      console.error("Failed to update category image", err);
    } finally {
      setUploadingCatId(null);
      e.target.value = "";
    }
  };

  // ── Promos Handlers ──
  const handleReplacePromo = async (promoId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPromo(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await axios.put(`/promos/${promoId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchPromos();
    } catch (err) {
      console.error("Failed to replace promo image", err);
    } finally {
      setUploadingPromo(false);
      e.target.value = "";
    }
  };

  const handleUpdatePromoText = async (promoId) => {
    setUploadingPromo(true);
    try {
      await axios.put(`/promos/${promoId}`, promoForm);
      await fetchPromos();
      setEditingPromoId(null);
    } catch (err) {
      console.error("Failed to update promo details", err);
    } finally {
      setUploadingPromo(false);
    }
  };

  const handleDeletePromo = async (promoId) => {
    if (!window.confirm("Delete this promotional banner?")) return;
    try {
      await axios.delete(`/promos/${promoId}`);
      await fetchPromos();
    } catch (err) {
      console.error("Failed to delete promo", err);
    }
  };

  const handleAddPromo = async (e) => {
    e.preventDefault();
    if (!newPromoFile) {
      alert("Please select an image");
      return;
    }
    setUploadingPromo(true);
    try {
      const formData = new FormData();
      formData.append("image", newPromoFile);
      formData.append("title", newPromo.title);
      formData.append("buttonText", newPromo.buttonText);
      formData.append("link", newPromo.link);
      await axios.post("/promos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchPromos();
      setNewPromo({ title: "", buttonText: "Discover Now", link: "/shop" });
      setNewPromoFile(null);
      setShowAddPromo(false);
    } catch (err) {
      console.error("Failed to add promo", err);
    } finally {
      setUploadingPromo(false);
    }
  };

  // ── Season Trends Handlers ──
  const handleReplaceSeason = async (seasonId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSeason(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await axios.put(`/season-trends/${seasonId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchSeasonTrends();
    } catch (err) {
      console.error("Failed to replace season trend image", err);
    } finally {
      setUploadingSeason(false);
      e.target.value = "";
    }
  };

  const handleUpdateSeasonText = async (seasonId) => {
    setUploadingSeason(true);
    try {
      await axios.put(`/season-trends/${seasonId}`, seasonForm);
      await fetchSeasonTrends();
      setEditingSeasonId(null);
    } catch (err) {
      console.error("Failed to update season trend details", err);
    } finally {
      setUploadingSeason(false);
    }
  };

  const handleDeleteSeason = async (seasonId) => {
    if (!window.confirm("Delete this season trend?")) return;
    try {
      await axios.delete(`/season-trends/${seasonId}`);
      await fetchSeasonTrends();
    } catch (err) {
      console.error("Failed to delete season trend", err);
    }
  };

  const handleAddSeason = async (e) => {
    e.preventDefault();
    if (!newSeasonFile) {
      alert("Please select an image");
      return;
    }
    setUploadingSeason(true);
    try {
      const formData = new FormData();
      formData.append("image", newSeasonFile);
      formData.append("label", newSeason.label);
      formData.append("link", newSeason.link);
      await axios.post("/season-trends", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchSeasonTrends();
      setNewSeason({ label: "", link: "/shop" });
      setNewSeasonFile(null);
      setShowAddSeason(false);
    } catch (err) {
      console.error("Failed to add season trend", err);
    } finally {
      setUploadingSeason(false);
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
                  src={getImageUrl(banner.image)}
                  alt="Banner"
                  className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] object-cover"
                />
              </div>
            ))}
          </div>

          {/* Left arrow */}
          {banners.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
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
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(idx);
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
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
                        src={getImageUrl(banner.image)}
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
                <div
                  key={cat._id}
                  className="group relative flex-shrink-0 w-[140px] sm:w-[170px] md:w-[200px]"
                >
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="block"
                  >
                    <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-yellow-300 group-hover:shadow-md transition-all duration-300 relative">
                      {cat.image ? (
                        <img
                          src={getImageUrl(cat.image)}
                          alt={cat.name}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.parentElement.querySelector(".cat-fallback");
                            if (fallback) fallback.classList.remove("hidden");
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : null}
                      <div
                        className={`cat-fallback w-full h-full flex flex-col items-center justify-center text-gray-300 p-2 ${
                          cat.image ? "hidden" : "flex"
                        }`}
                      >
                        <svg className="w-12 h-12 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {isAdmin && (
                          <span className="text-[10px] text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full font-medium">
                            + Add Image
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-center text-sm md:text-base font-medium text-gray-700 group-hover:text-yellow-800 transition-colors truncate">
                      {cat.name}
                    </p>
                  </Link>

                  {/* Admin quick image upload button overlay */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 z-20">
                      <label
                        className="w-7 h-7 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-800 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-110 border border-gray-200"
                        title="Upload / Change category image"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {uploadingCatId === cat._id ? (
                          <div className="w-3.5 h-3.5 border-2 border-yellow-700 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        <input
                          type="file"
                          accept="image/*,.heic,.heif,.avif"
                          className="hidden"
                          disabled={uploadingCatId === cat._id}
                          onChange={(e) => handleCategoryUpload(cat._id, e)}
                        />
                      </label>
                    </div>
                  )}
                </div>
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
      <div className="px-[5%] pb-12 md:pb-16 relative">
        {isAdmin && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setEditPromosMode(true)}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium uppercase tracking-wider rounded-lg shadow-sm border border-gray-200 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Edit Promo Cards
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {displayPromos.map((promo, idx) => (
            <Link
              key={promo._id || idx}
              to={promo.link || "/shop"}
              className="group relative block overflow-hidden rounded-2xl h-[280px] sm:h-[320px] md:h-[360px]"
            >
              <img
                src={getImageUrl(promo.image)}
                alt={promo.title || "Promotional Jewelry"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-8">
                <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-serif italic leading-snug mb-4 whitespace-pre-line">
                  {promo.title}
                </h3>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 hover:bg-white text-gray-800 text-xs font-medium uppercase tracking-wider rounded-full transition-colors">
                  {promo.buttonText || "Discover Now"}
                </span>
              </div>
            </Link>
          ))}
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
                        src={getImageUrl(product.images[0])}
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
      <div className="px-[5%] pb-12 md:pb-16 relative">
        <div className="flex items-center justify-between mb-8">
          <div className="w-24 sm:w-36 hidden sm:block" />
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight text-center flex-1">
            Shop by Season Trends
          </h2>
          <div className="flex justify-end">
            {isAdmin && (
              <button
                onClick={() => setEditSeasonsMode(true)}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium uppercase tracking-wider rounded-lg shadow-sm border border-gray-200 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit Season Trends
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {displaySeasons.map((item, idx) => (
            <Link
              key={item._id || idx}
              to={item.link || "/shop"}
              className="group relative block overflow-hidden rounded-2xl h-[180px] sm:h-[220px] md:h-[260px]"
            >
              <img
                src={getImageUrl(item.image)}
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

      {/* ════════════ ADMIN PROMOS EDIT PANEL ════════════ */}
      {isAdmin && editPromosMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:w-[680px] sm:max-h-[85vh] max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Manage Promotional Cards</h2>
                <p className="text-xs text-gray-500">Edit titles, buttons, links, or replace card images</p>
              </div>
              <button
                onClick={() => setEditPromosMode(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cards List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {uploadingPromo && (
                <div className="flex items-center justify-center py-3 bg-yellow-50 rounded-xl">
                  <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-sm font-medium text-yellow-800">Processing changes…</span>
                </div>
              )}

              {displayPromos.map((promo, idx) => (
                <div
                  key={promo._id || idx}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-4">
                    {/* Image Thumbnail with change overlay */}
                    <div className="relative group/thumb w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                      <img
                        src={getImageUrl(promo.image)}
                        alt={promo.title}
                        className="w-full h-full object-cover"
                      />
                      <label
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-xs font-medium gap-1"
                        title="Change image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleReplacePromo(promo._id, e)}
                        />
                      </label>
                    </div>

                    {/* Content / Info */}
                    <div className="flex-1 min-w-0">
                      {editingPromoId === promo._id ? (
                        <div className="space-y-2">
                          <div>
                            <label className="text-[11px] font-semibold text-gray-500 uppercase">Title</label>
                            <textarea
                              value={promoForm.title}
                              onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                              rows={2}
                              className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-600 bg-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] font-semibold text-gray-500 uppercase">Button Text</label>
                              <input
                                type="text"
                                value={promoForm.buttonText}
                                onChange={(e) => setPromoForm({ ...promoForm, buttonText: e.target.value })}
                                className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-600 bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-gray-500 uppercase">Link URL</label>
                              <input
                                type="text"
                                value={promoForm.link}
                                onChange={(e) => setPromoForm({ ...promoForm, link: e.target.value })}
                                className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-600 bg-white"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleUpdatePromoText(promo._id)}
                              className="px-3 py-1 bg-yellow-700 text-white text-xs font-medium rounded-lg hover:bg-yellow-800 transition-colors"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditingPromoId(null)}
                              className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-semibold text-gray-800 whitespace-pre-line mb-1">
                            {promo.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="bg-white px-2 py-0.5 rounded border border-gray-200 font-medium text-gray-700">
                              Button: {promo.buttonText}
                            </span>
                            <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500 truncate max-w-[180px]">
                              Link: {promo.link || "/shop"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons (when not editing) */}
                    {editingPromoId !== promo._id && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingPromoId(promo._id);
                            setPromoForm({
                              title: promo.title || "",
                              buttonText: promo.buttonText || "",
                              link: promo.link || "/shop",
                            });
                          }}
                          className="p-2 hover:bg-yellow-50 text-yellow-700 rounded-lg transition-colors"
                          title="Edit text"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                        {promo._id && !promo._id.startsWith("default") && (
                          <button
                            onClick={() => handleDeletePromo(promo._id)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                            title="Delete card"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Section */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              {!showAddPromo ? (
                <button
                  onClick={() => setShowAddPromo(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-yellow-700 hover:bg-yellow-800 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add New Promotional Card
                </button>
              ) : (
                <form onSubmit={handleAddPromo} className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">New Promotional Card</h4>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 block mb-1">Image <span className="text-red-500">*</span></label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setNewPromoFile(e.target.files[0])}
                      className="text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-yellow-50 file:text-yellow-800 hover:file:bg-yellow-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 block mb-1">Title</label>
                    <textarea
                      value={newPromo.title}
                      onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                      placeholder="e.g. Unveil the Essence of Exploration..."
                      rows={2}
                      className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-gray-600 block mb-1">Button Text</label>
                      <input
                        type="text"
                        value={newPromo.buttonText}
                        onChange={(e) => setNewPromo({ ...newPromo, buttonText: e.target.value })}
                        className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-600 block mb-1">Link URL</label>
                      <input
                        type="text"
                        value={newPromo.link}
                        onChange={(e) => setNewPromo({ ...newPromo, link: e.target.value })}
                        className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-600"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={uploadingPromo}
                      className="flex-1 py-2 bg-yellow-700 hover:bg-yellow-800 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {uploadingPromo ? "Saving..." : "Create Card"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPromo(false);
                        setNewPromoFile(null);
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ ADMIN SEASON TRENDS EDIT PANEL ════════════ */}
      {isAdmin && editSeasonsMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:w-[680px] sm:max-h-[85vh] max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Manage Shop by Season Trends</h2>
                <p className="text-xs text-gray-500">Edit titles, trend destinations, or replace images</p>
              </div>
              <button
                onClick={() => setEditSeasonsMode(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Trends List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {uploadingSeason && (
                <div className="flex items-center justify-center py-3 bg-yellow-50 rounded-xl">
                  <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-sm font-medium text-yellow-800">Processing changes…</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displaySeasons.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3"
                  >
                    {/* Image Thumbnail with change overlay */}
                    <div className="relative group/season w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                      <label
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover/season:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-[10px] font-medium"
                        title="Change image"
                      >
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleReplaceSeason(item._id, e)}
                        />
                      </label>
                    </div>

                    {/* Content / Info */}
                    <div className="flex-1 min-w-0">
                      {editingSeasonId === item._id ? (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={seasonForm.label}
                            onChange={(e) => setSeasonForm({ ...seasonForm, label: e.target.value })}
                            placeholder="Trend Label"
                            className="w-full p-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600 bg-white"
                          />
                          <input
                            type="text"
                            value={seasonForm.link}
                            onChange={(e) => setSeasonForm({ ...seasonForm, link: e.target.value })}
                            placeholder="Link URL (e.g. /shop)"
                            className="w-full p-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600 bg-white"
                          />
                          <div className="flex gap-1.5 pt-0.5">
                            <button
                              onClick={() => handleUpdateSeasonText(item._id)}
                              className="px-2.5 py-0.5 bg-yellow-700 text-white text-[11px] font-medium rounded hover:bg-yellow-800 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingSeasonId(null)}
                              className="px-2.5 py-0.5 bg-gray-200 text-gray-700 text-[11px] font-medium rounded hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-gray-800 whitespace-pre-line truncate">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {item.link || "/shop"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons (when not editing) */}
                    {editingSeasonId !== item._id && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingSeasonId(item._id);
                            setSeasonForm({
                              label: item.label || "",
                              link: item.link || "/shop",
                            });
                          }}
                          className="p-1.5 hover:bg-yellow-50 text-yellow-700 rounded transition-colors"
                          title="Edit label & link"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                        {item._id && !item._id.startsWith("default") && (
                          <button
                            onClick={() => handleDeleteSeason(item._id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"
                            title="Delete trend"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Section */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              {!showAddSeason ? (
                <button
                  onClick={() => setShowAddSeason(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-yellow-700 hover:bg-yellow-800 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add New Season Trend
                </button>
              ) : (
                <form onSubmit={handleAddSeason} className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">New Season Trend</h4>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 block mb-1">Image <span className="text-red-500">*</span></label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setNewSeasonFile(e.target.files[0])}
                      className="text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-yellow-50 file:text-yellow-800 hover:file:bg-yellow-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-gray-600 block mb-1">Label <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={newSeason.label}
                        onChange={(e) => setNewSeason({ ...newSeason, label: e.target.value })}
                        placeholder="e.g. Classic Gold"
                        className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-600 block mb-1">Link URL</label>
                      <input
                        type="text"
                        value={newSeason.link}
                        onChange={(e) => setNewSeason({ ...newSeason, link: e.target.value })}
                        className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-600"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={uploadingSeason}
                      className="flex-1 py-2 bg-yellow-700 hover:bg-yellow-800 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {uploadingSeason ? "Saving..." : "Create Trend"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSeason(false);
                        setNewSeasonFile(null);
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;