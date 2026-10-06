// Gas Stations Nearby: table, map pins, and sidebar filters
// Stations are loaded from the database through php/stations.php
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const rowsEl = $("rows");
  const showingEl = $("showing");
  const viewAllEl = $("viewAll");
  if (!rowsEl) return;

  const STATIONS_URL = "database/stations.php"; // path is relative to index.html
  const LIMIT = 10;
  const PRICE_MIN = 50, PRICE_MAX = 130;    // must match the sliders in index.html
  const COLORS = { cheap: "#0f9d3f", mid: "#f5a300", high: "#e0202b" };
  const FUEL_COLS = { g91: 3, g95: 4, d: 5 }; // column index in the table header

  let all = []; // filled from the database by loadStations()
  const map = window.gasMap || null;
  const layer = map ? L.layerGroup().addTo(map) : null;
  const markers = new Map();

  let showAll = false;
  let userLoc = null;
  let loaded = false;

  const esc = (t) =>
    String(t ?? "").replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  const money = (v) => (v == null ? "—" : "₱" + Number(v).toFixed(2));

  function distanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371, rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function activeFuels() {
    const on = [...document.querySelectorAll(".fuel:checked")].map((c) => c.value);
    return on.length ? on : ["g91", "g95", "d"];
  }

  function bestPrice(s, fuels) {
    const p = fuels.map((f) => s[f]).filter((v) => v != null);
    return p.length ? Math.min(...p) : null;
  }

  function pinIcon(color) {
    return L.divIcon({
      className: "",
      html: `<svg class="pin" width="30" height="40" viewBox="0 0 30 40" aria-hidden="true">
               <path d="M15 1C7 1 1 7 1 15c0 10.5 14 24 14 24s14-13.5 14-24C29 7 23 1 15 1z"
                     fill="${color}" stroke="#fff" stroke-width="2"/>
               <circle cx="15" cy="15" r="5.5" fill="#fff"/>
             </svg>`,
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -36]
    });
  }

  function popupHtml(s) {
    const dir = s.lat != null
      ? `<br><a href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}"
            target="_blank" rel="noopener">Get directions</a>`
      : "";
    return `<div class="pop"><b>${esc(s.name)}</b>
      <small>${esc(s.city)}<br>
      Gas 91: ${money(s.g91)}<br>Gas 95: ${money(s.g95)}<br>Diesel: ${money(s.d)}</small>${dir}</div>`;
  }

  // Service chips above the map (Open 24 hours, store, mechanic, air/water)
  function svcOk(s) {
    return [...document.querySelectorAll("#svcChips .chip.on")].every((c) => {
      const k = c.dataset.svc;
      return k === "h24" ? /24/.test(s.hours || "") : !!s[k];
    });
  }

  function getList() {
    const fuels = activeFuels();
    const q = $("search").value.trim().toLowerCase();
    const city = $("city").value;
    const lo = Number($("minP").value);
    const hi = Number($("maxP").value);
    const sort = $("sort").value;

    const list = all
      .map((s, i) => ({
        s, i,
        price: bestPrice(s, fuels),
        dist: userLoc && s.lat != null ? distanceKm(userLoc.lat, userLoc.lng, s.lat, s.lng) : null
      }))
      .filter(({ s, price }) =>
        price != null && price >= lo && price <= hi &&
        (!city || s.city === city) &&
        (!q || `${s.name} ${s.city || ""}`.toLowerCase().includes(q)) &&
        svcOk(s));

    list.sort((a, b) => {
      if (sort === "desc") return b.price - a.price;
      if (sort === "name") return a.s.name.localeCompare(b.s.name);
      if (sort === "near") return (a.dist ?? 1e9) - (b.dist ?? 1e9);
      return a.price - b.price;
    });
    return list;
  }

  function renderMarkers(list) {
    if (!layer) return;
    layer.clearLayers();
    markers.clear();
    if (!list.length) return;

    const prices = list.map((x) => x.price);
    const min = Math.min(...prices), max = Math.max(...prices);
    const third = (max - min) / 3;

    list.forEach(({ s, i, price }) => {
      if (s.lat == null || s.lng == null) return;
      const color = price <= min + third ? COLORS.cheap : price <= min + 2 * third ? COLORS.mid : COLORS.high;
      const m = L.marker([s.lat, s.lng], { icon: pinIcon(color) })
        .bindPopup(popupHtml(s))
        .on("click", () => document.dispatchEvent(
          new CustomEvent("station:select", { detail: { index: i, station: s } })))
        .addTo(layer);
      markers.set(i, m);
    });
  }

  function renderTable(list) {
    const fuelsOn = activeFuels();
    const ths = document.querySelectorAll("#tableWrap thead th");
    Object.entries(FUEL_COLS).forEach(([fuel, col]) => {
      if (ths[col]) ths[col].classList.toggle("fuelhide", !fuelsOn.includes(fuel));
    });
    const hide = (fuel) => (fuelsOn.includes(fuel) ? "" : " fuelhide");

    if (!list.length) {
      let text = "No stations match your filters.";
      if (!loaded) text = "Loading stations...";
      else if (!all.length) text = "No gas stations yet.";
      rowsEl.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:28px;color:var(--muted)">${text}</td></tr>`;
      showingEl.textContent = loaded ? `Showing 0 of ${all.length} stations` : "";
      viewAllEl.style.display = "none";
      return;
    }

    const shown = showAll ? list : list.slice(0, LIMIT);

    rowsEl.innerHTML = shown.map(({ s, i, dist }, n) => `
      <tr>
        <td>${n + 1}</td>
        <td class="name">${esc(s.name)}${dist != null
          ? ` <small style="color:var(--muted);font-weight:400">${dist.toFixed(1)} km</small>` : ""}</td>
        <td>${esc(s.city)}</td>
        <td class="p${hide("g91")}"><i class="dot green"></i>${money(s.g91)}</td>
        <td class="p${hide("g95")}"><i class="dot red"></i>${money(s.g95)}</td>
        <td class="p${hide("d")}"><i class="dot yellow"></i>${money(s.d)}</td>
        <td>${esc(s.updated || "—")}</td>
        <td><button class="view" data-i="${i}">View</button></td>
      </tr>`).join("");

    showingEl.textContent = `Showing ${shown.length} of ${list.length} stations`;
    viewAllEl.style.display = list.length > LIMIT ? "" : "none";
    viewAllEl.textContent = showAll ? "Show less" : "View All";
  }

  function syncRange(changed) {
    // Keep the two sliders from crossing each other
    if (Number($("minP").value) > Number($("maxP").value)) {
      if (changed === "minP") $("minP").value = $("maxP").value;
      else $("maxP").value = $("minP").value;
    }
    const lo = Number($("minP").value);
    const hi = Number($("maxP").value);
    $("minL").textContent = lo;
    $("maxL").textContent = hi;
    const box = document.querySelector(".range");
    const span = PRICE_MAX - PRICE_MIN;
    box.style.setProperty("--lo", ((lo - PRICE_MIN) / span) * 100 + "%");
    box.style.setProperty("--hi", ((hi - PRICE_MIN) / span) * 100 + "%");
  }

  function render() {
    const list = getList();
    renderMarkers(list);
    renderTable(list);
    const sc = $("svcCount");
    if (sc) sc.textContent = loaded ? `Showing ${list.length} of ${all.length} stations` : "";
  }

  // Fill the city dropdown from the data (safe to call again after a reload)
  function fillCities() {
    const sel = $("city");
    const keep = sel.value;
    while (sel.options.length > 1) sel.remove(1);
    [...new Set(all.map((s) => s.city).filter(Boolean))].sort().forEach((c) => {
      sel.add(new Option(c, c));
    });
    sel.value = keep; // stays on "All" if the old city no longer exists
  }

  // Load stations from the database
  function loadStations() {
    return fetch(STATIONS_URL, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error((data && data.error) || "Bad response");
        all = data;
        loaded = true;
        fillCities();
        render();
        window.gasStations = all; // the savings calculator reads this
        document.dispatchEvent(new CustomEvent("stations:loaded", { detail: all }));
      })
      .catch((err) => {
        console.error("Could not load stations:", err);
        if (!all.length) {
          rowsEl.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:28px;color:#b00020">
            Couldn't load stations from the database. Check that Apache and MySQL are running,
            then open <b>${esc(STATIONS_URL)}</b> in the browser to see the error.</td></tr>`;
          showingEl.textContent = "";
          viewAllEl.style.display = "none";
        }
      });
  }

  // Table buttons
  rowsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".view");
    if (!btn) return;
    const i = Number(btn.dataset.i);
    const s = all[i];
    if (map && s && s.lat != null) {
      map.setView([s.lat, s.lng], 16);
      const m = markers.get(i);
      if (m) m.openPopup();
      $("map").scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // Other scripts (detail panel, compare) can listen for this
    document.dispatchEvent(new CustomEvent("station:select", { detail: { index: i, station: s } }));
  });

  viewAllEl.addEventListener("click", (e) => {
    e.preventDefault();
    showAll = !showAll;
    render();
  });

  // Filters
  $("search").addEventListener("input", render);
  $("clearSearch").addEventListener("click", () => { $("search").value = ""; render(); });
  $("city").addEventListener("change", render);
  $("sort").addEventListener("change", render);
  document.querySelectorAll(".fuel").forEach((c) => c.addEventListener("change", render));
  ["minP", "maxP"].forEach((id) =>
    $(id).addEventListener("input", () => { syncRange(id); render(); }));

  // Service chips
  document.querySelectorAll("#svcChips .chip").forEach((c) =>
    c.addEventListener("click", () => { c.classList.toggle("on"); render(); }));

  // "Find near me" button on the map
  document.addEventListener("gas:locate", (e) => {
    userLoc = e.detail;
    if (!$("sort").querySelector('[value="near"]')) {
      $("sort").add(new Option("Nearest to me", "near"), 0);
    }
    $("sort").value = "near";
    render();
  });

  // Start
  syncRange();
  render();          // shows "Loading stations..." until the data arrives
  loadStations();

  // Pick up newly added stations when you switch back to this tab
  window.addEventListener("focus", loadStations);
})();