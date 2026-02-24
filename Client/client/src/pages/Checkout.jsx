import { useEffect, useState } from "react";
import axios from "../api/axios";

function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await axios.get("/addresses");
        setAddresses(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAddresses();
  }, []);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert("Please select address");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create Order
      const orderRes = await axios.post("/orders", {
        addressId: selectedAddress,
      });

      const orderId = orderRes.data._id;

      // 2️⃣ Create Razorpay Order
      const paymentRes = await axios.post("/payment/create-order", {
        orderId,
      });

      const { razorpayOrderId, amount, key } = paymentRes.data;

      // 3️⃣ Open Razorpay
      const options = {
        key,
        amount,
        currency: "INR",
        name: "Soandita Jewels",
        order_id: razorpayOrderId,
        handler: async function (response) {
          await axios.post("/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId,
          });

          alert("Payment successful!");
          window.location.href = "/orders";
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <h2 className="text-xl mb-4">Select Delivery Address</h2>

      {addresses.map((address) => (
        <div
          key={address._id}
          className={`border p-4 mb-3 rounded cursor-pointer ${
            selectedAddress === address._id ? "border-black" : ""
          }`}
          onClick={() => setSelectedAddress(address._id)}
        >
          <p>{address.fullName}</p>
          <p>{address.addressLine1}</p>
          <p>{address.city}, {address.state}</p>
          <p>{address.postalCode}</p>
        </div>
      ))}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded mt-6"
      >
        {loading ? "Processing..." : "Place Order & Pay"}
      </button>
    </div>
  );
}

export default Checkout;