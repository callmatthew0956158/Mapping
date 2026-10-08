// Header navigation for index.html
(function () {
  "use strict";

  const NEWS_URL = "news.html";       // News Report page
  const COMPARE_URL = "compare.html"; // Compare Prices page

  const buttons = document.querySelectorAll("nav button");

  function setActive(btn) {
    buttons.forEach((b) => b.classList.toggle("active", b === btn));
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const go = btn.dataset.go;

      if (go === "news") {               // 📰 News Report
        location.href = NEWS_URL;
        return;
      }
      if (btn.id === "navCompare") {     // ⚖ Compare Prices
        location.href = COMPARE_URL;
        return;
      }

      // Map and Price History scroll to their section on this page
      const target = go && document.getElementById(go);
      if (target) {
        setActive(btn);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();