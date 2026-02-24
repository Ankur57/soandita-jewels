import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";


function Product() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/products/get/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!product) return null;

  const handleAddToCart = async () => {
  try {
    setAdding(true);
    setMessage("");

    await axios.post("/cart/add", {
      productId: id,
      quantity,
    });

    console.log("Added to cart")
    setMessage("Added to cart successfully");
  } catch (error) {
    if (error.response?.status === 401) {
      setMessage("Please login to add items");
    } else {
      setMessage("Failed to add to cart");
    }
  } finally {
        setAdding(false);
        if (error.response?.status === 401) {
            navigate("/login");
        }
  }
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Product Image */}
      <div>
        <img
          src={product.images?.[0] || "https://via.placeholder.com/500"}
          alt={product.name}
          className="w-full h-[400px] object-cover rounded"
        />
      </div>

      {/* Product Info */}
      <div>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

        <p className="text-gray-600 mb-4">{product.description}</p>

        <p className="text-2xl font-semibold mb-6">
          ₹ {product.price}
        </p>

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            -
          </button>

          <span className="text-lg">{quantity}</span>

          <button
            onClick={() => setQuantity((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            +
          </button>
        </div>

        <button
            onClick={handleAddToCart}
            disabled={adding}
            className="bg-black text-white px-6 py-3 rounded"
            >
            {adding ? "Adding..." : "Add to Cart"}
        </button>

        {message && (
            <p className="mt-4 text-sm text-green-600">
                {message}
            </p>
        )}
      </div>
    </div>
  );
}

export default Product;