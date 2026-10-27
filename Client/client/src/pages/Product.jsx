import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import { useCart } from "../context/CartContext";

import { getImageUrl } from "../utils/imageHelper";

function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Image gallery
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Lightbox & Zoom states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Accordion sections
  const [openSection, setOpenSection] = useState("details");

  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const images = product?.images && product.images.length > 0 ? product.images : [];

  const openLightbox = (index = selectedImage) => {
    setLightboxIndex(index);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const nextLightboxImage = useCallback(() => {
    if (images.length <= 1) return;
    setLightboxIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [images.length]);

  const prevLightboxImage = useCallback(() => {
    if (images.length <= 1) return;
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [images.length]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.5).toFixed(1)), 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(Number((prev - 0.5).toFixed(1)), 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleImageDoubleClick = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2.5);
    } else {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(Number((prev - 0.25).toFixed(2)), 1);
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (zoomLevel === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e) => {
    if (zoomLevel === 1) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (zoomLevel === 1 && touchStartX.current && touchEndX.current) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextLightboxImage();
        else prevLightboxImage();
      }
      touchStartX.current = 0;
      touchEndX.current = 0;
    }
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        prevLightboxImage();
      } else if (e.key === "ArrowRight") {
        nextLightboxImage();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, prevLightboxImage, nextLightboxImage]);

  // Handle Share Modal Escape key & overflow lock
  useEffect(() => {
    if (!isShareModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsShareModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isShareModalOpen]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/products/get/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    setSelectedImage(0);
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      setMessage("");

      await axios.post("/cart/add", {
        productId: id,
        quantity,
      });

      setMessage("Added to cart successfully!");
      setMessageType("success");
      refreshCartCount();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      if (err.response?.status === 401) {
        setMessage("Please login to add items to cart");
        setMessageType("error");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(err.response?.data?.message || "Failed to add to cart");
        setMessageType("error");
      }
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  // Share handlers & links
  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "Soandita Jewels",
          text: `Check out ${product?.name} at Soandita Jewels`,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    }
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = product?.name || "Soandita Jewels";
  const shareText = `Check out this exquisite piece, "${product?.name || "Jewellery"}", on Soandita Jewels!`;
  const mainProductImageUrl = images.length > 0 ? getImageUrl(images[0]) : "";

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(mainProductImageUrl)}&description=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent(`Check out ${shareTitle} at Soandita Jewels`)}&body=${encodeURIComponent(`Hi,\n\nI found this gorgeous jewellery on Soandita Jewels and thought you would love it:\n\n${shareTitle}\nPrice: ${product ? formatPrice(product.price) : ""}\n\nView it here:\n${currentUrl}\n`)}`,
  };

  const handleBackToShop = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      const lastShopUrl = sessionStorage.getItem("shop_last_url") || "/shop";
      navigate(lastShopUrl);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg" />
              ))}
            </div>
            <div className="flex-1 aspect-square bg-gray-200 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 text-center">
        <svg className="w-16 h-16 mx-auto text-red-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          type="button"
          onClick={handleBackToShop}
          className="text-yellow-700 hover:text-yellow-800 font-medium cursor-pointer inline-flex items-center gap-1"
        >
          ← Back to Shop
        </button>
      </div>
    );
  }

  if (!product) return null;

  const inStock = product.stock > 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* ── Breadcrumb + Back Button ── */}
      <div className="flex items-center justify-between mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <button
            type="button"
            onClick={handleBackToShop}
            className="hover:text-gray-600 transition-colors cursor-pointer"
          >
            Shop
          </button>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          {product.categoryId?.name && (
            <>
              <Link
                to={`/shop?category=${product.categoryId.slug || ""}`}
                className="hover:text-gray-600 transition-colors"
              >
                {product.categoryId.name}
              </Link>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </>
          )}
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <button
          type="button"
          onClick={handleBackToShop}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-yellow-800 bg-gray-50 hover:bg-yellow-50 px-3 py-1.5 rounded-full border border-gray-200 hover:border-yellow-200 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Shop
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14">
        {/* ═══════════════════════════════════════════
            LEFT — Image Gallery
        ═══════════════════════════════════════════ */}
        <div className="flex gap-4">
          {/* Thumbnail Strip (vertical) */}
          {images.length > 1 && (
            <div className="flex flex-col gap-3 flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 relative group/thumb ${selectedImage === i
                    ? "border-yellow-600 shadow-lg shadow-yellow-700/20 ring-1 ring-yellow-400/30"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(i);
                    }}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white"
                    title="Click to Zoom"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="flex-1 relative group">
            <div
              onClick={() => openLightbox(selectedImage)}
              className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative cursor-zoom-in group/img"
            >
              {images.length > 0 ? (
                <img
                  src={getImageUrl(images[selectedImage])}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                </div>
              )}

              {/* Click to zoom overlay badge */}
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/15 transition-colors flex items-center justify-center pointer-events-none">
                <span className="opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/75 backdrop-blur-md text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 transform translate-y-2 group-hover/img:translate-y-0 duration-300 border border-white/10">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                  Click to Zoom & View All Photos ({images.length})
                </span>
              </div>
            </div>

            {/* Expand button top-right */}
            <button
              onClick={() => openLightbox(selectedImage)}
              className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-800 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 z-10 border border-gray-100"
              title="Expand & Zoom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </button>

            {/* Image counter badge */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
                {selectedImage + 1} / {images.length}
              </div>
            )}

            {/* Stock badge */}
            {!inStock && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-xs uppercase tracking-wider font-semibold rounded-full">
                Sold Out
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            RIGHT — Product Info
        ═══════════════════════════════════════════ */}
        <div>
          {/* Category */}
          {product.categoryId?.name && (
            <p className="text-xs uppercase tracking-[0.2em] text-yellow-700 font-medium mb-2">
              {product.categoryId.name}
            </p>
          )}

          {/* Name & Share Button */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-serif italic text-gray-800 leading-snug">
              {product.name}
            </h1>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="p-2.5 rounded-full border border-gray-200 text-gray-500 hover:text-yellow-800 hover:border-yellow-600 hover:bg-yellow-50/60 transition-all cursor-pointer flex-shrink-0 shadow-sm mt-0.5 group"
              title="Share this product"
              aria-label="Share product"
            >
              <svg className="w-5 h-5 text-gray-500 group-hover:text-yellow-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl md:text-3xl font-semibold text-gray-800">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-gray-400">(Inclusive of all taxes)</span>
          </div>

          <div className="w-full h-px bg-gray-100 mb-6" />

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Quantity</p>
            <div className="flex items-center gap-0 border border-gray-200 rounded-xl w-fit overflow-hidden">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
                className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
              >
                −
              </button>
              <span className="w-12 h-11 flex items-center justify-center text-sm font-medium text-gray-800 border-x border-gray-200 bg-gray-50/50">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                disabled={quantity >= product.stock}
                className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
              >
                +
              </button>
            </div>
            {inStock && product.stock <= 10 && (
              <p className="text-xs text-orange-600 mt-2 font-medium">Only {product.stock} left in stock</p>
            )}
          </div>

          {/* Action Buttons: Add to Cart & Share */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || !inStock}
              className={`flex-1 py-4 rounded-xl text-sm font-medium uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${inStock
                ? "bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 hover:from-yellow-800 hover:via-yellow-700 hover:to-yellow-800 text-white shadow-yellow-700/20 hover:shadow-yellow-800/30"
                : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                }`}
            >
              {adding ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Adding…</>
              ) : !inStock ? (
                "Out of Stock"
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                  Add to Cart
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="py-4 px-5 rounded-xl border border-gray-200 hover:border-yellow-600 bg-white hover:bg-yellow-50/40 text-gray-700 hover:text-yellow-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm font-medium text-sm flex-shrink-0 cursor-pointer group"
              title="Share this product"
            >
              <svg className="w-5 h-5 text-gray-500 group-hover:text-yellow-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          {/* Success / Error Message */}
          {message && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mt-4 ${messageType === "success"
              ? "bg-green-50 border border-green-100"
              : "bg-red-50 border border-red-100"
              }`}>
              {messageType === "success" ? (
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              )}
              <p className={`text-sm ${messageType === "success" ? "text-green-700" : "text-red-600"}`}>{message}</p>
            </div>
          )}

          {/* ── Trust Badges ── */}
          <div className="mt-6 space-y-2.5">
            <div className="flex items-center gap-3 text-gray-600 text-sm">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
              <span><strong className="text-gray-800">Free Shipping</strong> on all prepaid orders</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 text-sm">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
              <span><strong className="text-gray-800">Authentic Jewellery</strong> — Quality Guaranteed</span>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100 my-6" />

          {/* ── Accordion Sections ── */}
          <div className="space-y-0 border border-gray-200 rounded-xl overflow-hidden">
            {/* Product Details */}
            <div className="border-b border-gray-200 last:border-b-0">
              <button
                onClick={() => setOpenSection(openSection === "details" ? "" : "details")}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50/50 transition-colors"
              >
                <span className="uppercase tracking-wider text-xs">Product Details</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openSection === "details" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openSection === "details" ? "max-h-96" : "max-h-0"}`}>
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                  {product.description}

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">SKU</p>
                      <p className="text-gray-700 font-medium text-xs">{product.sku}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Category</p>
                      <p className="text-gray-700 font-medium text-xs">{product.categoryId?.name || "—"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Availability</p>
                      <p className={`font-medium text-xs ${inStock ? "text-green-600" : "text-red-500"}`}>
                        {inStock ? `In Stock (${product.stock})` : "Out of Stock"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery & Returns */}
            <div>
              <button
                onClick={() => setOpenSection(openSection === "delivery" ? "" : "delivery")}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50/50 transition-colors"
              >
                <span className="uppercase tracking-wider text-xs">Delivery</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openSection === "delivery" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openSection === "delivery" ? "max-h-96" : "max-h-0"}`}>
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed space-y-3">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <p>Free shipping on prepaid orders across India</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <p>Standard delivery within 5–7 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════ LIGHTBOX ZOOM MODAL ════════════ */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
          onMouseUp={handleMouseUp}
        >
          {/* ── Top Bar ── */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-20">
            {/* Left: Product Name & Image Counter */}
            <div className="flex items-center gap-3 text-white">
              <h2 className="text-sm sm:text-base font-medium truncate max-w-[200px] sm:max-w-md">
                {product?.name}
              </h2>
              {images.length > 0 && (
                <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-gray-300">
                  {lightboxIndex + 1} / {images.length}
                </span>
              )}
            </div>

            {/* Right: Zoom Controls & Close */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Zoom out */}
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 rounded-full text-white transition-colors"
                title="Zoom Out (-)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>

              {/* Zoom percentage */}
              <button
                onClick={handleResetZoom}
                className="text-xs text-yellow-400 font-mono font-medium px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Reset Zoom (0)"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              {/* Zoom in */}
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 4}
                className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 rounded-full text-white transition-colors"
                title="Zoom In (+)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {/* Share */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
                title="Share this piece"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
              </button>

              <div className="h-5 w-[1px] bg-white/20 mx-1" />

              {/* Close */}
              <button
                onClick={closeLightbox}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-red-500/80 rounded-full text-white transition-all hover:scale-105"
                title="Close (Esc)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Main Zoomable Viewport ── */}
          <div
            className="relative flex-1 w-full overflow-hidden flex items-center justify-center"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Prev Button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightboxImage();
                }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
                aria-label="Previous Image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Image Display */}
            <div
              className="w-full h-full flex items-center justify-center p-4 sm:p-8"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
            >
              {images.length > 0 && (
                <img
                  src={getImageUrl(images[lightboxIndex])}
                  alt={product?.name}
                  draggable={false}
                  onDoubleClick={handleImageDoubleClick}
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                    transition: isDragging ? "none" : "transform 0.2s ease-out",
                    cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
                    maxHeight: "76vh",
                    maxWidth: "88vw",
                  }}
                  className="object-contain select-none drop-shadow-2xl rounded-lg"
                />
              )}
            </div>

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightboxImage();
                }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
                aria-label="Next Image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* ── Bottom Slider & Thumbnail Strip ── */}
          <div className="px-4 py-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-20 flex flex-col items-center gap-2">
            {/* Instruction hint */}
            <p className="text-[11px] text-gray-400 text-center hidden sm:block">
              {zoomLevel > 1
                ? "Drag to pan image • Scroll to zoom • Double-click to reset"
                : "Double-click or scroll to zoom in • Click arrows or swipe to navigate all images"}
            </p>

            {/* Thumbnails Row / Slider */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto max-w-full py-1 px-2 scrollbar-none">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setLightboxIndex(i);
                      setZoomLevel(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                      lightboxIndex === i
                        ? "border-yellow-500 scale-105 shadow-lg shadow-yellow-500/30 ring-2 ring-yellow-400/40"
                        : "border-white/20 opacity-60 hover:opacity-100 hover:border-white/50"
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          Share Modal
      ═══════════════════════════════════════════ */}
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsShareModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 relative overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 id="share-modal-title" className="text-xl font-serif italic text-gray-900">
                  Share this Piece
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Send this jewellery to friends or family for their opinion
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product Snapshot Card */}
            <div className="flex items-center gap-3.5 p-3 bg-gradient-to-r from-amber-50/70 to-yellow-50/50 rounded-xl border border-yellow-200/60 mb-5">
              {images.length > 0 ? (
                <img
                  src={getImageUrl(images[selectedImage] || images[0])}
                  alt={product.name}
                  className="w-14 h-14 rounded-lg object-cover border border-yellow-300/60 flex-shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-yellow-700 block">
                  Soandita Jewels
                </span>
                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                <p className="text-xs font-semibold text-gray-900 mt-0.5">{formatPrice(product.price)}</p>
              </div>
            </div>

            {/* Quick Share Channels */}
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Share via
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {/* WhatsApp */}
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 text-gray-700 hover:text-emerald-700 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-gray-700 hover:text-blue-700 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Facebook</span>
                </a>

                {/* X (Twitter) */}
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-300 text-gray-700 hover:text-gray-900 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">X (Twitter)</span>
                </a>

                {/* Pinterest */}
                <a
                  href={shareLinks.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-200 text-gray-700 hover:text-red-700 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E60023] flex items-center justify-center text-white mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.057.235-.188.286-.434.172-1.623-.755-2.636-3.127-2.636-5.034 0-4.101 2.979-7.87 8.59-7.87 4.51 0 8.018 3.214 8.018 7.512 0 4.482-2.825 8.09-6.746 8.09-1.317 0-2.556-.685-2.979-1.494l-.81 3.092c-.294 1.131-1.088 2.548-1.621 3.415C9.742 23.86 10.849 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Pinterest</span>
                </a>

                {/* Email */}
                <a
                  href={shareLinks.email}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-amber-50 border border-gray-100 hover:border-yellow-200 text-gray-700 hover:text-yellow-800 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-700 flex items-center justify-center text-white mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 fill-none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Email</span>
                </a>

                {/* System Share (if available) */}
                {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-yellow-50 border border-gray-100 hover:border-yellow-200 text-gray-700 hover:text-yellow-800 transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 fill-none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium">More Apps</span>
                  </button>
                )}
              </div>
            </div>

            {/* Copy Link Section */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Or copy link
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-yellow-600 transition-colors">
                <div className="pl-2.5 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-1.414l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                </div>
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  onClick={(e) => e.target.select()}
                  className="flex-1 bg-transparent text-xs text-gray-700 outline-none truncate font-mono select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                    copiedLink
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-800 hover:to-yellow-700 text-white shadow-sm"
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Product;