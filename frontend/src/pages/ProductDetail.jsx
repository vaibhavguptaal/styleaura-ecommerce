import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { ProductPlaceholder } from "../components/ProductPlaceholder";
import { ProductCard } from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext";
import { buildProductWhatsAppLink } from "../lib/whatsapp";
import { Heart, Truck, RefreshCw, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [gallery, setGallery] = useState(0);
  const [imgOk, setImgOk] = useState(true);
  const [error, setError] = useState(null);
  const { has, toggle } = useWishlist();

  const load = React.useCallback(() => {
    setProduct(null); setError(null); setImgOk(true);
    api.get(`/products/${id}`).then((r) => {
      setProduct(r.data);
      setSize(r.data.sizes?.[0] || "");
      setColor(r.data.colors?.[0] || "");
      setQuantity(1);
      api.get(`/products?category=${encodeURIComponent(r.data.category)}`).then((rr) => {
        setRelated(rr.data.filter((p) => p.id !== r.data.id).slice(0, 4));
      });
    });
  }, [id]);

  if (!product) return <div className="py-24 text-center text-smoke">Loading…</div>;

  const wished = has(product.id);
  const priceCurrent = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const link = buildProductWhatsAppLink(product, { size, color });

  return (
    <div data-testid="product-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[3/4] w-full bg-linen overflow-hidden">
            {heroImg && imgOk ? (
              <img src={heroImg} alt={product.name} onError={() => setImgOk(false)}
                   className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <ProductPlaceholder label={product.name} subLabel={product.category} />
            )}
          </div>
          {product.image_urls?.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.image_urls.slice(0, 4).map((u, i) => (
                <button key={i} onClick={() => { setGallery(i); setImgOk(true); }}
                        data-testid={`gallery-thumb-${i}`}
                        className={`relative aspect-square bg-linen border overflow-hidden ${gallery === i ? "border-rust" : "border-hairline"}`}>
                  <img src={u} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5 md:pl-4">
          <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold">{product.category}</div>
          <h1 className="font-heading text-3xl md:text-4xl text-ink leading-tight">{product.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl text-rust font-medium">₹{priceCurrent}</span>
            {hasDiscount && (
              <>
                <span className="text-smoke line-through">₹{product.price}</span>
                <span className="text-xs bg-saleTag text-ivory px-2 py-1 uppercase tracking-[0.18em]">
                  Save ₹{product.price - product.discount_price}
                </span>
              </>
            )}
          </div>

          {product.stock_status === "in_stock" && (
            <div className="text-xs uppercase tracking-[0.22em] text-emerald-700">In Stock</div>
          )}
          {product.stock_status === "low_stock" && (
            <div className="text-xs uppercase tracking-[0.22em] text-saleTag">Low Stock — Order Soon</div>
          )}
          {product.stock_status === "out_of_stock" && (
            <div className="text-xs uppercase tracking-[0.22em] text-red-600">Out of Stock</div>
          )}

          <p className="text-sm text-smoke leading-relaxed">{product.description}</p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-ink mb-2">Size · {size}</div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    data-testid={`size-selector-${s.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setSize(s)}
                    className={`h-10 min-w-[40px] px-3 text-sm border transition-colors ${
                      size === s ? "bg-rust text-ivory border-rust" : "border-hairlineStrong hover:border-rust"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-ink mb-2">Color · {color}</div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    data-testid={`color-selector-${c.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setColor(c)}
                    className={`px-3 h-10 text-sm border transition-colors ${
                      color === c ? "bg-ink text-ivory border-ink" : "border-hairlineStrong hover:border-ink"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <a
              data-testid="btn-whatsapp-order"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-wa hover:bg-waDark text-white text-xs uppercase tracking-[0.24em] px-6 py-4 flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle size={16} strokeWidth={1.6} /> Order on WhatsApp
            </a>
            <button
              data-testid="btn-add-to-wishlist"
              onClick={() => {
                toggle(product.id);
                toast(wished ? "Removed from wishlist" : "Added to wishlist");
              }}
              className={`px-6 py-4 border text-xs uppercase tracking-[0.24em] flex items-center justify-center gap-2 transition-colors ${
                wished ? "border-rust text-rust" : "border-hairlineStrong hover:border-rust hover:text-rust"
              }`}
            >
              <Heart size={16} strokeWidth={1.5} className={wished ? "fill-rust" : ""} />
              {wished ? "Saved" : "Save"}
            </button>
          </div>

          {/* Details */}
          <div className="mt-4 border-t border-hairline pt-6 grid gap-4 text-sm text-smoke">
            {product.fabric && (
              <div><span className="text-ink uppercase text-[10px] tracking-[0.22em] mr-2">Fabric</span>{product.fabric}</div>
            )}
            {product.delivery_note && (
              <div className="flex gap-3"><Truck size={16} className="text-rust mt-0.5" strokeWidth={1.5} />{product.delivery_note}</div>
            )}
            {product.care_instructions && (
              <div className="flex gap-3"><RefreshCw size={16} className="text-rust mt-0.5" strokeWidth={1.5} />{product.care_instructions}</div>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-heading text-2xl md:text-3xl text-ink">You may also love</h2>
            <Link to="/shop" className="text-xs uppercase tracking-[0.2em] hover:text-rust">See All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
