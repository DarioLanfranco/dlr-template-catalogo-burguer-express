import type { CartItem } from "../store/cart";
import { formatPrice } from "../lib/checkout";

export interface OrderFormData {
  customerName: string;
  deliveryMode: string;
  deliveryAddress: string;
  paymentMethod: string;
}

const DELIVERY_MODE_LABELS: Record<string, string> = {
  delivery: "Envío a Domicilio",
  pickup: "Retiro en Local / Take Away",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo al Cadete",
  transfer: "Transferencia / Mercado Pago",
};

function resolveDeliveryLabel(mode: string): string {
  return DELIVERY_MODE_LABELS[mode] ?? mode;
}

function resolvePaymentLabel(method: string): string {
  return PAYMENT_LABELS[method] ?? method;
}

function resolveAddress(data: OrderFormData): string {
  if (data.deliveryMode === "delivery" && data.deliveryAddress.trim()) {
    return data.deliveryAddress.trim();
  }
  return "Retiro en Local";
}

function buildItemLine(item: CartItem): string {
  const variant = item.variant ? ` (${item.variant})` : "";
  const subtotal = formatPrice(item.price * item.quantity);
  return `- ${item.quantity}x ${item.name}${variant} - ${subtotal}`;
}

const HEADER_SEPARATOR = "--------------------------------";

function buildHeader(siteName: string): string {
  return `🍔 *NUEVO PEDIDO DE ${siteName.toUpperCase()}* 🍔`;
}

function buildDetailsBlock(items: CartItem[]): string {
  const validItems = items.filter(
    (item) =>
      item &&
      item.name &&
      Number.isFinite(item.price) &&
      Number.isFinite(item.quantity) &&
      item.quantity > 0,
  );

  if (validItems.length === 0) return "— Sin productos —";

  return validItems.map(buildItemLine).join("\n");
}

function buildClientBlock(data: OrderFormData): string {
  return [
    `👤 *Cliente:* ${data.customerName.trim()}`,
    `🛵 *Modo:* ${resolveDeliveryLabel(data.deliveryMode)}`,
    `📍 *Dirección:* ${resolveAddress(data)}`,
    `💳 *Pago:* ${resolvePaymentLabel(data.paymentMethod)}`,
  ].join("\n");
}

function buildTotalLine(total: number): string {
  return `💰 *TOTAL COMPRA:* ${formatPrice(total)}`;
}

export function buildOrderMessage(
  items: CartItem[],
  total: number,
  data: OrderFormData,
  siteName: string,
): string {
  return [
    buildHeader(siteName),
    HEADER_SEPARATOR,
    buildClientBlock(data),
    HEADER_SEPARATOR,
    "🛒 *DETALLE:*",
    buildDetailsBlock(items),
    HEADER_SEPARATOR,
    buildTotalLine(total),
    HEADER_SEPARATOR,
    "⚡ _Pedido enviado vía Pepón App_",
  ].join("\n");
}

export function getWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "");
  return `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(message)}`;
}

export function buildQuickOrderMessage(
  items: CartItem[],
  total: number,
  siteName: string,
): string {
  return [
    buildHeader(siteName),
    HEADER_SEPARATOR,
    "🛒 *DETALLE:*",
    buildDetailsBlock(items),
    HEADER_SEPARATOR,
    buildTotalLine(total),
    HEADER_SEPARATOR,
    "⚡ _Pedido enviado vía Pepón App_",
  ].join("\n");
}
