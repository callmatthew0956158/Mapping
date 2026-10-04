// ==========================================================
// EDIT THIS PART to change the news. Put the link of each
// article in "url". Leave "image" empty to show the gradient.
// ==========================================================
const NEWS = {
  featured: {
    title: "Fuel Price Update",
    text: "Fuel prices across selected stations in Negros Occidental have been updated. Keep checking for the latest rates and plan your trip wisely.",
    date: "October 3, 2026",
    url: "https://mb.com.ph/2026/09/29/gasataya-meets-bacolod-transport-groups-airs-concern-over-rising-fuel-prices",
    image: "images/fuel-prices.jpg",   // big picture, put your file name here
    g91: 89.38, g95: 109.15, d: 95.43
  },

  // The 4 cards. cls: c-fuel | c-road | c-ann | c-svc
  categories: [
    { cls: "c-fuel", icon: "♨️", title: "LPG PRICE UPDATE", date: "Oct 2, 2026",
      text: "LPG prices are expected to increase by ₱18 per kilogram",
      url: "https://digicastnegros.com/presyo-sang-lpg-ginapaabot-nga-magasaka-sang-p18-kada-kilo/", image: "images/lpg.jpg" },
    { cls: "c-road", icon: "🚗", title: "Road & Fare reports", date: "Oct 1, 2026",
      text: "Jeepney and modernized bus fares are set to increase, with the new fare at ₱14 for jeepneys and ₱17 for modernized buses affecting in Bacolod City.",
      url: "https://mb.com.ph/2026/09/29/gasataya-meets-bacolod-transport-groups-airs-concern-over-rising-fuel-prices", image: "images/FARE.jpg" },
    { cls: "c-ann", icon: "📢", title: "Announcements", date: "Oct 2, 2026",
      text: "The Bacolod Traffic and Transport Management Department (BTTMD) started implementing full road closures around the Bacolod Public Plaza for the 47th MassKara Festival.",
      url: "https://watchmendailyjournal.com/2026/10/02/bacolod-plaza-road-closures-for-masskara-begin/", image: "images/Masskara.jpg" },
    { cls: "c-svc", icon: "⛽", title: "RollBack reports", date: "Sep 25, 2026",
      text: "After three consecutive weeks of steep price hikes, diesel prices are expected to see a rollback of as much as P8 per liter by the end of September, the Department of Energy (DOE) said on Friday, September 25.",
      url: "https://www.philstar.com/business/2026/09/25/2558821/doe-sees-p8-diesel-price-rollback-end-september", image: "images/Rollback.jpg" }
  ],

  // Sidebar list. color: green | orange | yellow | red | blue
  previous: [
    { date: "Sep 23, 2026",  title: "Business Updates",           color: "green",  url: "https://www.philstar.com/business/2026/09/23/2558360/dof-backs-excise-tax-relief-lpg-kerosene-not-diesel-or-gasoline" },
    { date: "Oct 2, 2026", title: "DigiCast Negros", color: "orange", url: "https://digicastnegros.com/cong-albee-benitez-nagsiling-nga-indi-amo-ang-hitsura-sang-plaza-sa-ginpromisa-nga-plano-sang-tieza/" },
    { date: "Sep 28, 2026", title: "Diesel Price Update",          color: "yellow", url: "https://www.globalpetrolprices.com/Philippines/diesel_prices==-" },
    { date: "Oct 2, 2026", title: "Road Closure Notice",          color: "red",    url: "https://watchmendailyjournal.com/2026/10/02/bacolod-plaza-road-closures-for-masskara-begin/" },
    { date: "Sep 15, 2026", title: "New Gas Station Opening",      color: "blue",   url: "https://example.com/5" }
  ]
};


// Page code: no need to edit below
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (v) => Number(v).toFixed(2);
  // Only allow web links (blocks javascript: links)
  const safe = (u) => (/^https?:\/\//i.test(u) || /^[\w./-]+\.html?$/i.test(u) ? esc(u) : "#");
  const ext = (u) => (/^https?:\/\//i.test(u) ? ' target="_blank" rel="noopener"' : "");

  document.addEventListener("DOMContentLoaded", () => {
    const f = NEWS.featured;
    $("featTitle").textContent = f.title;
    $("featText").textContent = f.text;
    $("featDate").textContent = f.date;
    $("fG91").textContent = money(f.g91);
    $("fG95").textContent = money(f.g95);
    $("fD").textContent = money(f.d);
    if (f.image) $("featImg").src = f.image; else $("featImg").remove();
    $("featLink").href = safe(f.url);
    if (ext(f.url)) { $("featLink").target = "_blank"; $("featLink").rel = "noopener"; }

    $("cats").innerHTML = NEWS.categories.map((c) => `
      <article class="card cat ${esc(c.cls)}">
        <header><i>${c.icon}</i>${esc(c.title)}<em>›</em></header>
        <div class="thumb">${c.image ? `<img src="${esc(c.image)}" alt="" onerror="this.remove()">` : ""}</div>
        <p>${esc(c.text)}</p>
        <div class="date">📅 ${esc(c.date)}</div>
        <a class="more" href="${safe(c.url)}"${ext(c.url)}>Read more →</a>
      </article>`).join("");

    $("prevList").innerHTML = NEWS.previous.map((p) => `
      <li><a href="${safe(p.url)}"${ext(p.url)}>
        <i class="dot ${esc(p.color)}"></i>
        <span><small>${esc(p.date)}</small><b>${esc(p.title)}</b></span><em>›</em>
      </a></li>`).join("");
  });
})();