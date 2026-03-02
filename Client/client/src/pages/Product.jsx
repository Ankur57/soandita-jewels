import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";

const IMAGE_BASE_URL = "http://localhost:5000";

function Product() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Image gallery
  const [selectedImage, setSelectedImage] = useState(0);

  // Accordion sections
  const [openSection, setOpenSection] = useState("details");

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
        <Link to="/shop" className="text-yellow-700 hover:text-yellow-800 font-medium">← Back to Shop</Link>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [];

  const inStock = product.stock > 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <Link to="/shop" className="hover:text-gray-600 transition-colors">Shop</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        {product.categoryId?.name && (
          <>
            <span className="hover:text-gray-600 transition-colors">{product.categoryId.name}</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </>
        )}
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

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
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${selectedImage === i
                      ? "border-yellow-600 shadow-lg shadow-yellow-700/20 ring-1 ring-yellow-400/30"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <img
                    src={`${IMAGE_BASE_URL}${img}`}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="flex-1 relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
              {images.length > 0 ? (
                <img
                  src={`${IMAGE_BASE_URL}${images[selectedImage]}`}
                  alt={product.name}
                  className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                </div>
              )}
            </div>

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

          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-serif italic text-gray-800 mb-4 leading-snug">
            {product.name}
          </h1>

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

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={adding || !inStock}
            className={`w-full py-4 rounded-xl text-sm font-medium uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${inStock
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
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
              <span><strong className="text-gray-800">COD Available</strong> — Cash on Delivery</span>
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
                <span className="uppercase tracking-wider text-xs">Delivery & Returns</span>
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
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <p>Cash on Delivery (COD) available</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <p>Easy returns within 7 days of delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;