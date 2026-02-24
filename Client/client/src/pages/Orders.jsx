import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-10">Loading...</div>;

  if (orders.length === 0)
    return <div className="p-10 text-center">No orders yet</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.map((order) => (
        <div
          key={order._id}
          className="border p-4 mb-4 rounded shadow"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">
                Order: {order.orderNumber}
              </p>
              <p className="text-gray-600">
                ₹ {order.totalAmount}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <p
                className={`font-medium ${
                  order.orderStatus === "delivered"
                    ? "text-green-600"
                    : order.orderStatus.includes("return")
                    ? "text-yellow-600"
                    : "text-blue-600"
                }`}
              >
                {order.orderStatus}
              </p>

              <Link
                to={`/orders/${order._id}`}
                className="text-black underline mt-2 inline-block"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders;