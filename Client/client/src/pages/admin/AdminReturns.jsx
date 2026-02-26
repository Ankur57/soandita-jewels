import { useEffect, useState } from "react";
import axios from "../../api/axios";

function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    try {
      const res = await axios.get("/orders/admin/returns");
      setReturns(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const approveReturn = async (id) => {
    try {
      await axios.put(`/orders/${id}/return/approve`);
      fetchReturns();
    } catch (error) {
      console.error(error);
    }
  };

  const rejectReturn = async (id) => {
    const comment = prompt("Enter rejection reason:");
    if (!comment) return;

    try {
      await axios.put(`/orders/${id}/return/reject`, { comment });
      fetchReturns();
    } catch (error) {
      console.error(error);
    }
  };

  const processRefund = async (id) => {
    try {
      await axios.post(`/orders/${id}/refund`);
      fetchReturns();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Return Requests
      </h1>

      {returns.length === 0 && (
        <p>No return requests</p>
      )}

      {returns.map((order) => (
        <div
          key={order._id}
          className="border p-6 mb-6 rounded shadow"
        >
          <div className="flex justify-between mb-4">
            <div>
              <p className="font-semibold">
                Order: {order.orderNumber}
              </p>
              <p>User: {order.userId?.name}</p>
              <p>Email: {order.userId?.email}</p>
            </div>

            <div>
              <span className="px-3 py-1 bg-gray-200 rounded">
                {order.returnRequest?.status}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <p><strong>Reason:</strong> {order.returnRequest?.reason}</p>
          </div>

          {/* Show Images */}
          <div className="flex gap-4 mb-4">
            {order.returnRequest?.images?.map((img, index) => (
              <a
                key={index}
                href={`http://localhost:5000${img}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`http://localhost:5000${img}`}
                  alt="Return"
                  className="w-32 h-32 object-cover border rounded cursor-pointer hover:scale-105 transition"
                />
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          {order.returnRequest?.status === "requested" && (
            <div className="flex gap-4">
              <button
                onClick={() => approveReturn(order._id)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Approve
              </button>

              <button
                onClick={() => rejectReturn(order._id)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          )}

          {order.returnRequest?.status === "approved" && (
            <button
              onClick={() => processRefund(order._id)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Process Refund
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminReturns;
