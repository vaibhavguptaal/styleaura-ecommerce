import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext";

export default function Wishlist() {
  const { ids, clear } = useWishlist();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); return; }
    Promise.all(ids.map((id) => api.get(`/products/${id}`).then((r) => r.data).catch(() => null)))
      .then((list) => setProducts(list.filter(Boolean)));
  }, [ids]);

  return (
    <div data-testid="wishlist-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Saved</div>
          <h1 className="font-heading text-4xl md:text-5xl text-ink">Your Wishlist</h1>
        </div>
        {ids.length > 0 && (
          <button
            data-testid="wishlist-clear"
            onClick={clear}
            className="text-xs uppercase tracking-[0.2em] text-smoke hover:text-rust"
          >
            Clear All
          </button>
        )}
      </div>
      {products.length === 0 ? (
        <div className="border border-dashed border-hairlineStrong py-20 text-center">
          <p className="text-smoke text-sm">You haven't saved any pieces yet.</p>
          <Link to="/shop" className="mt-6 inline-flex items-center gap-2 bg-rust text-ivory px-6 py-3 text-xs uppercase tracking-[0.24em]">
            Discover the Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
