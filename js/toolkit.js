const SPEED = 46;
const RELAX = 0.7;
const POINTER_RADIUS = 170;
const POINTER_FORCE = 2600;
const MAX_SPEED = 180;

function startToolkitField(container) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const items = Array.from(container.children);
  const pointer = { x: 0, y: 0, active: false };
  let bodies = [];
  let width = 0;
  let height = 0;
  let seeded = false;
  let last = performance.now();
  let running = true;
  let frame = null;

  function seed() {
    width = container.clientWidth;
    height = container.clientHeight;
    if (width < 1 || height < 1) return;
    seeded = true;

    const columns = Math.max(1, Math.ceil(Math.sqrt(items.length * (width / height))));
    const rows = Math.ceil(items.length / columns);

    bodies = items.map(function (element, index) {
      const radius = element.offsetWidth / 2;
      const column = index % columns;
      const row = Math.floor(index / columns);
      const angle = Math.random() * Math.PI * 2;
      return {
        x: ((column + 0.5) / columns) * width + (Math.random() - 0.5) * 12,
        y: ((row + 0.5) / rows) * height + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * SPEED,
        vy: Math.sin(angle) * SPEED,
        r: radius,
        element: element
      };
    });
  }

  function moveBody(body, dt) {
    if (pointer.active) {
      const dx = body.x - pointer.x;
      const dy = body.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < POINTER_RADIUS && distance > 0.01) {
        const falloff = 1 - distance / POINTER_RADIUS;
        const push = (POINTER_FORCE * falloff * falloff * dt) / distance;
        body.vx += dx * push;
        body.vy += dy * push;
      }
    }

    const speed = Math.hypot(body.vx, body.vy);
    if (speed > 0.01) {
      const eased = speed + (SPEED - speed) * Math.min(RELAX * dt, 1);
      const scale = Math.min(eased, MAX_SPEED) / speed;
      body.vx *= scale;
      body.vy *= scale;
    } else {
      const angle = Math.random() * Math.PI * 2;
      body.vx = Math.cos(angle) * SPEED;
      body.vy = Math.sin(angle) * SPEED;
    }

    body.x += body.vx * dt;
    body.y += body.vy * dt;

    if (body.x - body.r < 0) {
      body.x = body.r;
      body.vx = Math.abs(body.vx);
    } else if (body.x + body.r > width) {
      body.x = width - body.r;
      body.vx = -Math.abs(body.vx);
    }

    if (body.y - body.r < 0) {
      body.y = body.r;
      body.vy = Math.abs(body.vy);
    } else if (body.y + body.r > height) {
      body.y = height - body.r;
      body.vy = -Math.abs(body.vy);
    }
  }

  function collide(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const minimum = a.r + b.r;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared === 0 || distanceSquared >= minimum * minimum) return;

    const distance = Math.sqrt(distanceSquared);
    const nx = dx / distance;
    const ny = dy / distance;
    const overlap = (minimum - distance) / 2;

    a.x -= nx * overlap;
    a.y -= ny * overlap;
    b.x += nx * overlap;
    b.y += ny * overlap;

    const an = a.vx * nx + a.vy * ny;
    const bn = b.vx * nx + b.vy * ny;
    const difference = bn - an;
    a.vx += difference * nx;
    a.vy += difference * ny;
    b.vx -= difference * nx;
    b.vy -= difference * ny;
  }

  function step(now) {
    if (!running) return;

    if (!seeded) {
      seed();
      last = now;
      frame = requestAnimationFrame(step);
      return;
    }

    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    bodies.forEach(function (body) {
      moveBody(body, dt);
    });

    for (let i = 0; i < bodies.length; i += 1) {
      for (let j = i + 1; j < bodies.length; j += 1) {
        collide(bodies[i], bodies[j]);
      }
    }

    bodies.forEach(function (body) {
      body.element.style.transform = "translate3d(" + (body.x - body.r) + "px, " + (body.y - body.r) + "px, 0)";
    });

    frame = requestAnimationFrame(step);
  }

  seed();
  frame = requestAnimationFrame(step);

  document.addEventListener("visibilitychange", function () {
    const awake = !document.hidden;
    if (awake && !running) {
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(step);
    } else if (!awake && running) {
      running = false;
      cancelAnimationFrame(frame);
    }
  });

  new ResizeObserver(function () {
    if (seeded && Math.abs(container.clientWidth - width) < 2 && Math.abs(container.clientHeight - height) < 2) return;
    seed();
  }).observe(container);

  container.addEventListener("pointermove", function (event) {
    const box = container.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
    pointer.active = true;
  });

  container.addEventListener("pointerleave", function () {
    pointer.active = false;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const field = document.querySelector(".toolkit-field");
  if (field) startToolkitField(field);
});
