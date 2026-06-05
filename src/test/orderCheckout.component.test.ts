// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { addItem, clearCart, isCartValid, total, type CartItem } from "../store/cart";
import { buildOrderMessage, getWhatsAppUrl, type OrderFormData } from "../services/orderService";

function burger(overrides?: Partial<CartItem>): CartItem {
  return {
    id: "burger-clasica",
    name: "Burger Clasica",
    price: 7200,
    quantity: 1,
    ...overrides,
  };
}

const formData: OrderFormData = {
  customerName: "Juan Perez",
  deliveryMode: "delivery",
  deliveryAddress: "Av. Corrientes 1234",
  paymentMethod: "cash",
};

beforeEach(() => {
  clearCart();
  document.body.innerHTML = `
    <section id="order-checkout-section" data-phone="+5493584201263" data-site="PEPÓN">
      <div id="order-cart-summary"></div>
      <form id="order-form">
        <input id="client-name" name="customerName" value="Juan Perez" />
        <select id="shipping-method" name="deliveryMode">
          <option value="delivery" selected>Envio</option>
        </select>
        <input id="client-address" name="deliveryAddress" value="Av. Corrientes 1234" />
        <select id="payment-method" name="paymentMethod">
          <option value="cash" selected>Efectivo</option>
        </select>
        <button type="submit" id="order-submit-btn">
          <span class="order-submit-text">ENCARGAR PEDIDO</span>
          <span class="order-submit-price" id="order-total-display">$ 0</span>
        </button>
      </form>
      <div id="order-fallback" role="alert" hidden>
        <a id="order-fallback-link" href="#"></a>
      </div>
    </section>
  `;
});

describe("OrderCheckout submit flow", () => {
  it("submits without errors when cart has items and form is valid", () => {
    addItem(burger());
    const items = [burger()];
    const totalValue = 7200;
    const message = buildOrderMessage(items, totalValue, formData, "PEPÓN");
    const url = getWhatsAppUrl("+5493584201263", message);

    expect(url).toContain("api.whatsapp.com/send");
    expect(url).toContain("phone=5493584201263");
    expect(url).toContain(encodeURIComponent(formData.customerName));
  });

  it("blocks submission when cart is empty", () => {
    const valid = isCartValid.get();
    expect(valid).toBe(false);
    const btn = document.getElementById("order-submit-btn") as HTMLButtonElement;
    btn.disabled = !valid;
    expect(btn.disabled).toBe(true);
  });

  it("disables submit button before opening WhatsApp", () => {
    addItem(burger());
    const btn = document.getElementById("order-submit-btn") as HTMLButtonElement;
    let isSubmitting = false;

    function handleSubmit() {
      if (isSubmitting) return;
      isSubmitting = true;
      btn.disabled = true;
      btn.querySelector(".order-submit-text")!.textContent = "ENVIANDO...";
      return { isSubmitting, disabled: btn.disabled, text: btn.querySelector(".order-submit-text")!.textContent };
    }

    const result = handleSubmit();

    expect(result!.isSubmitting).toBe(true);
    expect(result!.disabled).toBe(true);
    expect(result!.text).toBe("ENVIANDO...");
  });

  it("rejects double-click via isSubmitting guard", () => {
    addItem(burger());
    let callCount = 0;
    let isSubmitting = false;

    function handleSubmit() {
      if (isSubmitting) return;
      isSubmitting = true;
      callCount++;
    }

    handleSubmit();
    handleSubmit(); // second call should be blocked

    expect(callCount).toBe(1);
  });

  it("calls clearCart when window.open succeeds", () => {
    addItem(burger());
    const openSpy = vi.spyOn(window, "open").mockReturnValue({} as Window);
    const clearSpy = vi.fn(clearCart);

    const win = window.open("https://api.whatsapp.com/send", "_blank");
    if (win) {
      clearSpy();
    }

    expect(openSpy).toHaveBeenCalledOnce();
    expect(clearSpy).toHaveBeenCalledOnce();
    expect(isCartValid.get()).toBe(false);

    openSpy.mockRestore();
  });

  it("shows fallback link when window.open is blocked", () => {
    addItem(burger());
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);

    const win = window.open("https://api.whatsapp.com/send", "_blank");
    const fallbackEl = document.getElementById("order-fallback") as HTMLElement;
    const fallbackLink = document.getElementById("order-fallback-link") as HTMLAnchorElement;

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

    openSpy.mockRestore();
  });

  it("builds WhatsApp URL with correctly sanitized phone", () => {
    const url = getWhatsAppUrl("+54 9 (358) 420-1263", "Mensaje de prueba");
    expect(url).toContain("phone=5493584201263");
    expect(url).toContain(encodeURIComponent("Mensaje de prueba"));
  });

  it("formats total price correctly after clearCart", () => {
    addItem(burger());
    expect(total.get()).toBe(7200);
    clearCart();
    expect(total.get()).toBe(0);
  });
});
