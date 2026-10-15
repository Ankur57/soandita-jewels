import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../api/axios";
import { getImageUrl } from "../../utils/imageHelper";

/* ── Status config ── */
const STATUS_CONFIG = {
    pending:          { label: "Pending",          bg: "bg-gray-100",    text: "text-gray-700",    dot: "bg-gray-400"    },
    paid:             { label: "Paid",             bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400"   },
    shipped:          { label: "Shipped",          bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-400"    },
    delivered:        { label: "Delivered",        bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-400" },
    cancelled:        { label: "Cancelled",        bg: "bg-red-50",      text: "text-red-600",     dot: "bg-red-400"     },
    return_requested: { label: "Return Requested", bg: "bg-yellow-50",   text: "text-yellow-700",  dot: "bg-yellow-400"  },
    return_approved:  { label: "Return Approved",  bg: "bg-yellow-50",   text: "text-yellow-700",  dot: "bg-yellow-400"  },
    return_rejected:  { label: "Return Rejected",  bg: "bg-red-50",      text: "text-red-600",     dot: "bg-red-400"     },
    refunded:         { label: "Refunded",         bg: "bg-purple-50",   text: "text-purple-700",  dot: "bg-purple-400"  },
};

const STATUS_FLOW = ["pending", "paid", "shipped", "delivered"];

const StatusBadge = ({ status }) => {
    const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
};

function AdminOrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* Status update */
    const [newStatus, setNewStatus] = useState("");
    const [updating, setUpdating] = useState(false);
    const [updateMsg, setUpdateMsg] = useState("");
    const [updateMsgType, setUpdateMsgType] = useState("success");

    const fetchOrder = async () => {
        try {
            const res = await axios.get(`/orders/${id}`);
            setOrder(res.data);
            setNewStatus(res.data.orderStatus);
        } catch (err) {
            console.error("Order fetch error:", err);
            setError(err.response?.data?.message || "Failed to load order details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleStatusUpdate = async () => {
        if (!newStatus || newStatus === order.orderStatus) return;
        setUpdating(true);
        setUpdateMsg("");
        try {
            await axios.put(`/orders/admin/orders/${id}/status`, { status: newStatus });
            setUpdateMsg("Status updated successfully!");
            setUpdateMsgType("success");
            fetchOrder();
        } catch (err) {
            setUpdateMsg(err.response?.data?.message || "Failed to update status.");
            setUpdateMsgType("error");
        } finally {
            setUpdating(false);
            setTimeout(() => setUpdateMsg(""), 4000);
        }
    };

    const fmt = (n) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

    const fmtDate = (d) =>
        new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    /* ── Loading skeleton ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 md:p-10 animate-pulse">
                <div className="max-w-4xl mx-auto space-y-4">
                    <div className="h-6 w-40 bg-gray-200 rounded" />
                    <div className="h-10 w-72 bg-gray-200 rounded" />
                    <div className="h-64 bg-gray-200 rounded-2xl" />
                    <div className="h-40 bg-gray-200 rounded-2xl" />
                </div>
            </div>
        );
    }

    /* ── Error state ── */
    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || "Order not found."}</p>
                    <button onClick={() => navigate(-1)} className="text-indigo-600 font-medium hover:underline">← Go back</button>
                </div>
            </div>
        );
    }

    const addr = order.addressSnapshot || {};
    const stepIndex = STATUS_FLOW.indexOf(order.orderStatus);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-4 md:p-8 lg:p-10">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* ── Breadcrumb ── */}
                <nav className="flex items-center gap-2 text-sm text-gray-400">
                    <Link to="/admin/all-orders" className="hover:text-indigo-600 transition-colors">All Orders</Link>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">{order.orderNumber}</span>
                </nav>

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{order.orderNumber}</h1>
                        <p className="text-gray-400 text-sm mt-0.5">{fmtDate(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.orderStatus} />
                </div>

                {/* ── Progress bar ── */}
                {stepIndex >= 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4">Order Progress</p>
                        <div className="flex items-center">
                            {STATUS_FLOW.map((step, i) => (
                                <div key={step} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= stepIndex ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-gray-100 text-gray-400"}`}>
                                            {i < stepIndex ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" /></svg>
                                            ) : (i + 1)}
                                        </div>
                                        <span className={`text-[10px] mt-1.5 font-medium capitalize ${i <= stepIndex ? "text-indigo-600" : "text-gray-400"}`}>{step}</span>
                                    </div>
                                    {i < STATUS_FLOW.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < stepIndex ? "bg-indigo-500" : "bg-gray-200"}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left: Items + Address ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50">
                                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Order Items</h2>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {order.items?.map((item, i) => {
                                    const product = item.productId;
                                    const imgSrc = product?.images?.length > 0
                                        ? getImageUrl(product.images[0])
                                        : "https://via.placeholder.com/80x80?text=No+Image";
                                    return (
                                        <div key={i} className="flex items-center gap-4 px-5 py-4">
                                            <img src={imgSrc} alt={product?.name} className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{product?.name || "Product"}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">SKU: {product?.sku || "—"} &nbsp;·&nbsp; Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-bold text-gray-900">{fmt(item.priceAtTime * item.quantity)}</p>
                                                <p className="text-xs text-gray-400">{fmt(item.priceAtTime)} each</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Delivery Address</h2>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed">
                                    <p className="font-semibold text-gray-800">{addr.fullName}</p>
                                    <p>{addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`}</p>
                                    <p>{addr.city}, {addr.state} — {addr.postalCode}</p>
                                    <p>{addr.country}</p>
                                    <p className="mt-1 text-gray-500">📞 {addr.mobileNumber}</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Customer</h2>
                            <div className="flex gap-3 items-center">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                                    {(order.userId?.name || addr.fullName || "?")[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{order.userId?.name || addr.fullName || "—"}</p>
                                    <p className="text-xs text-gray-400">{order.userId?.email || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Summary + Status Update ── */}
                    <div className="space-y-6">

                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Summary</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-800">{fmt(order.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-emerald-600 font-medium">Free</span>
                                </div>
                                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>{fmt(order.totalAmount)}</span>
                                </div>
                            </div>

                            {/* Payment info */}
                            {(order.paymentId?.razorpayOrderId || order.razorpayOrderId) && (
                                <div className="mt-4 pt-4 border-t border-gray-50 space-y-1 text-xs text-gray-400">
                                    <p><span className="font-medium text-gray-500">Razorpay Order ID:</span> {order.paymentId?.razorpayOrderId || order.razorpayOrderId}</p>
                                    {(order.paymentId?.razorpayPaymentId || order.razorpayPaymentId) && (
                                        <p><span className="font-medium text-gray-500">Payment ID:</span> {order.paymentId?.razorpayPaymentId || order.razorpayPaymentId}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Status Update */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Update Status</h2>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 mb-3"
                            >
                                {Object.keys(STATUS_CONFIG).map((s) => (
                                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={updating || newStatus === order.orderStatus}
                                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
                            >
                                {updating ? "Updating…" : "Update Status"}
                            </button>
                            {updateMsg && (
                                <p className={`mt-2 text-xs text-center font-medium ${updateMsgType === "success" ? "text-emerald-600" : "text-red-500"}`}>
                                    {updateMsg}
                                </p>
                            )}
                        </div>

                        {/* Meta */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2 text-xs text-gray-400">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Order ID</span>
                                <span className="font-mono text-gray-600 truncate ml-2">{order._id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Placed On</span>
                                <span>{fmtDate(order.createdAt)}</span>
                            </div>
                            {order.updatedAt && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-500">Last Updated</span>
                                    <span>{fmtDate(order.updatedAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminOrderDetail;
