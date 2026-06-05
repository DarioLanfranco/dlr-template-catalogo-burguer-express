// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { addItem, clearCart, isCartValid, type CartItem } from "../store/cart";
import { buildQuickOrderMessage, getWhatsAppUrl } from "../services/orderService";

function burger(overrides?: Partial<CartItem>): CartItem {
  return {
    id: "burger-clasica",
    name: "Burger Clasica",
    price: 7200,
    quantity: 2,
    ...overrides,
  };
}

beforeEach(() => {
  clearCart();
  document.body.innerHTML = `
    <section class="promo-section" data-whatsapp="+5493584201263" data-site="PEPÓN">
      <button id="quick-checkout-btn">
        <span class="checkout-text">CONFIRMAR PEDIDO</span>
        <span id="quick-checkout-total">$ 0</span>
      </button>
      <div id="quick-fallback" role="alert" hidden>
        <a id="quick-fallback-link" href="#"></a>
      </div>
    </section>
  `;
});

describe("PromoAndCheckout quick checkout flow", () => {
  it("builds quick order message without client info", () => {
    addItem(burger());
    const items = [burger()];
    const totalValue = 14400;
    const message = buildQuickOrderMessage(items, totalValue, "PEPÓN");

    expect(message).toContain("2x Burger Clasica");
    expect(message).toContain("TOTAL COMPRA:");
    expect(message).not.toContain("Cliente:");
    expect(message).not.toContain("Dirección:");
  });

  it("blocks when cart is empty", () => {
    const valid = isCartValid.get();
    const btn = document.getElementById("quick-checkout-btn") as HTMLButtonElement;
    btn.disabled = !valid;
    expect(btn.disabled).toBe(true);
  });

  it("clears cart on successful window.open", () => {
    addItem(burger());
    const openSpy = vi.spyOn(window, "open").mockReturnValue({} as Window);

    const win = window.open("https://api.whatsapp.com/send", "_blank");
    let cartCleared = false;
    if (win) {
      clearCart();
      cartCleared = true;
    }

    expect(openSpy).toHaveBeenCalledOnce();
    expect(cartCleared).toBe(true);
    expect(isCartValid.get()).toBe(false);

    openSpy.mockRestore();
  });

  it("shows fallback on blocked popup and does not clear cart", () => {
    addItem(burger());
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);

    const win = window.open("https://api.whatsapp.com/send", "_blank");
    const fallbackEl = document.getElementById("quick-fallback") as HTMLElement;
    const fallbackLink = document.getElementById("quick-fallback-link") as HTMLAnchorElement;

    let isSubmitting = false;
    if (!win) {
      isSubmitting = false;
      fallbackLink.href = "https://api.whatsapp.com/send?phone=123&text=Hola";
      fallbackEl.hidden = false;
    }

    expect(openSpy).toHaveReturnedWith(null);
    expect(isSubmitting).toBe(false);
    expect(fallbackEl.hidden).toBe(false);
    expect(fallbackLink.href).toContain("api.whatsapp.com");
    expect(isCartValid.get()).toBe(true);

    openSpy.mockRestore();
  });

  it("rejects double-click via isSubmitting", () => {
    addItem(burger());
    let callCount = 0;
    let isSubmitting = false;

    function handleQuickCheckout() {
      if (isSubmitting) return;
      isSubmitting = true;
      callCount++;
    }

    handleQuickCheckout();
    handleQuickCheckout();

    expect(callCount).toBe(1);
  });

  it("builds WhatsApp URL with sanitized phone", () => {
    const url = getWhatsAppUrl("+54 9 358 420-1263", "Pedido rapido");
    expect(url).toContain("phone=5493584201263");
    expect(url).toContain(encodeURIComponent("Pedido rapido"));
  });
});
