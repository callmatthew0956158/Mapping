/* ---------- Safety checks (show a message instead of a blank map) ---------- */
if (typeof L === "undefined") {
  document.getElementById("map").innerHTML =
    "<p style='padding:24px'>Leaflet could not load. Check your internet connection and reload the page.</p>";
  throw new Error("Leaflet not loaded");
}
const HAS_BOUNDARY = typeof NEGROS_BOUNDARY !== "undefined"; // boundary.js is optional

/* ---------- Map (Negros Occidental only) ---------- */
const boundary = HAS_BOUNDARY
  ? L.geoJSON(NEGROS_BOUNDARY, { style: { color: "#1668e3", weight: 2, fillOpacity: 0 }, interactive: false })
  : null;
const bounds = HAS_BOUNDARY ? boundary.getBounds() : L.latLngBounds([9.4, 122.2], [11.1, 123.7]);
const map = L.map("map", { maxBounds: bounds.pad(0.12), maxBoundsViscosity: 1, minZoom: 8, zoomControl: true })
  .fitBounds(bounds);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18, attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// mask everything outside the province: a world-sized polygon with the province cut out as "holes"
if (HAS_BOUNDARY) {
  const holes = NEGROS_BOUNDARY.geometry.coordinates.map(poly => poly[0].map(([x, y]) => [y, x]));
  L.polygon([[[-90, -360], [-90, 360], [90, 360], [90, -360]], ...holes],
    { stroke: false, fillColor: "#eef2f8", fillOpacity: 0.96, interactive: false }).addTo(map);
  boundary.addTo(map);
}
L.control.scale({ imperial: false }).addTo(map);

// "Locate me" button
const Locate = L.Control.extend({
  onAdd() {
    const b = L.DomUtil.create("button", "leaflet-bar");
    b.innerHTML = "◎"; b.title = "My location";
    b.style.cssText = "width:34px;height:34px;background:#fff;border:0;font-size:18px;cursor:pointer";
    L.DomEvent.on(b, "click", e => { L.DomEvent.stop(e); map.locate({ setView: true, maxZoom: 13 }); });
    return b;
  }
});
new Locate({ position: "topleft" }).addTo(map);

/* ---------- Helpers ---------- */
const $ = id => document.getElementById(id);
const peso = n => "₱" + n.toFixed(2);
const activeFuels = () => [...document.querySelectorAll(".fuel:checked")].map(c => c.value);

// price tier by Gasoline 91 (cheapest third = green, middle = yellow, top = red)
const sorted91 = STATIONS.map(s => s.p.g91).sort((a, b) => a - b);
const lo = sorted91[Math.floor(sorted91.length / 3)], hi = sorted91[Math.floor(sorted91.length * 2 / 3)];
const tier = s => s.p.g91 < lo ? "green" : s.p.g91 < hi ? "yellow" : "red";

function pinIcon(color, selected) {
  return L.divIcon({
    className: "",
    iconSize: [30, 40], iconAnchor: [15, 40], popupAnchor: [0, -38],
    html: `<svg class="pin ${selected ? "sel" : ""}" width="30" height="40" viewBox="0 0 30 40">
      <path d="M15 0C6.7 0 0 6.6 0 14.8 0 26 15 40 15 40s15-14 15-25.2C30 6.6 23.3 0 15 0z" fill="${COLORS[color]}"/>
      <circle cx="15" cy="14.5" r="6" fill="#fff"/></svg>`
  });
}

/* ---------- State ---------- */
let selected = 0, showAll = false, compareIds = [0, 1, 2];
const markers = {};
const layer = L.layerGroup().addTo(map);

