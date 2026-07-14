import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { useWishlist } from "../context/WishlistContext";
import { buildProductWhatsAppLink } from "../lib/whatsapp";

export function ProductCard({ product }) {
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const link = buildProductWhatsAppLink(product);
  const priceCurrent = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const off = hasDiscount ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
  const imgSrc = product.thumbnail_url || product.image_urls?.[0];
  const [imgOk, setImgOk] = useState(true);

  return (
    <div data-testid={`product-card-${product.id}`} className="group relative flex flex-col gap-3">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-linen">
          {imgSrc && imgOk ? (
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              onError={() => setImgOk(false)}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <ProductPlaceholder label={product.name} subLabel={product.category} />
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {product.is_new_arrival && <span className="bg-ink text-ivory text-[10px] tracking-[0.2em] uppercase px-2 py-1">New</span>}
            {hasDiscount && <span className="bg-saleTag text-ivory text-[10px] tracking-[0.2em] uppercase px-2 py-1">{off}% Off</span>}
            {product.stock_status === "out_of_stock" && <span className="bg-smoke text-ivory text-[10px] tracking-[0.2em] uppercase px-2 py-1">Sold Out</span>}
          </div>
          <button
            type="button"
            data-testid={`btn-wishlist-${product.id}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
            className="absolute top-3 right-3 z-10 h-9 w-9 flex items-center justify-center bg-ivory/85 backdrop-blur-sm rounded-full border border-hairline hover:border-rust transition-colors"
            aria-label="Toggle wishlist"
          >
            <Heart size={16} strokeWidth={1.6} className={wished ? "text-rust fill-rust" : "text-ink"} />
          </button>
        </div>
      </Link>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-smoke">{product.category}</span>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-heading text-lg lg:text-xl text-ink line-clamp-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-body font-medium text-rust">₹{priceCurrent}</span>
          {hasDiscount && <span className="font-body text-sm text-smoke line-through">₹{product.price}</span>}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link to={`/product/${product.id}`} data-testid={`btn-view-${product.id}`}
                className="text-[11px] uppercase tracking-[0.18em] text-center py-2 border border-hairlineStrong hover:border-rust hover:text-rust transition-colors">
            View
          </Link>
          <a href={link} target="_blank" rel="noopener noreferrer"
             data-testid={`btn-whatsapp-order-${product.id}`}
             className="text-[11px] uppercase tracking-[0.18em] text-center py-2 bg-wa hover:bg-waDark text-white transition-colors">
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
