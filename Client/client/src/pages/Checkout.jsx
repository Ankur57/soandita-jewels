import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const IMAGE_BASE_URL = "http://localhost:5000";

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  // Inline add address
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "", mobileNumber: "", addressLine1: "", addressLine2: "",
    city: "", state: "", postalCode: "", country: "India", isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([
          axios.get("/cart"),
          axios.get("/addresses"),
        ]);
        setCart(cartRes.data);
        setAddresses(addrRes.data);

        // Auto-select default address
        const defaultAddr = addrRes.data.find((a) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr._id);
      } catch (err) {
        setError("Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await axios.post("/addresses", addressForm);
      setAddresses((prev) => [...prev, res.data]);
      setSelectedAddress(res.data._id);
      setShowNewAddress(false);
      setAddressForm({
        fullName: "", mobileNumber: "", addressLine1: "", addressLine2: "",
        city: "", state: "", postalCode: "", country: "India", isDefault: false,
      });
    } catch (err) {
      setError("Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }

    try {
      setPlacing(true);
      setError("");

      // 1. Create Order
      const orderRes = await axios.post("/orders", { addressId: selectedAddress });
      const orderId = orderRes.data._id;

      // 2. Create Razorpay Order
      const paymentRes = await axios.post("/payment/create-order", { orderId });
      const { razorpayOrderId, amount, key } = paymentRes.data;

      // 3. Open Razorpay
      const options = {
        key,
        amount,
        currency: "INR",
        name: "Soandita Jewels",
        description: "Jewelry Purchase",
        order_id: razorpayOrderId,
        theme: { color: "#b8860b" },
        handler: async function (response) {
          try {
            await axios.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });
            navigate("/orders");
          } catch (err) {
            setError("Payment verification failed. Please contact support.");
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPlacing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed. Please try again.");
      setPlacing(false);
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
      <div className="max-w-5xl mx-auto py-10 px-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-40 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-4 text-center">
        <svg className="w-20 h-20 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
        <h2 className="text-xl font-serif italic text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mb-4">Add items to your cart before checking out</p>
        <Link to="/shop" className="text-yellow-700 hover:text-yellow-800 font-medium text-sm">← Back to Shop</Link>
      </div>
    );
  }

  const selectedAddr = addresses.find((a) => a._id === selectedAddress);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link to="/cart" className="hover:text-gray-600 transition-colors">Cart</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-700 font-medium">Checkout</span>
        </nav>
        <h1 className="text-3xl font-serif italic text-gray-800 mb-1">Checkout</h1>
        <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 mt-3 rounded-full" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl mb-6">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {[
          { num: 1, label: "Cart", done: true },
          { num: 2, label: "Address", done: !!selectedAddress },
          { num: 3, label: "Payment", done: false },
        ].map((step, i) => (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${step.done
                  ? "bg-gradient-to-r from-yellow-700 to-yellow-600 text-white shadow-lg shadow-yellow-700/20"
                  : "bg-gray-200 text-gray-500"
                }`}>
                {step.done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" /></svg>
                ) : step.num}
              </div>
              <span className={`text-[10px] mt-1.5 font-medium ${step.done ? "text-yellow-800" : "text-gray-400"}`}>{step.label}</span>
            </div>
            {i < 2 && <div className={`w-16 md:w-24 h-0.5 mx-2 mb-5 ${step.done ? "bg-yellow-500" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: Address Selection ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-serif italic text-gray-800">Delivery Address</h2>
                <p className="text-gray-400 text-xs mt-0.5">Select where you'd like your order delivered</p>
              </div>
              {!showNewAddress && (
                <button onClick={() => setShowNewAddress(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  New Address
                </button>
              )}
            </div>

            {/* Address cards */}
            {addresses.length === 0 && !showNewAddress ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                <p className="text-gray-500 text-sm mb-1">No addresses saved</p>
                <button onClick={() => setShowNewAddress(true)} className="text-yellow-700 text-sm font-medium">+ Add your first address</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <button
                    key={addr._id}
                    onClick={() => { setSelectedAddress(addr._id); setError(""); }}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${selectedAddress === addr._id
                        ? "border-yellow-500 bg-yellow-50/50 ring-1 ring-yellow-300/30 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedAddress === addr._id ? "border-yellow-600" : "border-gray-300"
                        }`}>
                        {selectedAddress === addr._id && (
                          <div className="w-2 h-2 rounded-full bg-yellow-600" />
                        )}
                      </div>
                      <span className="text-gray-800 font-medium text-sm">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded font-semibold">Default</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed ml-6">
                      {addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`}<br />
                      {addr.city}, {addr.state} — {addr.postalCode}<br />
                      📞 {addr.mobileNumber}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Inline New Address Form */}
            {showNewAddress && (
              <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Add New Address</h3>
                <form onSubmit={handleSaveAddress} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" required placeholder="Full Name" value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500" />
                    <input type="tel" required placeholder="Mobile Number" value={addressForm.mobileNumber}
                      onChange={(e) => setAddressForm({ ...addressForm, mobileNumber: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500" />
                  </div>
                  <input type="text" required placeholder="Address Line 1" value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500" />
                  <input type="text" placeholder="Address Line 2 (optional)" value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input type="text" required placeholder="City" value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500" />
                    <input type="text" required placeholder="State" value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500" />
                    <input type="text" required placeholder="Postal Code" value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500" />
                    <input type="text" placeholder="Country" value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={savingAddress}
                      className="px-4 py-2 bg-yellow-700 hover:bg-yellow-800 text-white text-xs font-medium uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50">
                      {savingAddress ? "Saving…" : "Save Address"}
                    </button>
                    <button type="button" onClick={() => setShowNewAddress(false)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs font-medium rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Order Items Review */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-6">
            <h2 className="text-lg font-serif italic text-gray-800 mb-4">Review Items</h2>
            <div className="divide-y divide-gray-100">
              {cart.items.map((item) => {
                const product = item.productId;
                const image = product.images?.length > 0
                  ? `${IMAGE_BASE_URL}${product.images[0]}`
                  : "https://via.placeholder.com/100x100?text=No+Image";

                return (
                  <div key={product._id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <img src={image} alt={product.name} className="w-14 h-14 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-medium truncate">{product.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-gray-800 font-medium text-sm flex-shrink-0">{formatPrice(item.priceAtTime * item.quantity)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Column: Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-6 lg:sticky lg:top-24">
            <h3 className="text-lg font-serif italic text-gray-800 mb-4">Order Summary</h3>
            <div className="w-10 h-0.5 bg-gradient-to-r from-yellow-600 to-yellow-500 mb-5 rounded-full" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.items.length} {cart.items.length === 1 ? "item" : "items"})</span>
                <span className="font-medium text-gray-800">{formatPrice(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 my-5" />

            <div className="flex justify-between items-baseline mb-2">
              <span className="text-gray-700 font-medium">Total</span>
              <span className="text-xl font-semibold text-gray-800">{formatPrice(cart.totalAmount)}</span>
            </div>
            <p className="text-[10px] text-gray-400 mb-5">(Inclusive of all taxes)</p>

            {/* Selected address preview */}
            {selectedAddr && (
              <div className="bg-gray-50 rounded-lg p-3 mb-5 text-xs text-gray-600">
                <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  Delivering to:
                </p>
                <p>{selectedAddr.fullName}, {selectedAddr.addressLine1}, {selectedAddr.city} — {selectedAddr.postalCode}</p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={placing || !selectedAddress}
              className={`w-full py-3.5 rounded-xl text-sm font-medium uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${selectedAddress
                  ? "bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 hover:from-yellow-800 hover:via-yellow-700 hover:to-yellow-800 text-white shadow-yellow-700/20 hover:shadow-yellow-800/30"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                }`}
            >
              {placing ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
                  Place Order & Pay
                </>
              )}
            </button>

            {/* Trust */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                Secure payments via Razorpay
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                100% authentic jewelry guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;