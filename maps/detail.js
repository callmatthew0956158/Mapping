// Station detail panel: fills <section id="detail"> when a map pin or a table "View" button is clicked
(function () {
  "use strict";
  const el = document.getElementById("detail");
  if (!el) return;

  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (v) => (v == null ? "—" : "₱" + Number(v).toFixed(2));

  const SERVICES = [
    ["store", "🏪", "Convenience Store"],
    ["mechanic", "🔧", "Mechanic Shop"],
    ["airwater", "💨", "Air / Water"]
  ];
  const FUELS = [["g91", "Gasoline 91", "green"], ["g95", "Gasoline 95", "red"], ["d", "Diesel", "yellow"]];

  function render(s) {
    const open = /24/.test(s.hours || "");
    el.innerHTML = `
      <div class="sd-head">
        <span class="sd-logo">${s.logo
          ? `<img src="${esc(s.logo)}" alt="" onerror="this.remove()">` : ""}${esc((s.name || "?")[0])}</span>
        <div class="sd-id">
          <h2>${esc(s.name)}</h2>
          <p>📍 ${esc(s.address || s.city)}</p>
        </div>
        <div class="sd-hours">${open ? '<span class="sd-open">● OPEN</span>' : ""}
          <small>${esc(s.hours || "")}</small></div>
      </div>

      <div class="sd-photo">${s.image
        ? `<img src="${esc(s.image)}" alt="" onerror="this.remove()">` : "<span>⛽</span>"}</div>

      <h3>Services Available</h3>
      <div class="sd-svc">${SERVICES.map(([k, ic, label]) => `
        <div class="${s[k] ? "" : "off"}"><b>${ic}</b>${label}
          <small>${s[k] ? "✔ Available" : "Not available"}</small></div>`).join("")}
      </div>

      <h3>Fuel Prices</h3>
      <div class="sd-fuel">${FUELS.map(([k, label, c]) => `
        <div><span class="${c}">${label}</span><b>${money(s[k])}</b></div>`).join("")}
      </div>

      ${s.lat != null ? `<a class="sd-go" target="_blank" rel="noopener"
         href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}">➤ Get Directions <em>›</em></a>` : ""}`;
  }

  el.innerHTML = '<p class="sd-hint">Click a pin on the map to see the station details.</p>';
  document.addEventListener("station:select", (e) => render(e.detail.station));
})();
