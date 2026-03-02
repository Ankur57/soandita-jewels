import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

const statusConfig = {
  pending: { label: "Pending", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: "⏳" },
  paid: { label: "Paid", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: "💳" },
  shipped: { label: "Shipped", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", icon: "🚚" },
  delivered: { label: "Delivered", color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: "✅" },
  cancelled: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: "✕" },
  return_requested: { label: "Return Requested", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", icon: "↩️" },
  return_approved: { label: "Return Approved", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", icon: "✓↩️" },
  return_rejected: { label: "Return Rejected", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: "✕↩️" },
  refunded: { label: "Refunded", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", icon: "💰" },
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/orders/my-orders");
        setOrders(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter((o) => o.orderStatus === filter);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-40" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <svg className="w-20 h-20 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        <h2 className="text-2xl font-serif italic text-gray-800 mb-2">No Orders Yet</h2>
        <p className="text-gray-400 text-sm mb-6">Your order history will appear here once you make a purchase</p>
        <Link to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 text-white text-sm font-medium uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-700/20 hover:shadow-yellow-800/30 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-serif italic text-gray-800 mb-1">My Orders</h1>
        <p className="text-gray-400 text-sm">{orders.length} {orders.length === 1 ? "order" : "orders"} placed</p>
        <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 mt-3 rounded-full" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: "all", label: "All" },
          { key: "paid", label: "Paid" },
          { key: "shipped", label: "Shipped" },
          { key: "delivered", label: "Delivered" },
          { key: "cancelled", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-all ${filter === tab.key
                ? "bg-gradient-to-r from-yellow-700 to-yellow-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">No orders matching this filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.orderStatus] || statusConfig.pending;
            return (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-5 hover:shadow-xl hover:border-gray-200 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left side */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gray-800 font-medium text-sm">{order.orderNumber}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full ${status.bg} ${status.color} ${status.border} border`}>
                        <span>{status.icon}</span>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-gray-800 font-semibold text-lg">{formatPrice(order.totalAmount)}</p>
                      <p className={`text-xs font-medium ${order.paymentStatus === "success" ? "text-green-600" : "text-orange-500"}`}>
                        {order.paymentStatus === "success" ? "✓ Paid" : "⏳ Payment Pending"}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;