// Map box, centered on Bacolod City
const BACOLOD = [10.6765, 122.9509];
const mapEl = document.getElementById("map");

function showMapError(msg) {
  mapEl.style.cssText += ";display:flex;align-items:center;justify-content:center;background:#fff3f3;color:#b00020;padding:20px;text-align:center;font:16px sans-serif";
  mapEl.textContent = msg;
}

if (!mapEl) {
  console.error('No element with id="map" found in index.html');
} else if (typeof L === "undefined") {
  showMapError("Leaflet failed to load (blocked or offline). Check your internet, or turn off Brave Shields for localhost, then refresh.");
} else {
  const gasMap = L.map(mapEl).setView(BACOLOD, 13);
  window.gasMap = gasMap; // table.js uses this to draw pins

  const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(gasMap);

  let tileErrors = 0;
  tiles.on("tileerror", () => {
    if (++tileErrors === 3) console.warn("Map tiles are failing to load. Check your internet or ad blocker.");
  });

  setTimeout(() => gasMap.invalidateSize(), 200);
  window.addEventListener("load", () => gasMap.invalidateSize());

  const btnStyle = "width:34px;height:34px;font-size:18px;cursor:pointer;background:#fff;border:2px solid rgba(0,0,0,.25);border-radius:4px;display:block;margin-bottom:6px";

  // Button: back to Bacolod City
  const homeBtn = L.control({ position: "topleft" });
  homeBtn.onAdd = () => {
    const b = L.DomUtil.create("button");
    b.textContent = "◎";
    b.title = "Back to Bacolod City";
    b.style.cssText = btnStyle;
    b.onclick = e => { e.stopPropagation(); gasMap.setView(BACOLOD, 13); };
    return b;
  };
  homeBtn.addTo(gasMap);

  // Button: find stations near me (needs localhost or HTTPS)
  let youMarker = null;
  const locBtn = L.control({ position: "topleft" });
  locBtn.onAdd = () => {
    const b = L.DomUtil.create("button");
    b.textContent = "⌖";
    b.title = "Find gas stations near me";
    b.style.cssText = btnStyle;
    b.onclick = e => {
      e.stopPropagation();
      if (!navigator.geolocation) {
        alert("Your browser doesn't support location.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude, lng = pos.coords.longitude;
          gasMap.setView([lat, lng], 14);
          if (youMarker) gasMap.removeLayer(youMarker);
          youMarker = L.circleMarker([lat, lng], {
            radius: 8, color: "#fff", weight: 3, fillColor: "#1668e3", fillOpacity: 1
          }).addTo(gasMap).bindPopup("You are here");
          document.dispatchEvent(new CustomEvent("gas:locate", { detail: { lat, lng } }));
        },
        () => alert("Couldn't get your location. Allow location access and try again.")
      );
    };
    return b;
  };
  locBtn.addTo(gasMap);
}