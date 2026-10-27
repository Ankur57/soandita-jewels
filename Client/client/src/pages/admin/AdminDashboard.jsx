import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ─── Icon Components ─── */
const RevenueIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const PendingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShippedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const AvgIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ProductsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const ReturnsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

const AddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const BannerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const PromoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

const TrendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

/* ─── Pie Chart Colors ─── */
const STATUS_COLORS = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  shipped: "#8B5CF6",
  delivered: "#10B981",
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
};

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-base font-bold">₹ {payload[0].value?.toLocaleString("en-IN")}</p>
      </div>
    );
  }
  return null;
};

/* ─── Animated Number ─── */
const AnimatedNumber = ({ value, prefix = "", suffix = "" }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 1200;
    const steps = 40;
    const stepValue = value / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current += stepValue;
      if (step >= steps) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}{typeof display === "number" ? display.toLocaleString("en-IN") : display}{suffix}
    </span>
  );
};

/* ─── Stat Card ─── */
const StatCard = ({ icon, label, value, prefix = "₹ ", gradient, delay = 0 }) => (
  <div
    className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group"
    style={{
      background: gradient,
      animationDelay: `${delay}ms`,
    }}
  >
    {/* Glow orb */}
    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500"
      style={{ background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)" }}
    />

    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-sm font-medium text-white/80 mb-2 tracking-wide uppercase">{label}</p>
        <h2 className="text-3xl font-extrabold tracking-tight">
          <AnimatedNumber value={value} prefix={prefix} />
        </h2>
      </div>
      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
        {icon}
      </div>
    </div>
  </div>
);

/* ─── Quick Action Card ─── */
const QuickAction = ({ icon, label, onClick, color }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-0.5 group w-full text-left"
  >
    <div className={`p-2.5 rounded-lg ${color} text-white group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
    <div className="ml-auto text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all duration-300">
      <ArrowIcon />
    </div>
  </button>
);

/* ─── Period Toggle Button ─── */
const PeriodButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${active
      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
      }`}
  >
    {label}
  </button>
);

/* ─── Custom Pie Label ─── */
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


/* ════════════════════════════════════════════════
   ███  ADMIN DASHBOARD  ███
   ════════════════════════════════════════════════ */
function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [salesDashboard, setSalesDashboard] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);

  /* ─── Fetch Data ─── */
  const fetchDashboardStats = async () => {
    const res = await axios.get("/orders/admin/dashboard");
    setStats(res.data);
  };

  const fetchSalesDashboard = async () => {
    try {
      const res = await axios.get("/orders/admin/sales/dashboard");
      setSalesDashboard(res.data);
    } catch (error) {
      console.error("Sales dashboard error:", error);
    }
  };

  const fetchSalesData = async (type) => {
    const res = await axios.get(`/orders/admin/sales/${type}`);
    const rawData = res.data;

    if (type === "daily") {
      const today = new Date();
      const days = 7;
      const dateMap = {};
      rawData.forEach(item => {
        const key = `${item._id.year}-${item._id.month}-${item._id.day}`;
        dateMap[key] = item.totalSales;
      });
      const formattedData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const key = `${year}-${month}-${day}`;
        formattedData.push({
          label: `${String(day).padStart(2, "0")} ${date.toLocaleString("default", { month: "short" })}`,
          totalSales: dateMap[key] || 0,
        });
      }
      setSalesData(formattedData);
    }

    if (type === "monthly") {
      const months = 12;
      const today = new Date();
      const dateMap = {};
      rawData.forEach(item => {
        const key = `${item._id.year}-${item._id.month}`;
        dateMap[key] = item.totalSales;
      });
      const formattedData = [];
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year}-${month}`;
        formattedData.push({
          label: `${date.toLocaleString("default", { month: "short" })} ${year}`,
          totalSales: dateMap[key] || 0,
        });
      }
      setSalesData(formattedData);
    }

    if (type === "yearly") {
      const years = 5;
      const currentYear = new Date().getFullYear();
      const dateMap = {};
      rawData.forEach(item => {
        dateMap[item._id.year] = item.totalSales;
      });
      const formattedData = [];
      for (let i = years - 1; i >= 0; i--) {
        const year = currentYear - i;
        formattedData.push({
          label: `${year}`,
          totalSales: dateMap[year] || 0,
        });
      }
      setSalesData(formattedData);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchSalesDashboard(),
          fetchSalesData(period),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handlePeriodChange = async (type) => {
    setPeriod(type);
    await fetchSalesData(type);
  };

  /* ─── Derive Pie Data ─── */
  const pieData = salesDashboard?.statusBreakdown
    ?.filter((s) => s.count > 0 && STATUS_LABELS[s._id])
    .map((s) => ({
      name: STATUS_LABELS[s._id],
      value: s.count,
      color: STATUS_COLORS[s._id] || "#9CA3AF",
    })) || [];

  /* ─── Loading Skeleton ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header shimmer */}
          <div className="h-10 w-64 bg-gray-200 rounded-xl mb-8 animate-pulse" />
          {/* Cards shimmer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
          {/* Chart shimmer */}
          <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-4 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">

        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Welcome back! Here&apos;s what&apos;s happening with your store.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* ─── Stat Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          <StatCard
            icon={<RevenueIcon />}
            label="Total Revenue"
            value={stats?.totalRevenue || 0}
            prefix="₹ "
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            delay={0}
          />
          <StatCard
            icon={<OrdersIcon />}
            label="Total Orders"
            value={stats?.totalOrders || 0}
            prefix=""
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            delay={100}
          />
          <StatCard
            icon={<PendingIcon />}
            label="Pending"
            value={stats?.pendingOrders || 0}
            prefix=""
            gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            delay={200}
          />
          <StatCard
            icon={<ShippedIcon />}
            label="Shipped"
            value={stats?.shippedOrders || 0}
            prefix=""
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            delay={300}
          />
          <StatCard
            icon={<AvgIcon />}
            label="Avg. Order Value"
            value={Math.round(salesDashboard?.summary?.avgOrderValue || 0)}
            prefix="₹ "
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            delay={400}
          />
        </div>

        {/* ─── Chart + Pie Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Sales Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Sales Overview</h3>
                <p className="text-sm text-gray-500 mt-0.5">Track your revenue trends</p>
              </div>
              <div className="flex gap-2">
                <PeriodButton label="Daily" active={period === "daily"} onClick={() => handlePeriodChange("daily")} />
                <PeriodButton label="Monthly" active={period === "monthly"} onClick={() => handlePeriodChange("monthly")} />
                <PeriodButton label="Yearly" active={period === "yearly"} onClick={() => handlePeriodChange("yearly")} />
              </div>
            </div>
            <div className="w-full h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="totalSales"
                    stroke="#667eea"
                    strokeWidth={3}
                    fill="url(#salesGradient)"
                    dot={{ r: 4, fill: "#667eea", stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#764ba2", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Order Status</h3>
            <p className="text-sm text-gray-500 mb-4">Distribution breakdown</p>
            {pieData.length > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomLabel}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "12px", color: "#6B7280" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400 text-sm">No order data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Quick Actions ─── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Quick Actions</h3>
          <p className="text-sm text-gray-500 mb-5">Jump to frequently used pages</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              icon={<AddIcon />}
              label="Add Product"
              onClick={() => navigate("/admin/add-product")}
              color="bg-indigo-600"
            />
            <QuickAction
              icon={<ProductsIcon />}
              label="Manage Products"
              onClick={() => navigate("/admin/products")}
              color="bg-purple-600"
            />
            {/* Returns commented out — not needed currently
            <QuickAction
              icon={<ReturnsIcon />}
              label="Returns"
              onClick={() => navigate("/admin/returns")}
              color="bg-rose-500"
            />
            */}
            <QuickAction
              icon={<OrdersIcon />}
              label="Orders"
              onClick={() => navigate("/admin/orders")}
              color="bg-amber-600"
            />
            <QuickAction
              icon={<OrdersIcon />}
              label="All Orders"
              onClick={() => navigate("/admin/all-orders")}
              color="bg-emerald-600"
            />
          </div>
        </div>

        {/* ─── Home Page Sections Customization ─── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-gray-900">Home Page Sections</h3>
            <span className="text-xs bg-amber-50 text-amber-800 font-medium px-2.5 py-1 rounded-full border border-amber-200/60">
              Live Storefront
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Manage Cloudinary images, text, and links for your storefront sections
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickAction
              icon={<BannerIcon />}
              label="Hero Banners"
              onClick={() => navigate("/?edit=banners")}
              color="bg-amber-700"
            />
            <QuickAction
              icon={<PromoIcon />}
              label="Promotional Cards"
              onClick={() => navigate("/?edit=promos")}
              color="bg-rose-600"
            />
            <QuickAction
              icon={<TrendIcon />}
              label="Season Trends"
              onClick={() => navigate("/?edit=seasons")}
              color="bg-teal-600"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;