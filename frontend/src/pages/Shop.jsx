import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import { CATEGORIES, SIZE_OPTIONS } from "../data/categories";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";

const SORT_OPTIONS = [
  { value: "new", label: "New Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "best_sellers", label: "Best Sellers" },
];

function Filters({ category, setCategory, size, setSize, price, setPrice, sort, setSort }) {
  return (
    <div className="flex flex-col gap-8" data-testid="shop-filters">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-3">Category</div>
        <div className="flex flex-col gap-2">
          {[{ slug: "all", name: "All" }, ...CATEGORIES].map((c) => (
            <button
              key={c.slug}
              data-testid={`filter-cat-${c.slug.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setCategory(c.slug === "all" ? "" : c.slug)}
              className={`text-left text-sm py-1 transition-colors ${
                (category || "") === (c.slug === "all" ? "" : c.slug)
                  ? "text-rust font-medium"
                  : "text-ink hover:text-rust"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-3">Size</div>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              data-testid={`filter-size-${s.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setSize(size === s ? "" : s)}
              className={`h-8 min-w-[36px] px-2 text-xs border transition-colors ${
                size === s ? "bg-rust text-ivory border-rust" : "border-hairlineStrong hover:border-rust"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-3">Price (₹)</div>
        <Slider
          data-testid="filter-price-slider"
          value={price}
          min={0}
          max={5000}
          step={100}
          onValueChange={setPrice}
        />
        <div className="flex justify-between text-xs text-smoke mt-3">
          <span>₹{price[0]}</span>
          <span>₹{price[1]}</span>
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-3">Sort</div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger data-testid="filter-sort" className="w-full bg-ivory border-hairlineStrong text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function Shop({ heading = "The Collection", initial = {} }) {
  const [params, setParams] = useSearchParams();

  const [category, setCategory] = useState(params.get("category") || initial.category || "");
  const [size, setSize] = useState(params.get("size") || "");
  const [price, setPrice] = useState([0, 5000]);
  const [sort, setSort] = useState(params.get("sort") || "new");
  const [search, setSearch] = useState(params.get("search") || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (size) q.set("size", size);
    if (search) q.set("search", search);
    if (sort) q.set("sort", sort);
    if (price[0] > 0) q.set("min_price", String(price[0]));
    if (price[1] < 5000) q.set("max_price", String(price[1]));
    if (initial.best_seller) q.set("best_seller", "true");
    if (initial.new_arrival) q.set("new_arrival", "true");
    return q.toString();
  }, [category, size, price, sort, search, initial]);

  useEffect(() => {
    setLoading(true);
    api.get(`/products?${query}`).then((r) => {
      setProducts(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    setSearch(params.get("search") || "");
    if (params.get("category")) setCategory(params.get("category"));
  }, [params]);

  return (
    <div data-testid="shop-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Shop</div>
          <h1 className="font-heading text-4xl md:text-5xl text-ink">{heading}</h1>
          {search && <p className="text-sm text-smoke mt-2">Results for “{search}”</p>}
        </div>
        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                data-testid="mobile-filter-trigger"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] border border-hairlineStrong px-4 py-3"
              >
                <SlidersHorizontal size={14} strokeWidth={1.5} /> Filters
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-ivory w-80 overflow-y-auto">
              <div className="pt-6">
                <Filters {...{ category, setCategory, size, setSize, price, setPrice, sort, setSort }} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr] gap-10">
        <aside className="hidden md:block sticky top-24 self-start">
          <Filters {...{ category, setCategory, size, setSize, price, setPrice, sort, setSort }} />
        </aside>

        <div>
          {loading ? (
            <div className="text-sm text-smoke py-20 text-center">Loading pieces…</div>
          ) : products.length === 0 ? (
            <div className="text-sm text-smoke py-20 text-center border border-dashed border-hairlineStrong">
              No products match these filters yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
