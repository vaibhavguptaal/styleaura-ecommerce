import React from "react";
import { useParams } from "react-router-dom";

const POLICIES = {
  shipping: {
    title: "Shipping Policy",
    body: [
      "We ship pan-India, usually dispatching within 24-48 hours of order confirmation.",
      "Standard delivery takes 3-5 business days to metros and 5-8 business days to other locations.",
      "You'll receive a tracking link via WhatsApp as soon as your order is shipped.",
      "Shipping is complimentary on prepaid orders above ₹1,499. A small fee applies for smaller orders and cash-on-delivery (where available).",
    ],
  },
  returns: {
    title: "Return & Exchange Policy",
    body: [
      "We accept size exchanges within 5 days of delivery for unworn, unwashed items with tags intact.",
      "Because we're a small boutique, sale and custom-tailored pieces are final sale.",
      "To initiate an exchange, please WhatsApp us with your order details and a photo of the item.",
      "Returns are processed within 5-7 business days of receiving the item at our studio.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "We only collect the information you share with us to fulfil your order — your name, phone, delivery address and any messages.",
      "We never sell or share your data with third parties. Your details stay with us and our shipping partner.",
      "You can request deletion of your data anytime by messaging us on WhatsApp.",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    body: [
      "By placing an order with StyleAura Fashion, you agree to our Shipping, Return and Privacy policies.",
      "Product colours may vary slightly from what you see on screen due to lighting and monitor differences.",
      "All disputes are subject to the exclusive jurisdiction of the courts of India.",
    ],
  },
};

export default function Policy() {
  const { slug } = useParams();
  const policy = POLICIES[slug] || POLICIES.shipping;
  return (
    <div data-testid={`policy-page-${slug}`} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Policies</div>
      <h1 className="font-heading text-4xl md:text-5xl text-ink mb-8">{policy.title}</h1>
      <div className="space-y-4 text-smoke leading-relaxed">
        {policy.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <p className="mt-10 text-xs text-smoke italic">
        This page is a placeholder written for a small clothing business in India — edit it in <code>/app/frontend/src/pages/Policy.jsx</code> anytime.
      </p>
    </div>
  );
}
