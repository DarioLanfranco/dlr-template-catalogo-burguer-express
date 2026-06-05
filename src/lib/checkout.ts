export function formatPrice(price: number): string {
  if (!Number.isFinite(price) || price < 0) return "$ 0";
  return "$ " + price.toLocaleString("es-AR");
}
