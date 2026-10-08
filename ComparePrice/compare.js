// Compare Prices: pick up to 3 stations and see them side by side
(function () {
  "use strict";

  const STATIONS_URL = "database/stations.php"; // path is relative to compare.html
  const SLOTS = 3;
  const FUELS = [["g91", "Gasoline 91"], ["g95", "Gasoline 95"], ["d", "Diesel"]];
  const SERVICES = [["store", "Convenience store"], ["mechanic", "Mechanic shop"], ["airwater", "Air / water"]];

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (v) => (v == null ? "—" : "₱" + Number(v).toFixed(2));

  let stations = [];
  let picks = Array(SLOTS).fill(""); // station ids as strings, "" = empty slot

  // Fill the three dropdowns (a station chosen in one slot is disabled in the others)
  function fillSelects() {
    for (let i = 0; i < SLOTS; i++) {
      const sel = $("pick" + i);
      const others = picks.filter((p, j) => j !== i && p);
      sel.innerHTML = '<option value="">Choose a station</option>' + stations.map((s) =>
        `<option value="${esc(s.id)}"${others.includes(String(s.id)) ? " disabled" : ""}>${esc(s.name)}${s.city ? " - " + esc(s.city) : ""}</option>`
      ).join("");
      sel.value = picks[i];
    }
  }

  const chosen = () => picks.map((id) => (id ? stations.find((s) => String(s.id) === id) || null : null));
  const cell = (html, cls) => `<div class="cmp-cell${cls ? " " + cls : ""}">${html}</div>`;
  const row = (label, cells) =>
    `<div class="cmp-grid cmp-row"><div class="cmp-lab">${label}</div>${cells.join("")}</div>`;

  function render() {
    const body = $("cmpBody");
    const sel = chosen();
    if (sel.filter(Boolean).length < 2) {
      body.innerHTML = '<p class="cmp-empty">Choose at least two stations to compare.</p>';
      return;
    }

    let html = "";

    // Fuel prices: the lowest price in each row is highlighted
    FUELS.forEach(([key, label]) => {
      const vals = sel.map((s) => (s ? s[key] : null));
      const valid = vals.filter((v) => v != null);
      const min = valid.length >= 2 ? Math.min(...valid) : null;
      html += row(label, vals.map((v) => v != null && v === min
        ? cell(`${money(v)}<small>Cheapest</small>`, "best")
        : cell(money(v))));
    });

    html += '<div class="cmp-sep"></div>';

    html += row("Hours", sel.map((s) => cell(s ? esc(s.hours || "—") : "—", "plain")));
    SERVICES.forEach(([key, label]) => {
      html += row(label, sel.map((s) => cell(!s ? "—"
        : s[key] ? '<span class="cmp-yes">✔ Available</span>' : '<span class="cmp-no">Not available</span>', "plain")));
    });
    html += row("Updated", sel.map((s) => cell(s ? esc(s.updated || "—") : "—", "plain")));
    html += row("Directions", sel.map((s) => cell(s && s.lat != null
      ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" target="_blank" rel="noopener">Get directions</a>`
      : "—", "plain")));

    body.innerHTML = html;
  }

  function load() {
    return fetch(STATIONS_URL, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then((d) => {
        if (!Array.isArray(d)) throw new Error((d && d.error) || "Bad response");
        stations = d;

        // Keep earlier choices that still exist; on the first load start with the 3 cheapest Gas 91 stations
        picks = picks.map((id) => (stations.some((s) => String(s.id) === id) ? id : ""));
        if (!picks.some(Boolean)) {
          picks = stations.filter((s) => s.g91 != null)
            .sort((a, b) => a.g91 - b.g91).slice(0, SLOTS).map((s) => String(s.id));
          while (picks.length < SLOTS) picks.push("");
        }
        fillSelects();
        render();
      })
      .catch((err) => {
        if (!stations.length) {
          $("cmpBody").innerHTML = `<p class="cmp-empty cmp-bad">Couldn't load ${esc(STATIONS_URL)} (${esc(err.message)}).
            Check that Apache and MySQL are running and that STATIONS_URL in compare/compare.js is correct.</p>`;
        }
      });
  }

  for (let i = 0; i < SLOTS; i++) {
    $("pick" + i).addEventListener("change", (e) => {
      picks[i] = e.target.value;
      fillSelects();
      render();
    });
  }

  render();
  load();
  window.addEventListener("focus", load);
})();