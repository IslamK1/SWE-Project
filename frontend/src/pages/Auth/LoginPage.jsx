// src/pages/Auth/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("owner@supplier.kz");
  const [password, setPassword] = useState("owner123");
  const [error, setError] = useState("");

  // If already logged in, go to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const result = login(email, password);
    if (!result.success) {
      setError(result.message || "Login failed");
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white border rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-semibold mb-1">Supplier login</h1>
        <p className="text-sm text-slate-600 mb-4">
          Log in as <strong>Owner</strong> or <strong>Manager</strong> to manage
          your supplier account.
        </p>

        {error && (
          <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="owner@supplier.kz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Demo accounts: owner@supplier.kz / owner123 or
              manager@supplier.kz / manager123
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-2 px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Log in
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-600 flex justify-between items-center">
          <span>Don&apos;t have an account?</span>
          <Link
            to="/signup"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up as Owner / Manager
          </Link>
        </div>
      </div>
    </div>
  );
}