/* ---------- Filtering ---------- */
function getFiltered() {
  const q = $("search").value.trim().toLowerCase(), city = $("city").value;
  const a = +$("minP").value, b = +$("maxP").value, min = Math.min(a, b), max = Math.max(a, b), fuels = activeFuels();
  let list = STATIONS.filter(s =>
    (!q || (s.name + " " + s.city).toLowerCase().includes(q)) &&
    (!city || s.city === city) &&
    fuels.some(f => s.p[f] >= min && s.p[f] <= max));
  const key = fuels[0] || "g91", mode = $("sort").value;
  list.sort((a, b) => mode === "name" ? a.name.localeCompare(b.name)
    : mode === "desc" ? b.p[key] - a.p[key] : a.p[key] - b.p[key]);
  return list;
}

/* ---------- Render ---------- */
function render() {
  const list = getFiltered();
  renderMarkers(list); renderTable(list);
}

function renderMarkers(list) {
  layer.clearLayers();
  list.forEach(s => {
    const m = L.marker([s.lat, s.lng], { icon: pinIcon(tier(s), s.id === selected) })
      .bindPopup(`<div class="pop"><b>${s.name}</b><small>${s.city}<br>Gasoline 91: ${peso(s.p.g91)}</small></div>`)
      .on("click", () => select(s.id, false))
      .addTo(layer);
    markers[s.id] = m;
  });
}

function renderTable(list) {
  const fuels = activeFuels();
  const rows = (showAll ? list : list.slice(0, 10)).map((s, i) => `
    <tr>
      <td>${i + 1}</td><td class="name">${s.name}</td><td>${s.city}</td>
      ${["g91", "g95", "d"].map(f =>
        `<td class="p ${fuels.includes(f) ? "" : "fuelhide"}"><i class="dot ${FUELS[f][1]}"></i>${peso(s.p[f])}</td>`).join("")}
      <td>${s.updated}</td>
      <td><button class="view" data-id="${s.id}">View</button></td>
    </tr>`).join("");
  $("rows").innerHTML = rows || `<tr><td colspan="8">No stations match your filters.</td></tr>`;
  $("showing").textContent = `Showing ${Math.min(showAll ? list.length : 10, list.length)} of ${list.length} stations`;
  // hide header cells of unchecked fuels
  document.querySelectorAll("#tableWrap thead th").forEach((th, i) => {
    if (i >= 3 && i <= 5) th.classList.toggle("fuelhide", !fuels.includes(["g91", "g95", "d"][i - 3]));
  });
}

