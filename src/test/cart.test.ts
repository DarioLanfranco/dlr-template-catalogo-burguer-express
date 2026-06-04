import { describe, it, expect, beforeEach } from "vitest";
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  cartItems,
  totalItems,
  subtotal,
  total,
  isCartValid,
  cartStore,
  type CartItem,
} from "../store/cart";

function burger(overrides?: Partial<CartItem>): CartItem {
  return {
    id: "burger-clasica",
    name: "Burger Clasica",
    price: 7200,
    quantity: 1,
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

beforeEach(() => {
  clearCart();
});

describe("addItem", () => {
  it("adds a new item", () => {
    const ok = addItem(burger());
    expect(ok).toBe(true);
    expect(cartItems.get()).toHaveLength(1);
    expect(cartItems.get()[0].quantity).toBe(1);
  });

  it("increments quantity when same item is added again", () => {
    addItem(burger());
    addItem(burger());
    expect(cartItems.get()).toHaveLength(1);
    expect(cartItems.get()[0].quantity).toBe(2);
  });

  it("treats items with different variants as separate entries", () => {
    addItem(burger());
    addItem(burger({ variant: "con cheddar" }));
    expect(cartItems.get()).toHaveLength(2);
  });

  it("treats items with same id and same variant as the same entry", () => {
    addItem(burger({ variant: "con cheddar" }));
    addItem(burger({ variant: "con cheddar" }));
    expect(cartItems.get()).toHaveLength(1);
    expect(cartItems.get()[0].quantity).toBe(2);
  });

  it("rejects item without id", () => {
    const ok = addItem(burger({ id: "" }));
    expect(ok).toBe(false);
    expect(cartItems.get()).toHaveLength(0);
  });

  it("rejects item without name", () => {
    const ok = addItem(burger({ name: "" }));
    expect(ok).toBe(false);
    expect(cartItems.get()).toHaveLength(0);
  });

  it("rejects item with negative price", () => {
    const ok = addItem(burger({ price: -1 }));
    expect(ok).toBe(false);
    expect(cartItems.get()).toHaveLength(0);
  });

  it("rejects item with NaN price", () => {
    const ok = addItem(burger({ price: NaN }));
    expect(ok).toBe(false);
    expect(cartItems.get()).toHaveLength(0);
  });
});

describe("removeItem", () => {
  it("decrements quantity", () => {
    addItem(burger());
    addItem(burger());
    const ok = removeItem("burger-clasica");
    expect(ok).toBe(true);
    expect(cartItems.get()[0].quantity).toBe(1);
  });

  it("removes item when quantity reaches 0", () => {
    addItem(burger());
    removeItem("burger-clasica");
    expect(cartItems.get()).toHaveLength(0);
  });

  it("removes correct variant when multiple variants exist", () => {
    addItem(burger());
    addItem(burger({ variant: "con cheddar" }));
    removeItem("burger-clasica", "con cheddar");
    const items = cartItems.get();
    expect(items).toHaveLength(1);
    expect(items[0].variant).toBeUndefined();
  });

  it("returns false when item does not exist", () => {
    const ok = removeItem("nonexistent");
    expect(ok).toBe(false);
  });

  it("returns false when id is empty", () => {
    const ok = removeItem("");
    expect(ok).toBe(false);
  });
});

describe("updateQuantity", () => {
  it("sets exact quantity", () => {
    addItem(burger());
    updateQuantity("burger-clasica", undefined, 5);
    expect(cartItems.get()[0].quantity).toBe(5);
  });

  it("removes item when quantity is 0", () => {
    addItem(burger());
    updateQuantity("burger-clasica", undefined, 0);
    expect(cartItems.get()).toHaveLength(0);
  });

  it("rejects negative quantity", () => {
    addItem(burger());
    updateQuantity("burger-clasica", undefined, -3);
    expect(cartItems.get()[0].quantity).toBe(1);
  });

  it("rejects NaN quantity", () => {
    addItem(burger());
    updateQuantity("burger-clasica", undefined, NaN);
    expect(cartItems.get()[0].quantity).toBe(1);
  });

  it("floors fractional quantity", () => {
    addItem(burger());
    updateQuantity("burger-clasica", undefined, 3.7);
    expect(cartItems.get()[0].quantity).toBe(3);
  });

  it("returns false for nonexistent item", () => {
    const ok = updateQuantity("ghost", undefined, 2);
    expect(ok).toBe(false);
  });
});

describe("clearCart", () => {
  it("removes all items", () => {
    addItem(burger());
    addItem(pizza());
    const ok = clearCart();
    expect(ok).toBe(true);
    expect(cartItems.get()).toHaveLength(0);
    expect(totalItems.get()).toBe(0);
    expect(subtotal.get()).toBe(0);
  });
});

describe("computed stores", () => {
  it("totalItems sums all quantities", () => {
    addItem(burger());
    addItem(burger());
    addItem(pizza());
    expect(totalItems.get()).toBe(3);
  });

  it("subtotal sums price * quantity", () => {
    addItem(burger());
    addItem(burger());
    addItem(pizza());
    expect(subtotal.get()).toBe(7200 * 2 + 8500);
  });

  it("total equals subtotal", () => {
    addItem(burger());
    expect(total.get()).toBe(subtotal.get());
  });

  it("isCartValid is false with empty cart", () => {
    expect(isCartValid.get()).toBe(false);
  });

  it("isCartValid is true with valid items", () => {
    addItem(burger());
    expect(isCartValid.get()).toBe(true);
  });

  it("cartItems filters out items with invalid quantity (0)", () => {
    addItem(burger());
    cartStore.set({
      ...cartStore.get(),
      corrupt: { id: "corrupt", name: "Corrupt", price: 100, quantity: 0 },
    });
    expect(cartItems.get()).toHaveLength(1);
    expect(cartItems.get()[0].id).toBe("burger-clasica");
  });

  it("cartItems filters out items with NaN price", () => {
    addItem(burger());
    cartStore.set({
      ...cartStore.get(),
      broken: { id: "broken", name: "Broken", price: NaN, quantity: 1 },
    });
    expect(cartItems.get()).toHaveLength(1);
  });

  it("cartItems filters out items with negative quantity", () => {
    addItem(burger());
    cartStore.set({
      ...cartStore.get(),
      neg: { id: "neg", name: "Negative", price: 100, quantity: -5 },
    });
    expect(cartItems.get()).toHaveLength(1);
  });

  it("isCartValid is false when any item has invalid quantity", () => {
    addItem(burger());
    updateQuantity("burger-clasica", undefined, 0);
    expect(cartItems.get()).toHaveLength(0);
    expect(isCartValid.get()).toBe(false);
  });
});
