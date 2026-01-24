import { getLocalStorage, formDataToJSON } from "./utils.mjs";

function getQty(item) {
  const raw = item?.quantity ?? item?.Quantity ?? 1;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default class CheckoutProcess {
  constructor(key, outputSelector, services) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.services = services;

    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSubTotal();
  }

  calculateItemSubTotal() {
    this.itemTotal = this.list.reduce((sum, item) => {
      const price = Number(item?.FinalPrice ?? item?.price ?? 0);
      return sum + price * getQty(item);
    }, 0);

    const subEl = document.querySelector(`${this.outputSelector} #subtotal`);
    if (subEl) subEl.innerText = `$${this.itemTotal.toFixed(2)}`;
  }

  calculateOrderTotal() {
    // Tax: 6%
    this.tax = this.itemTotal * 0.06;

    // Shipping: $10 first item + $2 each additional (by total quantity)
    const totalQty = this.list.reduce((sum, item) => sum + getQty(item), 0);
    if (totalQty <= 0) {
      this.shipping = 0;
    } else {
      this.shipping = 10 + Math.max(0, totalQty - 1) * 2;
    }

    this.orderTotal = this.itemTotal + this.tax + this.shipping;
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const taxEl = document.querySelector(`${this.outputSelector} #tax`);
    const shipEl = document.querySelector(`${this.outputSelector} #shipping`);
    const totalEl = document.querySelector(`${this.outputSelector} #orderTotal`);

    if (taxEl) taxEl.innerText = `$${this.tax.toFixed(2)}`;
    if (shipEl) shipEl.innerText = `$${this.shipping.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `$${this.orderTotal.toFixed(2)}`;
  }

  packageItems(items) {
    return items.map((item) => ({
      id: item.Id,
      name: item.Name,
      price: Number(item?.FinalPrice ?? 0),
      quantity: getQty(item),
    }));
  }

  async checkout(formElement) {
    const order = formDataToJSON(formElement);

    order.orderDate = new Date().toISOString();
    order.items = this.packageItems(this.list);

    order.orderTotal = this.orderTotal.toFixed(2);
    order.tax = this.tax.toFixed(2);
    order.shipping = this.shipping;

    return await this.services.checkout(order);
  }
}
