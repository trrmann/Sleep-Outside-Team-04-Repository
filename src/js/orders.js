import { loadHeaderFooter } from "./utils.mjs";
import { getToken, clearToken, isLoggedIn, isEmployee } from "./Auth.mjs";
import ExternalServices from "./ExternalServices.mjs";
import OrderList from "./orders.mjs";
import { debugLog, debugToken, showDevBanner } from "./debug.mjs";

debugLog("ORDERS", "🔍 Orders page loading");
showDevBanner();

// Check authentication before loading page
if (!isLoggedIn()) {
  debugLog("ORDERS", "❌ User not logged in - redirecting to login");
  window.location.href = "/login/";
}

const token = getToken();
debugLog("ORDERS", "✅ User is logged in");
debugToken(token, "Current User Token");

// Initialize page
loadHeaderFooter();

const employeeStatus = isEmployee();
debugLog("ORDERS", `👤 Employee status: ${employeeStatus ? "YES" : "NO"}`);

// Check if token is a mock token (for dev testing)
const isMockToken = token && token.includes("mock_signature_for_dev_testing");

// Check if user is an employee
if (!employeeStatus) {
  // Non-employee users can only see their own orders
  debugLog("ORDERS", "ℹ️ Non-employee user - showing limited access message");
  const orderList = document.querySelector(".order-list");
  if (orderList) {
    if (isMockToken) {
      debugLog(
        "ORDERS",
        "🎭 Mock token detected - displaying mock customer orders",
      );
      orderList.innerHTML = `
        <div class="info-message" style="background: #d1ecf1; border: 2px solid #0c5460; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
          <strong>🎭 Mock Customer Data</strong><br>
          Displaying your sample order history for UI testing.
        </div>
        <div class="order-card">
          <h3>Your Order #12346</h3>
          <p class="order-date">January 28, 2026</p>
          <div class="customer-info">
            <p><strong>Shipped to:</strong> 789 Pine St, Denver, CO 80202</p>
          </div>
          <div class="order-items">
            <h4>Items:</h4>
            <ul>
              <li>Trail Runner Backpack - $89.99 × 1</li>
              <li>Water Bottle - $24.99 × 2</li>
            </ul>
          </div>
          <p class="order-total"><strong>Total:</strong> $139.97</p>
          <p class="order-status"><strong>Status:</strong> Delivered</p>
        </div>
        <div class="order-card">
          <h3>Your Order #12340</h3>
          <p class="order-date">January 15, 2026</p>
          <div class="customer-info">
            <p><strong>Shipped to:</strong> 789 Pine St, Denver, CO 80202</p>
          </div>
          <div class="order-items">
            <h4>Items:</h4>
            <ul>
              <li>Camping Stove - $59.99 × 1</li>
            </ul>
          </div>
          <p class="order-total"><strong>Total:</strong> $59.99</p>
          <p class="order-status"><strong>Status:</strong> Delivered</p>
        </div>
      `;
    } else {
      orderList.innerHTML =
        '<p class="info-message">You can view your order history here. Currently showing your orders only.</p>';
    }
  }
  // You could still load their orders here if the backend supports filtering by user
  // For now, we'll just show the message
} else {
  // Employee - load all orders
  debugLog("ORDERS", "👨‍💼 Employee user - fetching all orders");

  if (isMockToken) {
    debugLog("ORDERS", "🎭 Mock token detected - displaying mock order data");
    const orderList = document.querySelector(".order-list");
    if (orderList) {
      orderList.innerHTML = `
        <div class="info-message" style="background: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
          <strong>🎭 Mock Data Mode</strong><br>
          Displaying sample orders for UI testing. Real orders require backend authentication.
        </div>
        <div class="order-card">
          <h3>Order #12346</h3>
          <p class="order-date">January 28, 2026</p>
          <div class="customer-info">
            <p><strong>Customer:</strong> customer@example.com</p>
            <p><strong>Email:</strong> customer@example.com</p>
            <p><strong>Address:</strong> 789 Pine St, Denver, CO 80202</p>
          </div>
          <div class="order-items">
            <h4>Items:</h4>
            <ul>
              <li>Trail Runner Backpack - $89.99 × 1</li>
              <li>Water Bottle - $24.99 × 2</li>
            </ul>
          </div>
          <p class="order-total"><strong>Total:</strong> $139.97</p>
          <p class="order-status"><strong>Status:</strong> Delivered</p>
        </div>
        <div class="order-card">
          <h3>Order #12345</h3>
          <p class="order-date">January 30, 2026</p>
          <div class="customer-info">
            <p><strong>Customer:</strong> John Doe</p>
            <p><strong>Email:</strong> john@example.com</p>
            <p><strong>Address:</strong> 123 Main St, Portland, OR 97201</p>
          </div>
          <div class="order-items">
            <h4>Items:</h4>
            <ul>
              <li>Marmot Catalyst 2P Tent - $199.99 × 1</li>
              <li>Alpine Sleeping Bag - $149.99 × 2</li>
            </ul>
          </div>
          <p class="order-total"><strong>Total:</strong> $499.97</p>
          <p class="order-status"><strong>Status:</strong> Processing</p>
        </div>
        <div class="order-card">
          <h3>Order #12344</h3>
          <p class="order-date">January 29, 2026</p>
          <div class="customer-info">
            <p><strong>Customer:</strong> Jane Smith</p>
            <p><strong>Email:</strong> jane@example.com</p>
            <p><strong>Address:</strong> 456 Oak Ave, Seattle, WA 98101</p>
          </div>
          <div class="order-items">
            <h4>Items:</h4>
            <ul>
              <li>Expedition Backpack - $179.99 × 1</li>
            </ul>
          </div>
          <p class="order-total"><strong>Total:</strong> $179.99</p>
          <p class="order-status"><strong>Status:</strong> Shipped</p>
        </div>
        <div class="order-card">
          <h3>Order #12340</h3>
          <p class="order-date">January 15, 2026</p>
          <div class="customer-info">
            <p><strong>Customer:</strong> customer@example.com</p>
            <p><strong>Email:</strong> customer@example.com</p>
            <p><strong>Address:</strong> 789 Pine St, Denver, CO 80202</p>
          </div>
          <div class="order-items">
            <h4>Items:</h4>
            <ul>
              <li>Camping Stove - $59.99 × 1</li>
            </ul>
          </div>
          <p class="order-total"><strong>Total:</strong> $59.99</p>
          <p class="order-status"><strong>Status:</strong> Delivered</p>
        </div>
      `;
    }
  } else {
    const dataSource = new ExternalServices();
    const orderList = new OrderList(dataSource, ".order-list");

    // Load orders with token
    if (token) {
      debugLog("ORDERS", "🔄 Initializing order list with token");
      orderList.init(token);
    } else {
      debugLog("ORDERS", "⚠️ No token available - cannot fetch orders");
    }
  }
}

// Setup logout button
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearToken();
    window.location.href = "/login/";
  });
}
