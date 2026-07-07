import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div data-testid="about-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Our story</div>
      <h1 className="font-heading text-4xl md:text-5xl text-ink mb-6">Made with care, worn with joy.</h1>
      <div className="prose max-w-none text-smoke leading-relaxed space-y-4">
        <p>
          StyleAura Fashion is a small independent boutique for the modern Indian woman.
          We believe getting dressed should feel joyful, not overwhelming — so we curate
          a tight, thoughtful edit of pieces you'll actually reach for.
        </p>
        <p>
          Every kurti, dress and co-ord set is chosen for its fabric, its fit and the
          way it makes you feel. We work with small-batch makers and share the finished
          collection directly with you — no middlemen, no markup on trend.
        </p>
        <p>
          Have a question or a special request? We answer every WhatsApp message
          personally. That's the whole promise.
        </p>
      </div>
      <div className="mt-10">
        <Link
          data-testid="about-cta"
          to="/shop"
          className="inline-flex items-center gap-2 bg-rust hover:bg-rustDark text-ivory px-8 py-4 text-xs uppercase tracking-[0.24em] transition-colors"
        >
          Explore the Collection
        </Link>
      </div>
    </div>
  );
}
