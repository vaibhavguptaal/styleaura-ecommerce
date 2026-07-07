import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function AdminLogin() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@styleaura.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) {
      toast.success("Welcome back");
      navigate("/admin");
    } else {
      toast.error(res.error || "Invalid credentials");
    }
  };

  return (
    <div data-testid="admin-login-page" className="max-w-md mx-auto px-4 sm:px-6 py-24">
      <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Admin</div>
      <h1 className="font-heading text-4xl text-ink mb-6">Sign in</h1>
      <form onSubmit={submit} className="space-y-5 bg-linen border border-hairline p-6 md:p-8">
        <div>
          <label className="text-xs uppercase tracking-[0.22em] text-ink mb-2 block">Email</label>
          <input
            data-testid="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-ivory border border-hairlineStrong px-4 py-3 text-sm outline-none focus:border-rust"
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.22em] text-ink mb-2 block">Password</label>
          <input
            data-testid="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-ivory border border-hairlineStrong px-4 py-3 text-sm outline-none focus:border-rust"
            required
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          data-testid="admin-login-submit"
          className="w-full bg-rust hover:bg-rustDark text-ivory text-xs uppercase tracking-[0.24em] px-6 py-4 transition-colors disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <p className="text-xs text-smoke mt-4">
        Default demo credentials: <code>admin@styleaura.com</code> / <code>admin123</code>
      </p>
    </div>
  );
}
