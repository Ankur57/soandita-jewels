import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReturnRequest = async () => {
  if (!reason) {
    setMessage("Select reason");
    return;
  }

  if (!imageFile) {
    setMessage("Upload image");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("reason", reason);
    formData.append("image", imageFile);

    await axios.post(`/orders/${id}/return`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setMessage("Return request submitted");
  } catch (error) {
    setMessage(
      error.response?.data?.message || "Failed"
    );
  }
};


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

  if (loading) return <div className="p-10">Loading...</div>;
  if (!order) return <div className="p-10">Order not found</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Order {order.orderNumber}
      </h1>

      <p className="mb-4">Status: {order.orderStatus}</p>
      <p className="mb-4">Payment: {order.paymentStatus}</p>

      <h2 className="text-xl font-semibold mb-3">Items</h2>

      {order.items.map((item) => (
        <div
          key={item.productId}
          className="border-b py-3"
        >
          <p>{item.name}</p>
          <p>Qty: {item.quantity}</p>
          <p>₹ {item.priceAtTime}</p>
        </div>
      ))}

      <div className="mt-6">
        <p className="font-semibold">
          Total: ₹ {order.totalAmount}
        </p>
      </div>
      {order.orderStatus === "delivered" && (
  <div className="mt-10 border p-6 rounded">
    <h2 className="text-xl font-semibold mb-4">
      Request Return
    </h2>

    <select
      value={reason}
      onChange={(e) => setReason(e.target.value)}
      className="border p-2 mb-4 w-full"
    >
      <option value="">Select Reason</option>
      <option value="damaged">Damaged</option>
      <option value="defective">Defective</option>
      <option value="wrong_item">Wrong Item Delivered</option>
    </select>

    <input
    type="file"
    accept="image/*"
    onChange={(e) => setImageFile(e.target.files[0])}
    className="border p-2 w-full mb-4"
    />


    <button
      onClick={handleReturnRequest}
      disabled={submitting}
      className="bg-black text-white px-6 py-2 rounded"
    >
      {submitting ? "Submitting..." : "Submit Return Request"}
    </button>

    {message && (
      <p className="mt-4 text-sm text-red-600">{message}</p>
    )}
  </div>
)}
{order.returnRequest?.status !== "none" && (
  <div className="mt-4 p-4 bg-gray-100 rounded">
    <p>
      Return Status: {order.returnRequest.status}
    </p>

    {order.returnRequest.adminComment && (
      <p className="text-sm text-red-600">
        Admin Comment: {order.returnRequest.adminComment}
      </p>
    )}
  </div>
)}


    </div>
  );
}

export default OrderDetails;
