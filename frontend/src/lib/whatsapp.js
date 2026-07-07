// StyleAura WhatsApp configuration. Change this number to point orders at your real WhatsApp Business line.
export const WHATSAPP_NUMBER = "919999999999"; // country code + number, no + or spaces
export const INSTAGRAM_HANDLE = "styleaura.fashion";
export const BRAND_NAME = "StyleAura Fashion";

export function buildProductWhatsAppLink(product, { size, color } = {}) {
  const price = product.discount_price ?? product.price;
  const parts = [
    `Hi ${BRAND_NAME}, I want to order this product:`,
    `Product: ${product.name}`,
    size ? `Size: ${size}` : null,
    color ? `Color: ${color}` : null,
    `Price: Rs. ${price}`,
    `Please share availability and delivery details.`,
  ].filter(Boolean);
  const message = encodeURIComponent(parts.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export function buildGenericWhatsAppLink(text) {
  const message = encodeURIComponent(text || `Hi ${BRAND_NAME}, I'd like to know more.`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
