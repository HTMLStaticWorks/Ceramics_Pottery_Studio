(function () {
  "use strict";

  var THEME_KEY = "clay-studio-theme";
  var RTL_KEY = "clay-studio-rtl";

  function getStored(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setStored(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    setStored(THEME_KEY, theme);
    var toggles = document.querySelectorAll("[data-theme-toggle]");
    toggles.forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute("title", theme === "dark" ? "Light mode" : "Dark mode");
    });
  }

  function initTheme() {
    var stored = getStored(THEME_KEY, "");
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored || (prefersDark ? "dark" : "light");
    applyTheme(theme === "dark" ? "dark" : "light");

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isDark = document.documentElement.getAttribute("data-theme") === "dark";
        applyTheme(isDark ? "light" : "dark");
      });
    });
  }

  function applyRtl(isRtl) {
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
    setStored(RTL_KEY, isRtl ? "1" : "0");
    document.querySelectorAll("[data-rtl-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", isRtl ? "true" : "false");
      btn.setAttribute("title", isRtl ? "LTR layout" : "RTL layout");
    });
  }

  function initRtl() {
    var stored = getStored(RTL_KEY, "0");
    applyRtl(stored === "1");
    document.querySelectorAll("[data-rtl-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cur = document.documentElement.getAttribute("dir") === "rtl";
        applyRtl(!cur);
      });
    });
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav-panel]");
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 1024px)").matches) close();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  function initPasswordToggles() {
    document.querySelectorAll("[data-toggle-password]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("aria-controls");
        var input = id ? document.getElementById(id) : btn.closest(".field--password").querySelector("input");
        if (!input) return;
        var isPw = input.getAttribute("type") === "password";
        input.setAttribute("type", isPw ? "text" : "password");
        btn.setAttribute("aria-label", isPw ? "Hide password" : "Show password");
      });
    });
  }

  function initGalleryFilters() {
    var bar = document.querySelector("[data-gallery-filters]");
    if (!bar) return;

    bar.addEventListener("click", function (e) {
      var t = e.target;
      if (t.tagName !== "BUTTON" || !t.hasAttribute("data-filter")) return;
      var filter = t.getAttribute("data-filter");
      bar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.toggle("is-active", b === t);
      });
      document.querySelectorAll("[data-gallery-item]").forEach(function (item) {
        var cat = item.getAttribute("data-category") || "";
        var show = filter === "all" || cat === filter;
        item.classList.toggle("is-hidden", !show);
      });
    });
  }

  function initHashScroll() {
    if (!location.hash) return;
    var id = location.hash.slice(1);
    var el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(function () {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function initBackToTop() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>';
    document.body.appendChild(btn);

    window.addEventListener("scroll", function () {
      if (window.scrollY > 400) {
        btn.classList.add("is-visible");
      } else {
        btn.classList.remove("is-visible");
      }
    });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initDashboardTabs() {
    var nav = document.querySelector(".dash__sidebar .dash__nav");
    if (!nav) return;

    var sections = document.querySelectorAll(".dash-section");
    var links = nav.querySelectorAll("a");

    function showSection(id) {
      var targetId = id.replace("#", "");
      var found = false;
      sections.forEach(function (sec) {
        var isMatch = sec.id === targetId;
        sec.classList.toggle("is-active", isMatch);
        if (isMatch) found = true;
      });

      // If hash is invalid, default to overview
      if (!found && targetId !== "overview") {
        showSection("overview");
        return;
      }

      links.forEach(function (link) {
        var href = link.getAttribute("href");
        var isMatch = href.indexOf("#" + targetId) !== -1;
        if (isMatch) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    }

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        var href = link.getAttribute("href");
        if (href.indexOf("#") !== -1) {
          var id = href.split("#")[1];
          if (document.getElementById(id)) {
            showSection(id);
          }
        }
      });
    });

    window.addEventListener("hashchange", function () {
      var id = location.hash.slice(1);
      if (id) showSection(id);
    });

    // Initial load
    var initialId = location.hash.slice(1) || "overview";
    showSection(initialId);
  }

  function initDashMenu() {
    var toggle = document.querySelector("[data-dash-menu-toggle]");
    var sidebar = document.querySelector("[data-dash-sidebar]");
    if (!toggle || !sidebar) return;

    function close() {
      sidebar.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var open = sidebar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    sidebar.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 960px)").matches) close();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initRtl();
    initMenu();
    initBackToTop();
    initPasswordToggles();
    initGalleryFilters();
    initDashboardTabs();
    initDashMenu();
    initHashScroll();
  });
})();
