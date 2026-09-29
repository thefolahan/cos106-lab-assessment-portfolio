const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ARROW_UP_RIGHT = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setupHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  function update() {
    const hidden = window.scrollY > header.offsetHeight;
    header.classList.toggle("is-hidden", hidden);
    header.inert = hidden;
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupMenu() {
  const menu = document.getElementById("mobile-menu");
  const openButton = document.querySelector(".burger");
  const closeButton = document.querySelector(".menu-close");
  if (!menu || !openButton || !closeButton) return;

  menu.querySelectorAll(".mobile-nav a, .mobile-cta").forEach(function (item, index) {
    item.style.transitionDelay = 0.05 * index + 0.08 + "s";
  });

  function open() {
    menu.classList.add("is-open");
    menu.inert = false;
    openButton.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function close() {
    menu.classList.remove("is-open");
    menu.inert = true;
    openButton.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  menu.inert = true;
  openButton.addEventListener("click", open);
  closeButton.addEventListener("click", close);
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", close);
  });
  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.classList.contains("is-open")) close();
  });
}

function setupPills() {
  document.querySelectorAll(".pill").forEach(function (pill) {
    const text = pill.dataset.label || pill.textContent.trim();
    pill.textContent = "";

    const readable = document.createElement("span");
    readable.className = "sr-only";
    readable.textContent = text;
    pill.appendChild(readable);

    if (pill.classList.contains("pill-outline")) {
      const fill = document.createElement("span");
      fill.className = "pill-fill";
      fill.setAttribute("aria-hidden", "true");
      pill.appendChild(fill);

      const pin = function (event) {
        const rect = pill.getBoundingClientRect();
        const x = clamp(event.clientX - rect.left, 0, rect.width);
        const y = clamp(event.clientY - rect.top, 0, rect.height);
        pill.style.setProperty("--fill-x", x + "px");
        pill.style.setProperty("--fill-y", y + "px");
        pill.style.setProperty("--fill-size", 2 * Math.hypot(rect.width, rect.height) + "px");
      };

      pill.addEventListener("pointerenter", pin);
      pill.addEventListener("pointerleave", pin);
      pill.addEventListener("focus", function () {
        if (!pill.matches(":focus-visible")) return;
        pill.style.setProperty("--fill-x", "50%");
        pill.style.setProperty("--fill-y", "50%");
      });
    }

    const label = document.createElement("span");
    label.className = "pill-label";
    label.setAttribute("aria-hidden", "true");

    Array.from(text).forEach(function (character, index) {
      const char = document.createElement("span");
      char.className = "pill-char";
      char.style.transitionDelay = index * 16 + "ms";
      char.textContent = character;
      const copy = document.createElement("span");
      copy.textContent = character;
      char.appendChild(copy);
      label.appendChild(char);
    });

    pill.appendChild(label);

    if (pill.hasAttribute("data-arrow")) {
      const arrow = document.createElement("span");
      arrow.className = "pill-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.innerHTML = ARROW_UP_RIGHT + ARROW_UP_RIGHT;
      pill.appendChild(arrow);
    }
  });
}

