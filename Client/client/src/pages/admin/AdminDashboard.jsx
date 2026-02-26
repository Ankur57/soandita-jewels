import { useEffect, useState } from "react";
import axios from "../../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    const res = await axios.get("/orders/admin/dashboard");
    setStats(res.data);
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
        label: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
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
      label: `${year}-${String(month).padStart(2, "0")}`,
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
        await fetchDashboardStats();
        await fetchSalesData(period);
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

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow p-6 rounded">
          <p className="text-gray-500">Total Revenue</p>
          <h2 className="text-2xl font-bold">
            ₹ {stats?.totalRevenue || 0}
          </h2>
        </div>

        <div className="bg-white shadow p-6 rounded">
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-2xl font-bold">
            {stats?.totalOrders || 0}
          </h2>
        </div>

        <div className="bg-white shadow p-6 rounded">
          <p className="text-gray-500">Total Returns</p>
          <h2 className="text-2xl font-bold">
            {stats?.totalReturns || 0}
          </h2>
        </div>
      </div>

      {/* Sales Chart Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => handlePeriodChange("daily")}
          className={`px-4 py-2 rounded ${
            period === "daily"
              ? "bg-black text-white"
              : "bg-gray-200"
          }`}
        >
          Daily
        </button>

        <button
          onClick={() => handlePeriodChange("monthly")}
          className={`px-4 py-2 rounded ${
            period === "monthly"
              ? "bg-black text-white"
              : "bg-gray-200"
          }`}
        >
          Monthly
        </button>

        <button
          onClick={() => handlePeriodChange("yearly")}
          className={`px-4 py-2 rounded ${
            period === "yearly"
              ? "bg-black text-white"
              : "bg-gray-200"
          }`}
        >
          Yearly
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white shadow p-6 rounded">
        <div className="w-full h-[400px]">
          
          
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="totalSales"
                stroke="#000"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;