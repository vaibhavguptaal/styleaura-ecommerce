import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, MessageCircle, Ruler, Zap } from "lucide-react";
import { api } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import { ProductPlaceholder } from "../components/ProductPlaceholder";
import { CATEGORIES } from "../data/categories";
import { buildGenericWhatsAppLink } from "../lib/whatsapp";

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    api.get("/products?new_arrival=true").then((r) => setNewArrivals(r.data.slice(0, 4)));
    api.get("/products?best_seller=true").then((r) => setBestSellers(r.data.slice(0, 4)));
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="min-h-[78vh] md:min-h-[86vh] flex items-center justify-center relative"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #F3F1EB 0%, #E8DCCB 55%, #DCCEB6 100%)",
          }}
        >
          <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto text-center px-6 animate-fade-up">
            <div className="text-xs uppercase tracking-[0.32em] text-gold font-semibold mb-6">
              Spring — Summer Edit
            </div>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-ink leading-[1.05] font-medium">
              Timeless pieces,
              <br />
              <em className="text-rust not-italic">quietly modern.</em>
            </h1>
            <p className="mt-6 text-smoke text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Everyday elegance handpicked for the modern Indian woman. Order with a tap on WhatsApp.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                data-testid="hero-shop-now"
                to="/shop"
                className="bg-rust hover:bg-rustDark text-ivory text-xs uppercase tracking-[0.24em] px-8 py-4 flex items-center justify-center gap-2 transition-colors"
              >
                Shop Now <ArrowRight size={14} strokeWidth={1.6} />
              </Link>
              <a
                data-testid="hero-order-whatsapp"
                href={buildGenericWhatsAppLink("Hi StyleAura, I'd like to browse your latest collection.")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent border border-ink text-ink hover:bg-ink hover:text-ivory text-xs uppercase tracking-[0.24em] px-8 py-4 flex items-center justify-center gap-2 transition-colors"
              >
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Browse</div>
            <h2 className="font-heading text-3xl md:text-4xl text-ink">Shop by Category</h2>
          </div>
          <Link to="/categories" className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] hover:text-rust">
            All Categories <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/shop?category=${encodeURIComponent(c.slug)}`}
              data-testid={`home-cat-${c.slug.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative aspect-[4/5] bg-linen border border-hairline hover:border-rust transition-colors overflow-hidden"
            >
              <ProductPlaceholder label={c.name} />
              <div className="absolute inset-x-0 bottom-0 p-4 z-10 bg-gradient-to-t from-ivory/95 to-transparent">
                <div className="font-heading text-lg text-ink">{c.name}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-smoke mt-0.5">{c.tagline}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Just In</div>
            <h2 className="font-heading text-3xl md:text-4xl text-ink">New Arrivals</h2>
          </div>
          <Link to="/new-arrivals" className="text-xs uppercase tracking-[0.2em] hover:text-rust hidden md:inline-flex items-center gap-2">
            View All <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {newArrivals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Loved by many</div>
            <h2 className="font-heading text-3xl md:text-4xl text-ink">Best Sellers</h2>
          </div>
          <Link to="/best-sellers" className="text-xs uppercase tracking-[0.2em] hover:text-rust hidden md:inline-flex items-center gap-2">
            View All <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {bestSellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* WHY SHOP */}
      <section className="bg-linen mt-16 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Our Promise</div>
            <h2 className="font-heading text-3xl md:text-4xl text-ink">Why Shop With Us</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10">
            {[
              { icon: Sparkles, title: "Trendy Collection", desc: "Curated weekly with fresh silhouettes." },
              { icon: Zap, title: "Affordable Pricing", desc: "Fair prices, honest quality." },
              { icon: MessageCircle, title: "WhatsApp Ordering", desc: "One-tap to place your order." },
              { icon: Ruler, title: "Size Support", desc: "Guidance for the perfect fit." },
              { icon: Truck, title: "Fast Response", desc: "Personal replies within hours." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full border border-hairlineStrong flex items-center justify-center text-rust mb-4">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <div className="font-heading text-lg text-ink mb-1">{title}</div>
                <p className="text-sm text-smoke leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Follow the story</div>
          <h2 className="font-heading text-3xl md:text-4xl text-ink">@styleaura.fashion</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="relative aspect-square overflow-hidden">
              <ProductPlaceholder label={["Sunday","Boutique","Detail","Petal","Draped","Ivory"][i]} subLabel="StyleAura" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mt-8">
        <div
          className="max-w-7xl mx-auto mx-4 sm:mx-6 lg:mx-auto lg:px-8"
        >
          <div
            className="relative overflow-hidden text-center py-20 md:py-28 px-6"
            style={{ background: "linear-gradient(135deg, #843831 0%, #6B2C26 100%)" }}
          >
            <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto text-ivory">
              <div className="text-xs uppercase tracking-[0.32em] text-gold font-semibold mb-4">Ready to order?</div>
              <h2 className="font-heading text-4xl md:text-5xl mb-6">Message us on WhatsApp.</h2>
              <p className="text-ivory/80 mb-8">
                Share the product you love and we'll confirm availability, size and delivery — usually within a few hours.
              </p>
              <a
                data-testid="cta-whatsapp"
                href={buildGenericWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-wa hover:bg-waDark text-white px-8 py-4 text-xs uppercase tracking-[0.24em] transition-colors"
              >
                Chat on WhatsApp <ArrowRight size={14} strokeWidth={1.6} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
