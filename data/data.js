// ---------------------------------------------------------------
// 1) Brand prices (PHP per liter). "Chg" = change from the last update
//    (negative = went down). null = N/A.
//    Table mapping: g91 = Unleaded 91, g95 = Premium 95, d = Diesel.
// ---------------------------------------------------------------
const BRAND_PRICES = {
  Shell:   { d: 96.72, dChg: -7.60, pd: 102.45, pdChg: -7.60, g91: 90.65, g91Chg: -0.29, e: null,   eChg: null,  g95: 96.93, g95Chg: -0.30, p97: 104.10, p97Chg: -0.30, k: 126.95, kChg: -5.90 },
  Petron:  { d: 95.98, dChg: -7.63, pd: 99.30,  pdChg: -7.63, g91: 89.21, g91Chg: -0.33, e: null,   eChg: null,  g95: 90.23, g95Chg: -0.31, p97: 98.41,  p97Chg: -0.31, k: 123.68, kChg: -5.90 },
  Caltex:  { d: 97.62, dChg: -7.57, pd: 100.90, pdChg: -7.57, g91: 90.55, g91Chg: -0.24, e: null,   eChg: null,  g95: 96.72, g95Chg: -0.24, p97: 99.69,  p97Chg: -0.24, k: 122.58, kChg: -5.85 },
  Phoenix: { d: 95.17, dChg: -7.57, pd: null,   pdChg: null,  g91: 88.78, g91Chg: -0.24, e: 105.14, eChg: -0.24, g95: 89.78, g95Chg: -0.24, p97: 99.21,  p97Chg: -0.24, k: null,   kChg: null  },
  Seaoil:  { d: 95.31, dChg: -7.57, pd: 100.76, pdChg: -7.57, g91: 89.29, g91Chg: -0.25, e: 116.82, eChg: -0.24, g95: 91.96, g95Chg: -0.24, p97: 93.95,  p97Chg: -0.24, k: 128.71, kChg: -5.85 }
};

// ---------------------------------------------------------------
// 2) Station locations. Each station uses the price of its brand.
//    IMPORTANT: these lat/lng are APPROXIMATE (near each city center).
//    To place a pin on the real station: in Google Maps, right-click the
//    station, click the coordinates at the top of the menu to copy them,
//    then paste as lat, lng below.
// ---------------------------------------------------------------
const LOCATIONS = [
  { name: "PETRON Gas Station",  brand: "Petron",  city: "Kabankalan City", lat: 9.9906,  lng: 122.8136 },
  { name: "Shell Gas Station",   brand: "Shell",   city: "Bago City",       lat: 10.5333, lng: 122.8358 },
  { name: "Caltex Gas Station",  brand: "Caltex",  city: "La Carlota City", lat: 10.4239, lng: 122.9206 },
  { name: "Seaoil Gas Station",  brand: "Seaoil",  city: "Silay City",      lat: 10.8000, lng: 122.9722 },
  { name: "Phoenix Gas Station", brand: "Phoenix", city: "Talisay City",    lat: 10.7364, lng: 122.9667 },
  { name: "Petron Lacson",       brand: "Petron",  city: "Bacolod City",    lat: 10.6870, lng: 122.9570 },
  { name: "Shell Araneta",       brand: "Shell",   city: "Bacolod City",    lat: 10.6640, lng: 122.9440 }
];

const PRICES_UPDATED = "Sept. 30, 2026";

// ---------------------------------------------------------------
// 3) Combine them: this is what table.js and the map use.
// ---------------------------------------------------------------
const STATIONS = LOCATIONS.map((loc) => ({
  ...BRAND_PRICES[loc.brand],
  ...loc,
  updated: PRICES_UPDATED
}));