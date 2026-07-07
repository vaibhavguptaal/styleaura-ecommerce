import React from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../data/categories";
import { ProductPlaceholder } from "../components/ProductPlaceholder";

export default function Categories() {
  return (
    <div data-testid="categories-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Explore</div>
        <h1 className="font-heading text-4xl md:text-5xl text-ink">All Categories</h1>
        <p className="text-sm text-smoke mt-3 max-w-xl">Find your next favourite — from breezy cotton kurtis to festive ethnic sets.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            data-testid={`categories-card-${c.slug.toLowerCase().replace(/\s+/g, "-")}`}
            to={`/shop?category=${encodeURIComponent(c.slug)}`}
            className="group relative aspect-[4/5] md:aspect-[4/3] bg-linen border border-hairline hover:border-rust transition-colors overflow-hidden"
          >
            <ProductPlaceholder label={c.name} />
            <div className="absolute inset-x-0 bottom-0 p-6 z-10 bg-gradient-to-t from-ivory to-transparent">
              <div className="font-heading text-2xl text-ink">{c.name}</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-smoke mt-1">{c.tagline}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
