import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // productId being updated

  const fetchCart = async () => {
    try {
      const res = await axios.get("/cart");
      setCart(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, quantity) => {
    setUpdating(productId);
    try {
      await axios.put("/cart/update", { productId, quantity });
      fetchCart();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId) => {
    setUpdating(productId);
    try {
      await axios.delete("/cart/remove", { data: { productId } });
      fetchCart();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const itemCount = cart?.items?.length || 0;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-40" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-4 text-center">
        <svg className="w-24 h-24 mx-auto text-gray-200 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <h2 className="text-2xl font-serif italic text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-400 text-sm mb-6">Looks like you haven't added any jewelry to your cart yet</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 text-white text-sm font-medium uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-700/20 hover:shadow-yellow-800/30 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif italic text-gray-800 mb-1">Shopping Cart</h1>
        <p className="text-gray-400 text-sm">{itemCount} {itemCount === 1 ? "item" : "items"} in your cart</p>
        <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 mt-3 rounded-full" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Cart Items ── */}
        <div className="flex-1 space-y-0">
          {/* Column headers (desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-[10px] uppercase tracking-wider text-gray-400 font-medium">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
            {cart.items.map((item) => {
              const product = item.productId;
              const subtotal = item.quantity * item.priceAtTime;
              const isUpdating = updating === product._id;
              const image = product.images && product.images.length > 0
                ? `${IMAGE_BASE_URL}${product.images[0]}`
                : "https://via.placeholder.com/200x200?text=No+Image";

              return (
                <div
                  key={product._id}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-5 items-center transition-opacity ${isUpdating ? "opacity-50" : ""}`}
                >
                  {/* Product info (image + name) */}
                  <div className="col-span-6 flex items-center gap-4">
                    <Link to={`/product/${product._id}`} className="flex-shrink-0">
                      <img
                        src={image}
                        alt={product.name}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-gray-100"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link to={`/product/${product._id}`} className="text-gray-800 font-medium text-sm hover:text-yellow-800 transition-colors line-clamp-2">
                        {product.name}
                      </Link>
                      {product.categoryId?.name && (
                        <p className="text-[10px] uppercase tracking-widest text-yellow-700 font-medium mt-1">{product.categoryId.name}</p>
                      )}
                      {/* Mobile price */}
                      <p className="text-gray-800 font-semibold text-sm mt-1 md:hidden">{formatPrice(item.priceAtTime)}</p>
                    </div>
                  </div>

                  {/* Price (desktop) */}
                  <div className="hidden md:flex col-span-2 items-center justify-center">
                    <span className="text-gray-800 font-medium text-sm">{formatPrice(item.priceAtTime)}</span>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 flex items-center justify-between md:justify-center">
                    <span className="text-xs text-gray-400 md:hidden">Quantity</span>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center text-xs font-medium text-gray-800 border-x border-gray-200 bg-gray-50/50">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product._id, item.quantity + 1)}
                        disabled={isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal + Remove */}
                  <div className="col-span-2 flex items-center justify-between md:justify-end gap-3">
                    <span className="text-gray-800 font-semibold text-sm">{formatPrice(subtotal)}</span>
                    <button
                      onClick={() => removeItem(product._id)}
                      disabled={isUpdating}
                      title="Remove item"
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Shopping */}
          <div className="mt-5">
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-yellow-700 hover:text-yellow-800 font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-6 lg:sticky lg:top-24">
            <h3 className="text-lg font-serif italic text-gray-800 mb-4">Order Summary</h3>
            <div className="w-10 h-0.5 bg-gradient-to-r from-yellow-600 to-yellow-500 mb-5 rounded-full" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <span className="font-medium text-gray-800">{formatPrice(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 my-5" />

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-gray-700 font-medium">Total</span>
              <span className="text-xl font-semibold text-gray-800">{formatPrice(cart.totalAmount)}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 hover:from-yellow-800 hover:via-yellow-700 hover:to-yellow-800 text-white text-sm font-medium uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-700/20 hover:shadow-yellow-800/30 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>

            {/* Trust badges */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                Secure checkout with SSL encryption
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
                Free shipping on prepaid orders
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                Easy returns within 7 days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;