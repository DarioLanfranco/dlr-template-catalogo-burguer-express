import { persistentJSON } from "@nanostores/persistent";
import { computed, map, type WritableAtom } from "nanostores";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

type CartMap = Record<string, CartItem>;

const STORAGE_KEY = "pepon-cart";

function cartKey(id: string, variant?: string): string {
  const normalized = variant?.trim() || "";
  return normalized ? `${id}|${normalized}` : id;
}

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const key = "__pepon_storage_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export const cartStore: WritableAtom<CartMap> = isLocalStorageAvailable()
  ? persistentJSON<CartMap>(STORAGE_KEY, {})
  : map<CartMap>({});

export const cartItems = computed(cartStore, (items) =>
  Object.values(items).filter(
    (item): item is CartItem =>
      item !== null &&
      item !== undefined &&
      typeof item.id === "string" &&
      item.id.length > 0 &&
      typeof item.name === "string" &&
      item.name.length > 0 &&
      typeof item.quantity === "number" &&
      Number.isFinite(item.quantity) &&
      item.quantity >= 1 &&
      typeof item.price === "number" &&
      Number.isFinite(item.price) &&
      item.price >= 0,
  ),
);

export const totalItems = computed(cartStore, (items) =>
  Object.values(items).reduce((sum, item) => {
    if (!item || !Number.isFinite(item.quantity) || item.quantity < 0) return sum;
    return sum + item.quantity;
  }, 0),
);

export const subtotal = computed(cartStore, (items) =>
  Object.values(items).reduce((sum, item) => {
    if (!item || !Number.isFinite(item.price) || !Number.isFinite(item.quantity)) return sum;
    return sum + item.price * item.quantity;
  }, 0),
);

export const total = subtotal;

export const isCartValid = computed(cartItems, (items) => {
  if (items.length === 0) return false;
  return items.every(
    (item) =>
      item.quantity >= 1 &&
      item.price >= 0 &&
      Number.isFinite(item.price) &&
      Number.isFinite(item.quantity),
  );
});

function writeStore(next: CartMap): boolean {
  try {
    cartStore.set(next);
    return true;
  } catch (err) {
    console.error("[cart] failed to write store:", err);
    return false;
  }
}

export function addItem(item: CartItem): boolean {
  if (!item?.id || !item?.name) {
    console.warn("[cart] addItem rejected: missing id or name", item);
    return false;
  }
  if (!Number.isFinite(item.price) || item.price < 0) {
    console.warn("[cart] addItem rejected: invalid price", item.price);
    return false;
  }

  const current = { ...cartStore.get() };
  const key = cartKey(item.id, item.variant);
  const existing = current[key];

  if (existing) {
    current[key] = { ...existing, quantity: existing.quantity + 1 };
  } else {
    current[key] = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      variant: item.variant?.trim() || undefined,
    };
  }

  return writeStore(current);
}

export function removeItem(id: string, variant?: string): boolean {
  if (!id) {
    console.warn("[cart] removeItem rejected: missing id");
    return false;
  }

  const current = { ...cartStore.get() };
  const key = cartKey(id, variant);
  const existing = current[key];

  if (!existing) return false;

  const currentQty = existing.quantity;

  if (!Number.isFinite(currentQty) || currentQty <= 0) {
    delete current[key];
    return writeStore(current);
  }

  if (currentQty > 1) {
    current[key] = { ...existing, quantity: currentQty - 1 };
  } else {
    delete current[key];
  }

  return writeStore(current);
}

export function updateQuantity(id: string, variant: string | undefined, newQuantity: number): boolean {
  if (!id) {
    console.warn("[cart] updateQuantity rejected: missing id");
    return false;
  }
  if (!Number.isFinite(newQuantity) || newQuantity < 0) {
    console.warn("[cart] updateQuantity rejected: invalid quantity", newQuantity);
    return false;
  }

  const current = { ...cartStore.get() };
  const key = cartKey(id, variant);
  const existing = current[key];

  if (!existing) return false;

  if (newQuantity === 0) {
    delete current[key];
  } else {
    current[key] = { ...existing, quantity: Math.floor(newQuantity) };
  }

  return writeStore(current);
}

export function clearCart(): boolean {
  return writeStore({});
}