function renderDetail() {
  const s = STATIONS[selected];
  $("detail").innerHTML = `
    <div class="hero">⛽</div>
    <div class="title"><h2>${s.name}</h2><span class="badge">Verified Price</span></div>
    <div class="meta">📍 ${s.city}, Negros Occidental</div>
    <div class="meta"><span class="open">Open</span> · ${s.hours}</div>
    <div class="meta">⭐ <b>${s.rating}</b> (${s.reviews} reviews)</div>
    <div class="upd"><h3 style="margin:8px 0">Current Fuel Prices</h3><small>Updated: ${s.updated} 10:15 AM</small></div>
    ${Object.keys(FUELS).map(f => `
      <div class="fuel-row"><span><i class="dot ${FUELS[f][1]}"></i>${FUELS[f][0]}</span><b>${peso(s.p[f])}</b></div>`).join("")}
    <div class="actions">
      <button class="primary" id="dirBtn">➤ Get Directions</button>
      <button id="cmpBtn">⚖ Compare</button>
      <button class="wide" id="repBtn">✎ Report Price</button>
    </div>`;
  $("dirBtn").onclick = () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`, "_blank");
  $("cmpBtn").onclick = () => {
    if (!compareIds.includes(s.id)) { compareIds.push(s.id); if (compareIds.length > 3) compareIds.shift(); }
    renderCompare(); $("compare").scrollIntoView({ behavior: "smooth" });
  };
  $("repBtn").onclick = reportPrice;
  renderChart(s);
}

function renderChart(s) {
  const labels = ["Aug 29", "Sep 5", "Sep 12", "Sep 19", "Sep 26"];
  const vals = labels.map((_, i) => s.p.g91 + (4 - i) * 0.35 + ((s.id * 7 + i * 3) % 5) * 0.1);
  const W = 340, H = 190, L0 = 42, R = 10, T = 12, B = 30, yMin = 50, yMax = 70;
  const x = i => L0 + i * (W - L0 - R) / (vals.length - 1);
  const y = v => T + (yMax - v) * (H - T - B) / (yMax - yMin);
  const grid = [50, 55, 60, 65, 70].map(v =>
    `<line x1="${L0}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#e6ebf2"/><text x="${L0 - 6}" y="${y(v) + 4}" font-size="11" text-anchor="end" fill="#555">₱${v}</text>`).join("");
  const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  $("chart").innerHTML = `<svg viewBox="0 0 ${W} ${H}">${grid}
    <polygon points="${x(0)},${y(yMin)} ${pts} ${x(4)},${y(yMin)}" fill="rgba(15,157,63,.08)"/>
    <polyline points="${pts}" fill="none" stroke="#0f9d3f" stroke-width="2.5"/>
    ${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="#0f9d3f"><title>${labels[i]}: ${peso(v)}</title></circle>
      <text x="${x(i)}" y="${H - 10}" font-size="11" text-anchor="middle" fill="#555">${labels[i]}</text>`).join("")}</svg>`;
}

function renderCompare() {
  $("cmpRows").innerHTML = compareIds.map(id => {
    const s = STATIONS[id];
    return `<tr><td>${s.name.split(" ")[0]} (${s.city.replace(" City", "")})</td>
      <td>${peso(s.p.g91)}</td><td>${peso(s.p.g95)}</td><td>${peso(s.p.d)}</td></tr>`;
  }).join("");
}

/* ---------- Actions ---------- */
function select(id, fly = true) {
  selected = id;
  const s = STATIONS[id];
  renderDetail(); render();
  if (fly) map.flyTo([s.lat, s.lng], 12, { duration: 0.8 });
  if (markers[id]) markers[id].openPopup();
}

function reportPrice() {
  const s = STATIONS[selected];
  const v = parseFloat(prompt(`Report new Gasoline 91 price for ${s.name} (₱/L):`, s.p.g91));
  if (!isNaN(v) && v > 0) { s.p.g91 = v; s.updated = "Sept. 29, 2026"; select(selected, false); renderCompare(); }
}

/* ---------- Events ---------- */
$("city").innerHTML += [...new Set(STATIONS.map(s => s.city))].sort().map(c => `<option>${c}</option>`).join("");
["search", "city", "sort"].forEach(id => $(id).addEventListener("input", render));
document.querySelectorAll(".fuel").forEach(c => c.addEventListener("change", render));
$("clearSearch").onclick = () => { $("search").value = ""; render(); };

function priceRange() {
  let a = +$("minP").value, b = +$("maxP").value;
  if (a > b) [a, b] = [b, a];
  $("minL").textContent = a; $("maxL").textContent = b;
  const r = $("minP").parentElement.style; // colours the selected part of the slider track
  r.setProperty("--lo", ((a - 50) / 30 * 100) + "%"); r.setProperty("--hi", ((b - 50) / 30 * 100) + "%");
  render();
}
$("minP").addEventListener("input", priceRange);
$("maxP").addEventListener("input", priceRange);

$("rows").addEventListener("click", e => {
  const b = e.target.closest(".view"); if (b) select(+b.dataset.id);
});
$("viewAll").onclick = e => { e.preventDefault(); showAll = !showAll; $("viewAll").textContent = showAll ? "Show Less" : "View All"; render(); };
$("navReport").onclick = reportPrice;
document.querySelectorAll("nav [data-go]").forEach(b => b.onclick = () => {
  document.querySelectorAll("nav button").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  const t = { map: "map", compare: "compare", history: "history" }[b.dataset.go];
  $(t).scrollIntoView({ behavior: "smooth", block: "start" });
});

/* ---------- Init ---------- */
renderCompare(); select(0, false); map.fitBounds(bounds);