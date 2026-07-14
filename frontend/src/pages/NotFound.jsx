import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div data-testid="not-found-page" className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-3">404</div>
      <h1 className="font-heading text-5xl md:text-6xl text-ink mb-4">Page not found</h1>
      <p className="text-smoke mb-8">The page you're looking for has moved or no longer exists.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-rust hover:bg-rustDark text-ivory px-8 py-4 text-xs uppercase tracking-[0.24em]">
        Back to Home
      </Link>
    </div>
  );
}
