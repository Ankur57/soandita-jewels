import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/auth/register", form);

      login(res.data.user, res.data.token);

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Register
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        />

        <input
          name="mobileNumber"
          placeholder="Mobile Number"
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        />

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button className="w-full bg-black text-white py-3 rounded">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;