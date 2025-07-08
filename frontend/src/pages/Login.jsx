import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedData = {
      ...formData,
      email: formData.email.trim(), // ✅ Ensure no leading/trailing spaces
      // optional: password stays as-is or validate it separately
    };

    try {
      const res = await loginUser(cleanedData);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("first_name", res.data.first_name);
      console.log("Response data:", res.data);
      navigate("/game");
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white text-gray-900 rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center">Welcome Back</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm font-semibold">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-blue-500 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
