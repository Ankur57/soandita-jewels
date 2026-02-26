import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/products/get");
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await axios.delete(`/products/delete/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      alert("Delete failed");
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>

        <Link
          to="/admin/add-product"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Product
        </Link>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t">

                <td className="p-4">
                  {product.images?.length > 0 && (
                    <a
                        href={`http://localhost:5000${product.images[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                        <img
                            src={`http://localhost:5000${product.images[0]}`}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded cursor-pointer"
                        />
                    </a>
                  )}
                </td>

                <td className="p-4">{product.name}</td>
                <td className="p-4">₹ {product.price}</td>
                <td className="p-4">{product.stock}</td>

                <td className="p-4 flex gap-3">
                  <Link
                    to={`/admin/edit-product/${product._id}`}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProducts;