import { useEffect, useState } from "react";
import axios from "../api/axios";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await axios.get("/cart");
      setCart(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.put("/cart/update", {
        productId,
        quantity,
      });
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete("/cart/remove", {
        data: { productId },
      });
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  if (!cart || cart.items.length === 0)
    return <div className="p-10 text-center">Your cart is empty</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.items.map((item) => (
        <div
          key={item.productId._id}
          className="flex items-center justify-between border-b py-4"
        >
          <div>
            <h2 className="text-xl font-semibold">
              {item.productId.name}
            </h2>
            <p>₹ {item.priceAtTime}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                updateQuantity(
                  item.productId._id,
                  Math.max(1, item.quantity - 1)
                )
              }
              className="px-3 py-1 bg-gray-200 rounded"
            >
              -
            </button>

            <span>{item.quantity}</span>

            <button
              onClick={() =>
                updateQuantity(
                  item.productId._id,
                  item.quantity + 1
                )
              }
              className="px-3 py-1 bg-gray-200 rounded"
            >
              +
            </button>

            <button
              onClick={() => removeItem(item.productId._id)}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="mt-6 text-right">
        <h2 className="text-2xl font-bold">
          Total: ₹ {cart.totalAmount}
        </h2>
        <a
          href="/checkout"
          className="inline-block bg-black text-white px-6 py-3 mt-4 rounded"
        >
          Proceed to Checkout
        </a>
      </div>
    </div>
  );
}

export default Cart;