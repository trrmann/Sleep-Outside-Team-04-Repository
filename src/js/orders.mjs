import { renderListWithTemplate } from "./utils.mjs";
import { debugLog, debugAPIResponse } from "./debug.mjs";

function orderCardTemplate(order) {
  const orderDate = new Date(order.orderDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemCount = order.items?.length ?? 0;
  const total = Number(order.orderTotal ?? 0).toFixed(2);

  const itemsList = order.items
    ?.map(
      (item) => `
        <li class="order-item">
          <span class="order-item__name">${item.name}</span>
          <span class="order-item__qty">Qty: ${item.quantity}</span>
          <span class="order-item__price">$${Number(item.price ?? 0).toFixed(2)}</span>
        </li>
      `
    )
    .join("") ?? "";

  return `
    <li class="order-card divider">
      <div class="order-card__header">
        <h3 class="order-card__number">Order #${order.id}</h3>
        <span class="order-card__date">${orderDate}</span>
      </div>
      <div class="order-card__details">
        <p class="order-card__customer">
          <strong>Customer:</strong> ${order.fname} ${order.lname}
        </p>
        <p class="order-card__email">
          <strong>Email:</strong> ${order.email}
        </p>
        <p class="order-card__items-count">
          <strong>Items:</strong> ${itemCount}
        </p>
      </div>
      <div class="order-card__items">
        <h4>Order Items:</h4>
        <ul class="order-items-list">
          ${itemsList}
        </ul>
      </div>
      <div class="order-card__footer">
        <p class="order-card__total">
          <strong>Total:</strong> $${total}
        </p>
      </div>
    </li>
  `;
}

export default class OrderList {
  constructor(dataSource, listElement) {
    this.dataSource = dataSource;
    this.listElement = listElement; // selector string, e.g. ".order-list"
    this.orders = [];
  }

  async init(token) {
    debugLog("ORDERS", "📡 Fetching orders from API", {
      hasToken: !!token,
      tokenLength: token?.length,
    });

    try {
      this.orders = await this.dataSource.getOrders(token);
      
      debugLog("ORDERS", "✅ Orders fetched successfully", {
        count: this.orders?.length || 0,
        orders: this.orders,
      });
      
      this.renderList();
    } catch (error) {
      console.error("Failed to load orders:", error);
      
      debugLog("ORDERS", "❌ Failed to fetch orders", {
        error: error.message,
        status: error.message?.status,
        fullError: error,
      });
      
      this.renderError(error);
    }
  }

  renderList(orders = this.orders) {
    const parent = document.querySelector(this.listElement);
    if (!parent) return;

    const safeOrders = Array.isArray(orders) ? orders : [];

    if (safeOrders.length === 0) {
      parent.innerHTML = '<p class="no-orders">No orders found.</p>';
      return;
    }

    renderListWithTemplate(
      orderCardTemplate,
      parent,
      safeOrders,
      "afterbegin",
      true
    );
  }

  renderError(error) {
    const parent = document.querySelector(this.listElement);
    if (!parent) return;

    const message =
      error?.message?.message || error?.message || "Failed to load orders";
    
    // Check for 401 Unauthorized
    const is401 = error?.message?.status === 401 || message.includes("401") || message.includes("Unauthorized");
    
    if (is401) {
      debugLog("ORDERS", "🔒 401 Unauthorized - Token may be invalid or expired");
      parent.innerHTML = `
        <div class="error-message">
          <p><strong>⚠️ Unauthorized Access</strong></p>
          <p>Your login session may have expired or your token is invalid.</p>
          <p><a href="/login/" class="button">Login Again</a></p>
        </div>
      `;
    } else {
      parent.innerHTML = `<p class="error-message">Error: ${message}</p>`;
    }
  }
}
