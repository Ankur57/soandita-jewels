import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 5;
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `/products/get?page=${page}&limit=5&search=${search}`
      );

      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
      setLoading(false);


    } catch (error) {
      console.error(error);
    }
  };


  const toggleStatus = async (id) => {
    const res = await axios.put(`/products/update/${id}`, {
      isActive: !products.find(p => p._id === id).isActive
    });

    setProducts(products.map(p =>
      p._id === id ? res.data : p
    ));
  };

  useEffect(() => {

    fetchProducts();
  }, [page, search]);

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

        <input
          type="text"
          placeholder="Search by SKU, name or price..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="border p-2 rounded w-64"
        />

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
              <th className="p-4">SKU</th>
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

                <td className="p-4">{product.sku}</td>

                <td className="p-4">
                  {product.images?.length > 0 && (
                    <a
                      href={`${IMAGE_BASE_URL}${product.images[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={`${IMAGE_BASE_URL}${product.images[0]}`}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded cursor-pointer"
                      />
                    </a>
                  )}
                </td>

                <td className="p-4">
                  <Link
                    to={`/admin/products/${product._id}`}
                    className="text-blue-600 underline"
                  >
                    {product.name}
                  </Link>
                </td>
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
      <div className="flex justify-center gap-4 mt-6">

        <button
          disabled={page === 1}
          onClick={() => setPage(prev => prev - 1)}
          className="px-4 py-2 border rounded"
        >
          Prev
        </button>

        <span>Page {page} of {totalPages}</span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(prev => prev + 1)}
          className="px-4 py-2 border rounded"
        >
          Next
        </button>

      </div>
    </div>
  );
}

export default AdminProducts;