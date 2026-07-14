import { buildProductWhatsAppLink, buildGenericWhatsAppLink } from "../lib/whatsapp";

describe("whatsapp link builder", () => {
  const product = {
    id: "p1", name: "Rose Kurti", sku: "SA-K-1",
    price: 1899, discount_price: 1299,
  };

  test("builds product message with size, color, quantity, sku, discount price", () => {
    const url = buildProductWhatsAppLink(product, { size: "M", color: "Blush", quantity: 2 });
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(decoded).toContain("Product: Rose Kurti");
    expect(decoded).toContain("SKU: SA-K-1");
    expect(decoded).toContain("Size: M");
    expect(decoded).toContain("Color: Blush");
    expect(decoded).toContain("Quantity: 2");
    expect(decoded).toContain("Price: ₹1299");
  });

  test("quantity defaults to 1 when not provided", () => {
    const url = buildProductWhatsAppLink(product);
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(decoded).toContain("Quantity: 1");
  });

  test("generic link returns wa.me URL", () => {
    const url = buildGenericWhatsAppLink("Hello");
    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(decodeURIComponent(url.split("?text=")[1])).toBe("Hello");
  });
});
