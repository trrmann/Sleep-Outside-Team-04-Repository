export default class Alert {
  constructor(url = "/alerts.json") {
    this.url = url;
  }

  async init() {
    try {
      const res = await fetch(this.url);
      if (!res.ok) return;

      const alerts = await res.json();
      if (!Array.isArray(alerts) || alerts.length === 0) return;

      const section = document.createElement("section");
      section.classList.add("alert-list");

      alerts.forEach((alert) => {
        const p = document.createElement("p");
        p.textContent = alert.message ?? "";
        if (alert.background) p.style.background = alert.background;
        if (alert.color) p.style.color = alert.color;
        section.appendChild(p);
      });

      const main = document.querySelector("main");
      if (main) main.prepend(section);
    } catch (err) {
      // Fail silently: alerts are optional UI
    }
  }
}
