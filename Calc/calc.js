// Savings calculator: cheapest vs most expensive station for the chosen fuel and liters
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  if (!$("calc")) return;

  let fuel = "g91";
  let stations = window.gasStations || [];

  const peso = (n) => "₱" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const set = (id, t) => { $(id).textContent = t; };

  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  // Fill the station dropdown (keeps the current choice when the data reloads)
  function fillStations() {
    const sel = $("calcStation");
    const keep = sel.value;
    sel.innerHTML = '<option value="">All stations (cheapest vs most expensive)</option>' +
      stations.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}${s.city ? " - " + esc(s.city) : ""}</option>`).join("");
    sel.value = keep;
    if (sel.value !== keep) sel.value = "";
  }

  function clear() {
    ["cLo", "cHi", "cSave"].forEach((id) => set(id, "—"));
    ["cLoL", "cHiL", "cLoC", "cHiC"].forEach((id) => set(id, ""));
    set("cLoN", "—"); set("cHiN", "—");
  }

  function calc() {
    const liters = parseFloat($("calcL").value);
    if (!(liters > 0)) { set("calcErr", "Enter the number of liters."); clear(); return; }
    set("calcErr", "");

    const list = stations.filter((s) => s[fuel] != null);
    if (!list.length) { clear(); return; }

    const lo = list.reduce((a, b) => (b[fuel] < a[fuel] ? b : a));
    let hi = list.reduce((a, b) => (b[fuel] > a[fuel] ? b : a));

    // A station picked from the dropdown replaces the "most expensive" card
    const id = $("calcStation").value;
    const pick = id ? stations.find((s) => String(s.id) === id) : null;
    if (pick && pick[fuel] == null) {
      set("calcErr", pick.name + " doesn't sell this fuel.");
      clear();
      return;
    }
    if (pick) hi = pick;
    $("cHiCard").classList.toggle("sel", !!pick);
    $("cHiCard").classList.toggle("exp", !pick);
    set("cHiT", pick ? "Selected Station" : "Most Expensive Station");

    set("cLo", peso(liters * lo[fuel]));
    set("cLoL", "(" + peso(lo[fuel]) + "/L)");
    set("cLoN", lo.name); set("cLoC", lo.city || "");
    set("cHi", peso(liters * hi[fuel]));
    set("cHiL", "(" + peso(hi[fuel]) + "/L)");
    set("cHiN", hi.name); set("cHiC", hi.city || "");
    const diff = liters * (hi[fuel] - lo[fuel]);
    set("cSave", peso(diff > 0 ? diff : 0));
    set("cSaveSub", pick && diff <= 0 ? "(this is already the cheapest)" : "(with the cheapest station)");
  }

  // Loads its own copy of the stations, so it works even if table.js is an older file
  const STATIONS_URL = "database/stations.php"; // same path as STATIONS_URL in table.js
  function load() {
    if (!stations.length) set("calcErr", "Loading station prices...");
    return fetch(STATIONS_URL, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then((d) => {
        if (!Array.isArray(d)) throw new Error((d && d.error) || "Bad response");
        stations = d;
        fillStations();
        calc();
        if (!stations.length) set("calcErr", "No stations found in the database.");
      })
      .catch((err) => {
        if (!stations.length) set("calcErr", "Couldn't load " + STATIONS_URL + " (" + err.message + ").");
      });
  }

  document.addEventListener("stations:loaded", (e) => { stations = e.detail; fillStations(); calc(); });
  $("calcStation").addEventListener("change", calc);
  // Clicking a pin or a table "View" button selects that station here too
  document.addEventListener("station:select", (e) => {
    const s = e.detail && e.detail.station;
    if (s && s.id != null) { $("calcStation").value = String(s.id); calc(); }
  });
  $("calcL").addEventListener("input", calc);
  $("calcBtn").addEventListener("click", () => { calc(); $("calcL").focus(); $("calcL").select(); });
  $("calcFuels").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    fuel = b.dataset.f;
    $("calcFuels").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    calc();
  });

  calc();
  load();
  window.addEventListener("focus", load);
})();