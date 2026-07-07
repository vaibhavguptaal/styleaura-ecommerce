import React from "react";
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { buildGenericWhatsAppLink, INSTAGRAM_HANDLE } from "../lib/whatsapp";

export function Footer() {
  return (
    <footer data-testid="site-footer" className="bg-linen border-t border-hairline mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="font-heading text-3xl text-rust">StyleAura</div>
          <p className="mt-3 text-sm text-smoke leading-relaxed max-w-xs">
            Curated everyday elegance for the modern Indian woman. Small-batch,
            thoughtfully sourced, delivered with care.
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-4">Shop</div>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-rust" to="/shop">All Products</Link></li>
            <li><Link className="hover:text-rust" to="/new-arrivals">New Arrivals</Link></li>
            <li><Link className="hover:text-rust" to="/best-sellers">Best Sellers</Link></li>
            <li><Link className="hover:text-rust" to="/categories">Categories</Link></li>
            <li><Link className="hover:text-rust" to="/wishlist">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-4">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-rust" to="/about">About Us</Link></li>
            <li><Link className="hover:text-rust" to="/contact">Contact</Link></li>
            <li><Link className="hover:text-rust" to="/order">Order / Enquiry</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-4">Policies</div>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-rust" to="/policy/shipping">Shipping Policy</Link></li>
            <li><Link className="hover:text-rust" to="/policy/returns">Returns & Exchange</Link></li>
            <li><Link className="hover:text-rust" to="/policy/privacy">Privacy Policy</Link></li>
            <li><Link className="hover:text-rust" to="/policy/terms">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-smoke">© {new Date().getFullYear()} StyleAura Fashion. Crafted in India.</span>
          <div className="flex items-center gap-3">
            <a
              data-testid="footer-instagram"
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-full border border-hairlineStrong flex items-center justify-center text-ink hover:text-rust hover:border-rust transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={16} strokeWidth={1.5} />
            </a>
            <a
              data-testid="footer-whatsapp"
              href={buildGenericWhatsAppLink("Hi StyleAura, I'd like to know more.")}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-full bg-wa hover:bg-waDark flex items-center justify-center text-white"
              aria-label="WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M19.11 17.36c-.32-.16-1.88-.92-2.17-1.02-.29-.11-.5-.16-.71.16-.21.32-.82 1.02-1 1.23-.19.21-.37.24-.69.08-.32-.16-1.34-.5-2.55-1.58-.94-.84-1.58-1.88-1.77-2.2-.19-.32-.02-.5.14-.66.15-.14.32-.37.48-.55.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.72-.97-2.35-.26-.62-.52-.53-.71-.54-.19-.01-.4-.01-.61-.01-.21 0-.55.08-.84.4-.29.32-1.11 1.08-1.11 2.63 0 1.55 1.14 3.05 1.29 3.26.16.21 2.25 3.44 5.46 4.83.76.33 1.36.53 1.82.68.77.24 1.47.21 2.03.13.62-.09 1.88-.77 2.15-1.51.27-.74.27-1.37.19-1.51-.08-.13-.29-.21-.61-.37z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
