import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
  });

  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();

      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      images.forEach((image) => {
        formData.append("images", image);
      });

      await axios.post("/products/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/admin/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    }
  };

  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  fetchCategories();
}, []);
const handleCreateCategory = async () => {
  try {
    setCategoryError("");

    if (!newCategoryName.trim()) {
      setCategoryError("Category name required");
      return;
    }

    const res = await axios.post("/categories", {
      name: newCategoryName,
    });

    const createdCategory = res.data;

    // Update dropdown
    setCategories((prev) => [...prev, createdCategory]);

    // Auto select new category
    setForm((prev) => ({
      ...prev,
      category: createdCategory._id,
    }));

    // Reset modal
    setNewCategoryName("");
    setShowCategoryModal(false);

  } catch (error) {
    setCategoryError(
      error.response?.data?.message || "Failed to create category"
    );
  }
};

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">
        Add New Product
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          name="name"
          placeholder="Product Name"
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        />

        <select
        name="categoryId"
        onChange={handleChange}
        required
        className="w-full border p-3 rounded"
        >
        <option value="">Select Category</option>

        {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
            {cat.name}
            </option>
        ))}
        </select>
        <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            >
            + Add Category
        </button>
        {showCategoryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded w-96">

                <h2 className="text-xl font-bold mb-4">
                    Add New Category
                </h2>

            <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category Name"
            className="w-full border p-3 rounded mb-3"
            />

            {categoryError && (
            <p className="text-red-500 text-sm mb-2">
                {categoryError}
            </p>
            )}

            <div className="flex justify-end gap-3">
            <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border rounded"
            >
                Cancel
            </button>

            <button
                onClick={handleCreateCategory}
                className="bg-black text-white px-4 py-2 rounded"
            >
                Create
            </button>
            </div>

                </div>
            </div>
            )}

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />

        {error && (
          <p className="text-red-500">{error}</p>
        )}

        <button className="bg-black text-white px-6 py-3 rounded">
          Add Product
        </button>
      </form>
    </div>
  );
}

export default AddProduct;