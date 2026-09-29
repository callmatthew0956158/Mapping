```javascript
/* =========================================================
   NEGROS OCCIDENTAL GAS PRICE MAP
   data.js
   ========================================================= */

/* ---------- Fuel Types ---------- */

const FUELS = {
  g91: ["Gasoline 91", "green"],
  g95: ["Gasoline 95", "red"],
  d: ["Diesel", "yellow"]
};


/* ---------- Marker Colors ---------- */

const COLORS = {
  green: "#16a34a",
  yellow: "#eab308",
  red: "#dc2626"
};


/* ---------- Gas Stations ---------- */

const STATIONS = [

  {
    id: 0,
    brand: "PETRON",
    name: "PETRON Gas Station",
    city: "Kabankalan City",
    address: "Kabankalan City, Negros Occidental",
    lat: 9.991700,
    lng: 122.811000,
    hours: "5:00 AM – 8:30 PM",
    rating: 3.6,
    reviews: 20,
    updated: "Sept. 29, 2026",
    p: {
      g91: 58.00,
      g95: 61.00,
      d: 56.00
    }
  },

  {
    id: 1,
    brand: "Shell",
    name: "Shell Gas Station",
    city: "Bago City",
    address: "Bago City, Negros Occidental",
    lat: 10.538000,
    lng: 122.839000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.3,
    reviews: 25,
    updated: "Sept. 29, 2026",
    p: {
      g91: 59.50,
      g95: 62.50,
      d: 57.50
    }
  },

  {
    id: 2,
    brand: "Caltex",
    name: "Caltex Gas Station",
    city: "La Carlota City",
    address: "La Carlota City, Negros Occidental",
    lat: 10.425000,
    lng: 122.921000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.0,
    reviews: 30,
    updated: "Sept. 29, 2026",
    p: {
      g91: 57.80,
      g95: 60.80,
      d: 55.80
    }
  },

  {
    id: 3,
    brand: "Seaoil",
    name: "Seaoil Gas Station",
    city: "Silay City",
    address: "Silay City, Negros Occidental",
    lat: 10.799000,
    lng: 122.972000,
    hours: "5:00 AM – 8:30 PM",
    rating: 3.7,
    reviews: 35,
    updated: "Sept. 29, 2026",
    p: {
      g91: 60.20,
      g95: 63.20,
      d: 58.20
    }
  },

  {
    id: 4,
    brand: "Phoenix",
    name: "Phoenix Gas Station",
    city: "Talisay City",
    address: "Talisay City, Negros Occidental",
    lat: 10.737000,
    lng: 122.969000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.4,
    reviews: 40,
    updated: "Sept. 29, 2026",
    p: {
      g91: 56.90,
      g95: 59.90,
      d: 54.90
    }
  },

  {
    id: 5,
    brand: "PETRON",
    name: "PETRON Gas Station",
    city: "Bacolod City",
    address: "Bacolod City, Negros Occidental",
    lat: 10.670000,
    lng: 122.960000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.1,
    reviews: 45,
    updated: "Sept. 29, 2026",
    p: {
      g91: 58.50,
      g95: 61.50,
      d: 56.50
    }
  },

  {
    id: 6,
    brand: "Shell",
    name: "Shell Gas Station",
    city: "Bacolod City",
    address: "Bacolod City, Negros Occidental",
    lat: 10.685000,
    lng: 122.940000,
    hours: "5:00 AM – 8:30 PM",
    rating: 3.8,
    reviews: 50,
    updated: "Sept. 29, 2026",
    p: {
      g91: 59.20,
      g95: 62.20,
      d: 57.20
    }
  },

  {
    id: 7,
    brand: "Unioil",
    name: "Unioil Gas Station",
    city: "Victorias City",
    address: "Victorias City, Negros Occidental",
    lat: 10.901000,
    lng: 123.070000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.5,
    reviews: 55,
    updated: "Sept. 29, 2026",
    p: {
      g91: 57.50,
      g95: 60.50,
      d: 55.50
    }
  },

  {
    id: 8,
    brand: "Caltex",
    name: "Caltex Gas Station",
    city: "Cadiz City",
    address: "Cadiz City, Negros Occidental",
    lat: 10.952000,
    lng: 123.308000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.0,
    reviews: 60,
    updated: "Sept. 29, 2026",
    p: {
      g91: 58.80,
      g95: 61.80,
      d: 56.80
    }
  },

  {
    id: 9,
    brand: "Phoenix",
    name: "Phoenix Gas Station",
    city: "Sagay City",
    address: "Sagay City, Negros Occidental",
    lat: 10.895000,
    lng: 123.415000,
    hours: "5:00 AM – 8:30 PM",
    rating: 3.9,
    reviews: 65,
    updated: "Sept. 29, 2026",
    p: {
      g91: 59.00,
      g95: 62.00,
      d: 57.00
    }
  },

  {
    id: 10,
    brand: "PETRON",
    name: "PETRON Gas Station",
    city: "San Carlos City",
    address: "San Carlos City, Negros Occidental",
    lat: 10.484000,
    lng: 123.413000,
    hours: "5:00 AM – 8:30 PM",
    rating: 3.6,
    reviews: 70,
    updated: "Sept. 29, 2026",
    p: {
      g91: 60.00,
      g95: 63.00,
      d: 58.00
    }
  },

  {
    id: 11,
    brand: "Seaoil",
    name: "Seaoil Gas Station",
    city: "Escalante City",
    address: "Escalante City, Negros Occidental",
    lat: 10.840000,
    lng: 123.504000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.3,
    reviews: 75,
    updated: "Sept. 29, 2026",
    p: {
      g91: 57.90,
      g95: 60.90,
      d: 55.90
    }
  },

  {
    id: 12,
    brand: "Shell",
    name: "Shell Gas Station",
    city: "Himamaylan City",
    address: "Himamaylan City, Negros Occidental",
    lat: 10.102000,
    lng: 122.870000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.0,
    reviews: 80,
    updated: "Sept. 29, 2026",
    p: {
      g91: 58.30,
      g95: 61.30,
      d: 56.30
    }
  },

  {
    id: 13,
    brand: "PETRON",
    name: "PETRON Gas Station",
    city: "Hinigaran",
    address: "Hinigaran, Negros Occidental",
    lat: 10.268000,
    lng: 122.848000,
    hours: "5:00 AM – 8:30 PM",
    rating: 3.7,
    reviews: 85,
    updated: "Sept. 29, 2026",
    p: {
      g91: 59.10,
      g95: 62.10,
      d: 57.10
    }
  },

  {
    id: 14,
    brand: "Caltex",
    name: "Caltex Gas Station",
    city: "Binalbagan",
    address: "Binalbagan, Negros Occidental",
    lat: 10.202000,
    lng: 122.868000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.4,
    reviews: 90,
    updated: "Sept. 29, 2026",
    p: {
      g91: 57.70,
      g95: 60.70,
      d: 55.70
    }
  },

  {
    id: 15,
    brand: "Phoenix",
    name: "Phoenix Gas Station",
    city: "Sipalay City",
    address: "Sipalay City, Negros Occidental",
    lat: 9.752000,
    lng: 122.401000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.1,
    reviews: 95,
    updated: "Sept. 29, 2026",
    p: {
      g91: 58.90,
      g95: 61.90,
      d: 56.90
    }
  },

  {
    id: 16,
    brand: "Seaoil",
    name: "Seaoil Gas Station",
    city: "Hinoba-an",
    address: "Hinoba-an, Negros Occidental",
    lat: 9.605000,
    lng: 122.475000,
    hours: "5:00 AM – 8:30 PM",
    rating: 3.8,
    reviews: 100,
    updated: "Sept. 29, 2026",
    p: {
      g91: 60.10,
      g95: 63.10,
      d: 58.10
    }
  },

  {
    id: 17,
    brand: "PETRON",
    name: "PETRON Gas Station",
    city: "Ilog",
    address: "Ilog, Negros Occidental",
    lat: 10.033300,
    lng: 122.766700,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.5,
    reviews: 105,
    updated: "Sept. 29, 2026",
    p: {
      g91: 57.60,
      g95: 60.60,
      d: 55.60
    }
  },

  {
    id: 18,
    brand: "Shell",
    name: "Shell Gas Station",
    city: "Murcia",
    address: "Murcia, Negros Occidental",
    lat: 10.607000,
    lng: 123.040000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.2,
    reviews: 110,
    updated: "Sept. 29, 2026",
    p: {
      g91: 58.40,
      g95: 61.40,
      d: 56.40
    }
  },

  {
    id: 19,
    brand: "Caltex",
    name: "Caltex Gas Station",
    city: "Pontevedra",
    address: "Pontevedra, Negros Occidental",
    lat: 10.385000,
    lng: 122.888000,
    hours: "5:00 AM – 8:30 PM",
    rating: 3.9,
    reviews: 115,
    updated: "Sept. 29, 2026",
    p: {
      g91: 59.30,
      g95: 62.30,
      d: 57.30
    }
  },

  {
    id: 20,
    brand: "Unioil",
    name: "Unioil Gas Station",
    city: "La Castellana",
    address: "La Castellana, Negros Occidental",
    lat: 10.330000,
    lng: 122.970000,
    hours: "5:00 AM – 8:30 PM",
    rating: 3.6,
    reviews: 120,
    updated: "Sept. 29, 2026",
    p: {
      g91: 58.70,
      g95: 61.70,
      d: 56.70
    }
  },

  {
    id: 21,
    brand: "PETRON",
    name: "PETRON Gas Station",
    city: "Moises Padilla",
    address: "Moises Padilla, Negros Occidental",
    lat: 10.266000,
    lng: 123.030000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.3,
    reviews: 125,
    updated: "Sept. 29, 2026",
    p: {
      g91: 57.40,
      g95: 60.40,
      d: 55.40
    }
  },

  {
    id: 22,
    brand: "Seaoil",
    name: "Seaoil Gas Station",
    city: "Isabela",
    address: "Isabela, Negros Occidental",
    lat: 10.200000,
    lng: 122.986000,
    hours: "5:00 AM – 8:30 PM",
    rating: 4.0,
    reviews: 130,
    updated: "Sept. 29, 2026",
    p: {
      g91: 58.10,
      g95: 61.10,
      d: 56.10
    }
  },

  {
    id: 23,
    brand: "Phoenix",
    name: "Phoenix Gas Station",
    city: "Cauayan",
    address: "Cauayan, Negros Occidental",
    lat: 9.933300,
    lng: 122.616700,
    hours: "5:00 AM – 8:30 PM",
    rating: 3.7,
    reviews: 135,
    updated: "Sept. 29, 2026",
    p: {
      g91: 59.40,
      g95: 62.40,
      d: 57.40
    }
  }

];


/* =========================================================
   END OF DATA
   ========================================================= */
```
