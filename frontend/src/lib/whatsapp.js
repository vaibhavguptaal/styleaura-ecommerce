// StyleAura brand + WhatsApp configuration.
// In production, override via REACT_APP_* env vars in frontend/.env.
export const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER || "919999999999";
export const INSTAGRAM_HANDLE = process.env.REACT_APP_INSTAGRAM_HANDLE || "styleaura.fashion";
export const BRAND_NAME = process.env.REACT_APP_BRAND_NAME || "StyleAura Fashion";
export const CONTACT_EMAIL = process.env.REACT_APP_CONTACT_EMAIL || "hello@styleaura.com";
export const CURRENCY = process.env.REACT_APP_CURRENCY || "INR";

export function buildProductWhatsAppLink(product, { size, color, quantity, note } = {}) {
  const price = product.discount_price ?? product.price;
  const qty = Math.max(1, Number(quantity || 1));
  const url = typeof window !== "undefined" ? `${window.location.origin}/product/${product.id}` : "";
  const parts = [
    `Hi ${BRAND_NAME}, I want to order this product:`,
    `Product: ${product.name}`,
    product.sku ? `SKU: ${product.sku}` : null,
    size ? `Size: ${size}` : null,
    color ? `Color: ${color}` : null,
    `Quantity: ${qty}`,
    `Price: ₹${price}`,
    url ? `Link: ${url}` : null,
    note ? `Note: ${note}` : null,
    `Please share availability and delivery details.`,
  ].filter(Boolean);
  const message = encodeURIComponent(parts.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export function buildGenericWhatsAppLink(text) {
  const message = encodeURIComponent(text || `Hi ${BRAND_NAME}, I'd like to know more.`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
