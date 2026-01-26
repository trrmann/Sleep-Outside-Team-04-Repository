// src/js/ctaRegister.mjs

const STORAGE_KEY = "so-register-cta-seen-v1";

export default function initRegisterCta({
  registerUrl = "/register/index.html",
  delayMs = 700,
} = {}) {
  // Only show the first time
  const seen = localStorage.getItem(STORAGE_KEY);
  if (seen) return;

  // Inject modal markup once
  if (!document.querySelector("#registerCtaModal")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div id="registerCtaModal" class="cta-modal hidden" role="dialog" aria-modal="true" aria-labelledby="ctaTitle">
        <div class="cta-backdrop" data-cta-close="true"></div>

        <div class="cta-panel" role="document">
          <button class="cta-close" type="button" aria-label="Close" data-cta-close="true">✕</button>

          <div class="cta-content">
            <p class="cta-badge">Giveaway</p>
            <h2 id="ctaTitle" class="cta-title">Register & Win Outdoor Gear</h2>

            <p class="cta-text">
              Create a free account to enter our giveaway and get early access to new deals.
            </p>

            <ul class="cta-list">
              <li>Monthly draw for backpacks, tents, and accessories</li>
              <li>Members-only discount alerts</li>
              <li>Faster checkout and saved cart</li>
            </ul>

            <div class="cta-actions">
              <a class="cta-primary" href="${registerUrl}">Register Now</a>
              <button class="cta-secondary" type="button" data-cta-close="true">Not now</button>
            </div>

            <p class="cta-footnote">
              By registering, you agree to receive occasional product updates. You can unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
      `
    );
  }

  const modal = document.querySelector("#registerCtaModal");
  if (!modal) return;

  // Show with a small delay (better UX)
  setTimeout(() => openModal(modal), delayMs);

  // Close handlers
  modal.addEventListener("click", (e) => {
    if (e.target?.dataset?.ctaClose === "true") {
      closeModal(modal);
      markSeen();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal(modal);
      markSeen();
    }
  });

  // If user clicks Register, mark as seen too
  modal.querySelector(".cta-primary")?.addEventListener("click", () => {
    markSeen();
  });
}

function openModal(modal) {
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeModal(modal) {
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function markSeen() {
  localStorage.setItem(STORAGE_KEY, "true");
}
