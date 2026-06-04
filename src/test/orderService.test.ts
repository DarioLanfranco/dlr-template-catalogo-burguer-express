import { describe, it, expect } from "vitest";
import {
  buildOrderMessage,
  buildQuickOrderMessage,
  getWhatsAppUrl,
  type OrderFormData,
} from "../services/orderService";
import { formatPrice } from "../lib/checkout";
import type { CartItem } from "../store/cart";

function burger(overrides?: Partial<CartItem>): CartItem {
  return {
    id: "burger-clasica",
    name: "Burger Clasica",
    price: 7200,
    quantity: 2,
    ...overrides,
  };
}

function pizza(overrides?: Partial<CartItem>): CartItem {
  return {
    id: "pizza-especial",
    name: "Pizza Especial",
    price: 8500,
    quantity: 1,
    ...overrides,
  };
}

const defaultFormData: OrderFormData = {
  customerName: "Juan Perez",
  deliveryMode: "delivery",
  deliveryAddress: "Av. Corrientes 1234",
  paymentMethod: "cash",
};

const siteName = "PEPÓN";

describe("formatPrice", () => {
  it("formats a positive integer", () => {
    expect(formatPrice(7200)).toBe("$ 7.200");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$ 0");
  });

  it("handles NaN", () => {
    expect(formatPrice(NaN)).toBe("$ 0");
  });

  it("handles negative prices", () => {
    expect(formatPrice(-100)).toBe("$ 0");
  });

  it("handles Infinity", () => {
    expect(formatPrice(Infinity)).toBe("$ 0");
  });
});

describe("getWhatsAppUrl", () => {
  it("builds a valid api.whatsapp.com URL", () => {
    const url = getWhatsAppUrl("+5493584201263", "Hola");
    expect(url).toContain("https://api.whatsapp.com/send?phone=5493584201263&text=Hola");
  });

  it("strips non-digit characters from phone number", () => {
    const url = getWhatsAppUrl("+54 9 (358) 420-1263", "test");
    expect(url).toContain("phone=5493584201263");
  });

  it("encodes the message", () => {
    const url = getWhatsAppUrl("123", "Hola ¿cómo estás?");
    expect(url).toContain(encodeURIComponent("Hola ¿cómo estás?"));
  });
});

describe("buildOrderMessage", () => {
  it("includes all required sections in the correct order", () => {
    const result = buildOrderMessage(
      [burger()],
      14400,
      defaultFormData,
      siteName,
    );

    const lines = result.split("\n");

    expect(lines[0]).toContain("NUEVO PEDIDO DE PEPÓN");

    const clientIdx = lines.findIndex((l) => l.includes("Cliente:"));
    const deliveryIdx = lines.findIndex((l) => l.includes("Modo:"));
    const addressIdx = lines.findIndex((l) => l.includes("Dirección:"));
    const paymentIdx = lines.findIndex((l) => l.includes("Pago:"));
    const itemsHeaderIdx = lines.findIndex((l) => l.includes("DETALLE:"));
    const totalIdx = lines.findIndex((l) => l.includes("TOTAL COMPRA:"));
    const footerIdx = lines.findIndex((l) => l.includes("Pepón App"));

    expect(clientIdx).toBeGreaterThan(0);
    expect(deliveryIdx).toBeGreaterThan(clientIdx);
    expect(addressIdx).toBeGreaterThan(deliveryIdx);
    expect(paymentIdx).toBeGreaterThan(addressIdx);
    expect(itemsHeaderIdx).toBeGreaterThan(paymentIdx);
    expect(totalIdx).toBeGreaterThan(itemsHeaderIdx);
    expect(footerIdx).toBeGreaterThan(totalIdx);
  });

  it("includes customer name", () => {
    const result = buildOrderMessage([burger()], 7200, defaultFormData, siteName);
    expect(result).toContain("*Cliente:* Juan Perez");
  });

  it("uses delivery label for delivery mode", () => {
    const result = buildOrderMessage([burger()], 7200, defaultFormData, siteName);
    expect(result).toContain("*Modo:* Envío a Domicilio");
  });

  it("uses pickup label for pickup mode", () => {
    const data = { ...defaultFormData, deliveryMode: "pickup" };
    const result = buildOrderMessage([burger()], 7200, data, siteName);
    expect(result).toContain("*Modo:* Retiro en Local / Take Away");
  });

  it("shows address for delivery mode", () => {
    const result = buildOrderMessage([burger()], 7200, defaultFormData, siteName);
    expect(result).toContain("*Dirección:* Av. Corrientes 1234");
  });

  it('shows "Retiro en Local" for pickup mode', () => {
    const data = { ...defaultFormData, deliveryMode: "pickup", deliveryAddress: "" };
    const result = buildOrderMessage([burger()], 7200, data, siteName);
    expect(result).toContain("*Dirección:* Retiro en Local");
  });

  it("uses payment label for payment method", () => {
    const result = buildOrderMessage([burger()], 7200, defaultFormData, siteName);
    expect(result).toContain("*Pago:* Efectivo al Cadete");
  });

  it("includes transfer label", () => {
    const data = { ...defaultFormData, paymentMethod: "transfer" };
    const result = buildOrderMessage([burger()], 7200, data, siteName);
    expect(result).toContain("*Pago:* Transferencia / Mercado Pago");
  });

  it("includes item details with quantity, name, and price", () => {
    const result = buildOrderMessage([burger()], 14400, defaultFormData, siteName);
    expect(result).toContain("2x Burger Clasica");
    expect(result).toContain("$ 14.400");
  });

  it("includes variant in item line", () => {
    const items = [burger({ variant: "con cheddar" })];
    const result = buildOrderMessage(items, 14400, defaultFormData, siteName);
    expect(result).toContain("(con cheddar)");
  });

  it("includes total purchase value", () => {
    const result = buildOrderMessage([burger(), pizza()], 22900, defaultFormData, siteName);
    expect(result).toContain("*TOTAL COMPRA:* $ 22.900");
  });

  it('returns "— Sin productos —" when cart is empty', () => {
    const result = buildOrderMessage([], 0, defaultFormData, siteName);
    expect(result).toContain("— Sin productos —");
  });

  it("uses site name in header", () => {
    const result = buildOrderMessage([burger()], 7200, defaultFormData, "PEPÓN");
    expect(result).toContain("PEPÓN");
  });

  it("uppercases site name in header", () => {
    const result = buildOrderMessage([burger()], 7200, defaultFormData, "pepón");
    expect(result).toContain("PEPÓN");
  });

  it("includes all separator lines", () => {
    const result = buildOrderMessage([burger()], 7200, defaultFormData, siteName);
    const separators = result.match(/^-{32}$/gm);
    expect(separators).toHaveLength(4);
  });
});

describe("buildQuickOrderMessage", () => {
  it("produces a shorter message without client info", () => {
    const result = buildQuickOrderMessage([burger()], 14400, siteName);
    expect(result).toContain("DETALLE:");
    expect(result).toContain("2x Burger Clasica");
    expect(result).toContain("TOTAL COMPRA:");
    expect(result).not.toContain("Cliente:");
    expect(result).not.toContain("Dirección:");
  });

  it("includes site name in header", () => {
    const result = buildQuickOrderMessage([burger()], 7200, "PEPÓN");
    expect(result).toContain("PEPÓN");
  });

  it('returns "— Sin productos —" for empty cart', () => {
    const result = buildQuickOrderMessage([], 0, siteName);
    expect(result).toContain("— Sin productos —");
  });
});