function setupMagnetic() {
  if (reducedMotion) return;

  document.querySelectorAll(".magnetic").forEach(function (wrapper) {
    const inner = wrapper.querySelector(".magnetic-inner");
    if (!inner) return;

    wrapper.addEventListener("pointermove", function (event) {
      if (event.pointerType !== "mouse") return;
      const rect = wrapper.getBoundingClientRect();
      const x = clamp((event.clientX - (rect.left + rect.width / 2)) * 0.35, -8, 8);
      const y = clamp((event.clientY - (rect.top + rect.height / 2)) * 0.35, -8, 8);
      inner.style.transform = "translate(" + x + "px, " + y + "px)";
    });

    wrapper.addEventListener("pointerleave", function () {
      inner.style.transform = "";
    });
  });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach(function (item) {
      item.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px -6% 0px -6%" }
  );

  items.forEach(function (item) {
    observer.observe(item);
  });
}

function setupHeadline() {
  const headline = document.querySelector("[data-headlines]");
  if (!headline) return;

  const framings = JSON.parse(headline.dataset.headlines);
  const lines = headline.querySelectorAll(".headline-text");
  let index = 0;

  lines.forEach(function (line) {
    line.addEventListener("animationend", function () {
      line.classList.remove("fade-up");
    }, { once: true });
  });

  if (reducedMotion) return;

  function swap() {
    if (document.hidden) return;
    index = (index + 1) % framings.length;
    const next = [framings[index].top, framings[index].accent, framings[index].bottom];

    lines.forEach(function (line, row) {
      const delay = row * 80;
      line.classList.remove("fade-up");
      line.style.setProperty("--row-delay", delay + "ms");
      line.classList.add("is-leaving");

      setTimeout(function () {
        line.textContent = next[row];
        line.classList.add("is-below");
        line.classList.remove("is-leaving");
        void line.offsetWidth;
        line.classList.remove("is-below");
      }, 720 + delay);
    });
  }

  setInterval(swap, 6000);
}

function setupPen() {
  const track = document.querySelector(".pen");
  if (!track) return;

  const pen = track.querySelector(".pen-body");
  const ink = track.querySelector(".pen-ink");
  const NIB = 78 / 80;
  let penY = 0;
  let tilt = 0;
  let lastY = window.scrollY;
  let settle = 0;
  let drag = { active: false, grab: 0 };

  function maxScroll() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  function render() {
    pen.style.transform = "translateY(" + penY + "px) rotate(" + tilt + "deg)";
  }

  function sync() {
    const max = maxScroll();
    track.classList.toggle("is-idle", max <= 0);
    const height = pen.offsetHeight;
    const travel = Math.max(0, track.clientHeight - height);
    const progress = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    penY = progress * travel;
    ink.setAttribute("y2", String(penY + height * NIB));
    render();
  }

  function onScroll() {
    sync();
    if (reducedMotion) return;
    const delta = window.scrollY - lastY;
    lastY = window.scrollY;
    tilt = clamp(-delta * 0.35, -14, 6);
    pen.style.transition = "transform 0.12s ease-out";
    render();
    clearTimeout(settle);
    settle = setTimeout(function () {
      tilt = 0;
      pen.style.transition = "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)";
      render();
    }, 90);
  }

  pen.addEventListener("pointerdown", function (event) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    pen.setPointerCapture(event.pointerId);
    const rect = track.getBoundingClientRect();
    drag = { active: true, grab: event.clientY - (rect.top + penY) };
    document.documentElement.style.scrollBehavior = "auto";
    pen.classList.add("is-dragging");
  });

  pen.addEventListener("pointermove", function (event) {
    if (!drag.active) return;
    const rect = track.getBoundingClientRect();
    const travel = rect.height - pen.offsetHeight;
    if (travel <= 0) return;
    const progress = clamp((event.clientY - rect.top - drag.grab) / travel, 0, 1);
    window.scrollTo({ top: progress * maxScroll(), behavior: "auto" });
  });

  function endDrag(event) {
    if (!drag.active) return;
    drag.active = false;
    if (pen.hasPointerCapture(event.pointerId)) pen.releasePointerCapture(event.pointerId);
    document.documentElement.style.scrollBehavior = "";
    pen.classList.remove("is-dragging");
  }

  pen.addEventListener("pointerup", endDrag);
  pen.addEventListener("pointercancel", endDrag);

  track.addEventListener("pointerdown", function (event) {
    if (event.button !== 0) return;
    const rect = track.getBoundingClientRect();
    const height = pen.offsetHeight;
    const travel = rect.height - height;
    if (travel <= 0) return;
    const progress = clamp((event.clientY - rect.top - height) / travel, 0, 1);
    window.scrollTo({ top: progress * maxScroll(), behavior: "smooth" });
  });

  sync();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", sync);

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(sync);
    observer.observe(document.body);
    observer.observe(track);
  }
}

function setupBackToTop() {
  const button = document.querySelector(".back-to-top");
  if (!button) return;

  function update() {
    button.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.9);
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
}

function setupFooterHeight() {
  const footer = document.querySelector(".site-footer");
  if (!footer) return;

  function update() {
    document.documentElement.style.setProperty("--footer-h", footer.offsetHeight + "px");
  }

  update();
  window.addEventListener("resize", update);
  if ("ResizeObserver" in window) new ResizeObserver(update).observe(footer);
}

function setYear() {
  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupPills();
  setupFooterHeight();
  setupHeader();
  setupMenu();
  setupMagnetic();
  setupReveal();
  setupHeadline();
  setupPen();
  setupBackToTop();
  setYear();
});
