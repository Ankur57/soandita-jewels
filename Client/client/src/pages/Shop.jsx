import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/products/get");
        setProducts(res.data);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Shop</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border p-4 rounded shadow hover:shadow-lg transition"
          >
            <img
              src={product.images?.[0] || "https://via.placeholder.com/300"}
              alt={product.name}
              className="h-48 w-full object-cover mb-4"
            />

            <h2 className="text-xl font-semibold">{product.name}</h2>

            <p className="text-gray-600 mb-2">
              ₹ {product.price}
            </p>

            <Link to={`/product/${product._id}`} className="inline-block bg-black text-white px-4 py-2 rounded">
                View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;