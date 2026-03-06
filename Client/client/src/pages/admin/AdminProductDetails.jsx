import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../api/axios";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

function AdminProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get(`/products/get/${id}`);
      setProduct(res.data);
    };

    fetchProduct();
  }, [id]);

  if (!product) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10">

      <h1 className="text-3xl font-bold mb-6">
        {product.name}
      </h1>

      {/* Images */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {product.images.map((img, index) => (
          <a
            key={index}
            href={`${IMAGE_BASE_URL}${img}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={`${IMAGE_BASE_URL}${img}`}
              alt=""
              className="w-full h-48 object-cover rounded"
            />
          </a>
        ))}
      </div>

      <div className="space-y-3">
        <p><strong>Price:</strong> ₹ {product.price}</p>
        <p><strong>Stock:</strong> {product.stock}</p>
        <p><strong>SKU:</strong> {product.sku}</p>
        <p><strong>Slug:</strong> {product.slug}</p>
        <p><strong>Description:</strong> {product.description}</p>
      </div>

    </div>
  );
}

export default AdminProductDetails;