import { useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/auth/login", form);
      login(res.data);

      res.data.user.role === "admin"
        ? navigate("/admin")
        : navigate("/employee");
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">

      {/* Glow Background */}
      <div className="absolute w-96 h-96 bg-purple-600 opacity-20 blur-3xl rounded-full -top-20 -left-20 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-green-500 opacity-20 blur-3xl rounded-full bottom-0 right-0 animate-pulse"></div>

      {/* Card */}
      <div className="relative backdrop-blur-lg bg-white/10 border border-white/20 p-10 rounded-2xl shadow-2xl w-full max-w-md">

        <h2 className="text-3xl font-bold text-center mb-2">
          Employee Management
        </h2>

        <p className="text-center text-gray-400 mb-8">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 rounded-lg bg-black/40 border border-gray-600 focus:border-green-400 outline-none"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-black/40 border border-gray-600 focus:border-green-400 outline-none"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg font-bold transition transform hover:scale-105"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-green-400 hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;