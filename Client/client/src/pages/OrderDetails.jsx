import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axios";

const IMAGE_BASE_URL = "http://localhost:5000";

const statusConfig = {
  pending: { label: "Pending", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: "⏳" },
  paid: { label: "Paid", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: "💳" },
  shipped: { label: "Shipped", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", icon: "🚚" },
  delivered: { label: "Delivered", color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: "✅" },
  cancelled: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: "✕" },
  return_requested: { label: "Return Requested", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", icon: "↩️" },
  return_approved: { label: "Return Approved", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", icon: "✓↩" },
  return_rejected: { label: "Return Rejected", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: "✕↩" },
  refunded: { label: "Refunded", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", icon: "💰" },
};

const statusSteps = ["pending", "paid", "shipped", "delivered"];

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Return request
  const [reason, setReason] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleReturnRequest = async () => {
    if (!reason) { setMessage("Please select a reason"); setMessageType("error"); return; }
    if (!imageFile) { setMessage("Please upload an image"); setMessageType("error"); return; }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("reason", reason);
      formData.append("image", imageFile);

      await axios.post(`/orders/${id}/return`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Return request submitted successfully!");
      setMessageType("success");
      // Refresh order
      const res = await axios.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to submit return request");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-60" />
        <div className="h-20 bg-gray-200 rounded-2xl" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <p className="text-gray-500 mb-4">Order not found</p>
        <Link to="/orders" className="text-yellow-700 hover:text-yellow-800 font-medium text-sm">← Back to Orders</Link>
      </div>
    );
  }

  const status = statusConfig[order.orderStatus] || statusConfig.pending;
  const currentStepIndex = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/orders" className="hover:text-gray-600 transition-colors">My Orders</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-700 font-medium">{order.orderNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif italic text-gray-800 mb-1">Order {order.orderNumber}</h1>
          <p className="text-gray-400 text-sm">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full ${status.bg} ${status.color} ${status.border} border self-start`}>
          <span className="text-sm">{status.icon}</span>
          {status.label}
        </span>
      </div>

      {/* Progress Tracker (only for normal flow) */}
      {currentStepIndex >= 0 && (
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-6 mb-6">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => {
              const stepInfo = statusConfig[step];
              const isDone = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all ${isDone
                        ? "bg-gradient-to-r from-yellow-700 to-yellow-600 text-white shadow-lg shadow-yellow-700/20"
                        : "bg-gray-100 text-gray-400"
                      } ${isCurrent ? "ring-4 ring-yellow-200" : ""}`}>
                      {isDone ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" /></svg>
                      ) : (
                        <span className="text-xs">{stepInfo.icon}</span>
                      )}
                    </div>
                    <span className={`text-[10px] mt-2 font-medium hidden sm:block ${isDone ? "text-yellow-800" : "text-gray-400"}`}>{stepInfo.label}</span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < currentStepIndex ? "bg-yellow-500" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-6">
            <h2 className="text-lg font-serif italic text-gray-800 mb-4">Order Items</h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium text-sm truncate">{item.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">Qty: {item.quantity} × {formatPrice(item.priceAtTime)}</p>
                  </div>
                  <p className="text-gray-800 font-semibold text-sm flex-shrink-0">
                    {formatPrice(item.quantity * item.priceAtTime)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Return Request Section */}
          {order.orderStatus === "delivered" && (!order.returnRequest || order.returnRequest.status === "none") && (
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-6">
              <h2 className="text-lg font-serif italic text-gray-800 mb-1">Request a Return</h2>
              <p className="text-gray-400 text-xs mb-5">If you're not satisfied with your order, you can request a return within 7 days</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Reason for Return</label>
                  <select value={reason} onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500">
                    <option value="">Select a reason</option>
                    <option value="damaged">Item is Damaged</option>
                    <option value="defective">Item is Defective</option>
                    <option value="wrong_item">Wrong Item Delivered</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Upload Image (proof)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                      <span className="text-sm text-gray-600">{imageFile ? imageFile.name : "Choose file"}</span>
                      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="hidden" />
                    </label>
                  </div>
                </div>

                <button onClick={handleReturnRequest} disabled={submitting}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 flex items-center gap-2">
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting…</>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                      Submit Return Request
                    </>
                  )}
                </button>

                {message && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${messageType === "success" ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
                    }`}>
                    <p className={`text-sm ${messageType === "success" ? "text-green-700" : "text-red-600"}`}>{message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Return Status */}
          {order.returnRequest && order.returnRequest.status !== "none" && (
            <div className={`rounded-2xl shadow-lg shadow-gray-100/50 border p-6 ${order.returnRequest.status === "approved" || order.returnRequest.status === "refunded"
                ? "bg-green-50 border-green-200"
                : order.returnRequest.status === "rejected"
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}>
              <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                Return Request — <span className="capitalize">{order.returnRequest.status}</span>
              </h3>
              {order.returnRequest.reason && (
                <p className="text-sm text-gray-600 mb-1">Reason: <span className="capitalize">{order.returnRequest.reason.replace("_", " ")}</span></p>
              )}
              {order.returnRequest.requestedAt && (
                <p className="text-xs text-gray-400 mb-1">Requested on {formatDate(order.returnRequest.requestedAt)}</p>
              )}
              {order.returnRequest.adminComment && (
                <div className="mt-3 p-3 bg-white/60 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium mb-0.5">Admin Response:</p>
                  <p className="text-sm text-gray-700">{order.returnRequest.adminComment}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column — Summary */}
        <div className="space-y-6">
          {/* Payment & Summary */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-6 lg:sticky lg:top-24">
            <h3 className="text-lg font-serif italic text-gray-800 mb-4">Order Summary</h3>
            <div className="w-10 h-0.5 bg-gradient-to-r from-yellow-600 to-yellow-500 mb-5 rounded-full" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800">{formatPrice(order.subtotal || order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">{order.shippingCharges ? formatPrice(order.shippingCharges) : "Free"}</span>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 my-4" />

            <div className="flex justify-between items-baseline mb-5">
              <span className="text-gray-700 font-medium">Total</span>
              <span className="text-xl font-semibold text-gray-800">{formatPrice(order.totalAmount)}</span>
            </div>

            {/* Payment status */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${order.paymentStatus === "success" ? "bg-green-50 border border-green-100" :
                order.paymentStatus === "refunded" ? "bg-purple-50 border border-purple-100" :
                  "bg-orange-50 border border-orange-100"
              }`}>
              {order.paymentStatus === "success" ? (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              <span className={`font-medium ${order.paymentStatus === "success" ? "text-green-700" :
                  order.paymentStatus === "refunded" ? "text-purple-700" :
                    "text-orange-700"
                }`}>
                Payment {order.paymentStatus === "success" ? "Completed" : order.paymentStatus === "refunded" ? "Refunded" : "Pending"}
              </span>
            </div>
          </div>

          {/* Delivery Address */}
          {order.addressSnapshot && (
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                Delivery Address
              </h3>
              <div className="text-sm text-gray-600 leading-relaxed">
                <p className="font-medium text-gray-800">{order.addressSnapshot.fullName}</p>
                <p>{order.addressSnapshot.addressLine1}</p>
                <p>{order.addressSnapshot.city}, {order.addressSnapshot.state} — {order.addressSnapshot.postalCode}</p>
                <p className="mt-1 text-gray-500">📞 {order.addressSnapshot.mobileNumber}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
