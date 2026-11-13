"use strict";

(() => {
  const contact = document.querySelector("#contact");
  const links = contact?.querySelector(".contact-list");
  if (!contact || !links) return;

  const scene = document.createElement("div");
  scene.className = "cat-scene";
  scene.dataset.variant = "doos";
  links.before(scene);
  scene.append(links);
  contact.classList.add("has-cat-footer");
  links.setAttribute("aria-label", "Sociale profielen");
  links.querySelectorAll("i").forEach((icon) => icon.setAttribute("aria-hidden", "true"));
  // De bestaande links blijven dezelfde DOM elementen, inclusief hun bestemming.
  const github = links.querySelector('a[href*="github.com"]')?.closest("li");
  if (github) links.prepend(github);

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = (tag, attrs, parent) => {
    const element = document.createElementNS(svgNS, tag);
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, String(value));
    parent.append(element);
    return element;
  };
  const back = svg("svg", { class: "cat-art", viewBox: "0 0 640 330", "aria-hidden": "true", focusable: "false" }, scene);
  const front = svg("svg", { class: "cat-art cat-art--front", viewBox: "0 0 640 330", "aria-hidden": "true", focusable: "false" }, scene);
  const ouch = svg("text", { x: 382, y: 166, class: "cat-ouch-text" }, front);
  ouch.textContent = "Boop!";
  const boop = document.createElement("button");
  boop.type = "button";
  boop.className = "cat-boop";
  boop.setAttribute("aria-label", "Geef de kat een neusduwtje");
  boop.disabled = true;
  scene.append(boop);
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const ease = (value) => { const p = clamp(value); return p * p * (3 - 2 * p); };
  const ramp = (p, start, end) => ease((p - start) / (end - start));
  const mix = (a, b, p) => a + (b - a) * p;
  const snap = (value) => Math.round(value / 2) * 2;

  function pixelPath(points) {
    let path = `M${snap(points[0][0])} ${snap(points[0][1])}`;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const steps = Math.max(1, Math.ceil(Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])) / 6));
      for (let j = 1; j <= steps; j++) path += `H${snap(mix(a[0], b[0], j / steps))}V${snap(mix(a[1], b[1], j / steps))}`;
    }
    return path;
  }

  function makeCat(color, expression) {
    const group = svg("g", { style: `--cat-paper:${color}` }, back);
    const paws = svg("g", { class: "cat-paws", style: `--cat-paper:${color}` }, front);
    const tail = svg("g", {}, group);
    const tailPath = "M28 -24H66V-32H80V-66H72V-78H52V-70H48V-54H58";
    svg("path", { d: tailPath, class: "cat-stroke" }, tail);
    svg("path", { d: tailPath, class: "cat-stroke-inner" }, tail);
    const body = svg("path", { class: "cat-shape" }, group);
    const feet = svg("g", { class: "cat-feet" }, group);
    for (const x of [-34, 10]) svg("path", { d: `M${x} -12h24v12h-32v-6h8Z`, class: "cat-shape" }, feet);
    const armLayer = svg("g", { class: "cat-arms" }, group);
    const arms = [-1, 1].map(() => ({
      edge: svg("path", { class: "cat-stroke" }, armLayer),
      inside: svg("path", { class: "cat-stroke-inner" }, armLayer),
    }));
    const headAnchor = svg("g", {}, group);
    const head = svg("g", { class: "cat-head" }, headAnchor);
    svg("path", {
      d: "M-50 24V-22H-44V-50H-32V-44H-24V-34H-16V-26H16V-34H24V-44H32V-50H44V-22H50V24H42V34H-42V24Z",
      class: "cat-shape",
    }, head);
    svg("path", { d: "M-36-40h4v8h-4ZM32-40h4v8h-4Z", class: "cat-accent" }, head);
    const eyes = svg("g", {}, head);
    if (expression === "blij") {
      svg("path", { d: "M-32 3V-5H-26V-11H-18V-5H-12V3H-18V-3H-26V3ZM12 3V-5H18V-11H26V-5H32V3H26V-3H18V3Z", class: "cat-detail" }, eyes);
    } else if (expression === "nieuwsgierig") {
      svg("rect", { x: -28, y: -9, width: 12, height: 18, class: "cat-detail" }, eyes);
      svg("rect", { x: 16, y: -9, width: 12, height: 18, class: "cat-detail" }, eyes);
    } else {
      svg("path", { d: "M-30 1h18v5h-18ZM12 1h18v5H12Z", class: "cat-detail" }, eyes);
    }
    svg("path", { d: "M-4 12H4V16H2V20H-2V16H-4Z", class: "cat-accent" }, head);
    const hands = [-1, 1].map(() => {
      const paw = svg("g", {}, paws);
      svg("path", { d: "M-12 0V-6H12V0H16V8H-16V0Z", class: "cat-paw" }, paw);
      svg("path", { d: "M-5-4V2M5-4V2", fill: "none", stroke: color, "stroke-width": 2 }, paw);
      return paw;
    });
    return { group, tail, body, feet, arms, headAnchor, eyes, hands };
  }

  function drawCat(cat, { x, floor, face, hands, scale = 1, tilt = 0, wag = 0, look = 0 }) {
    const shoulder = face + 34 * scale;
    const hip = floor - 22 * scale;
    cat.body.setAttribute("d", `M${x - 25 * scale} ${shoulder - 8 * scale}H${x + 25 * scale}L${x + 34 * scale} ${hip}V${floor - 5 * scale}H${x - 34 * scale}V${hip}Z`);
    cat.feet.setAttribute("transform", `translate(${x} ${floor}) scale(${scale})`);
    cat.tail.setAttribute("transform", `translate(${x} ${floor}) scale(${scale}) rotate(${wag} 30 -24)`);
    cat.headAnchor.setAttribute("transform", `translate(${x} ${face}) scale(${scale}) rotate(${tilt})`);
    cat.eyes.setAttribute("transform", `translate(${look} 0)`);
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const hand = hands[i];
      const elbow = [mix(x + side * 46 * scale, hand[0], 0.45), mix(shoulder + 18 * scale, hand[1], 0.48)];
      const d = pixelPath([[x + side * 26 * scale, shoulder], elbow, hand]);
      cat.arms[i].edge.setAttribute("d", d);
      cat.arms[i].inside.setAttribute("d", d);
      cat.hands[i].setAttribute("transform", `translate(${hand[0]} ${hand[1]}) scale(${scale})`);
    }
  }

  const cats = [makeCat("#f0f2f5", "blij")];
  const box = svg("g", {}, front);
  svg("path", { d: "M230 230H410V326H230Z", class: "cat-box" }, box);
  svg("path", { d: "M300 230V254H340V230M250 304H278", class: "cat-box-detail" }, box);
  const flaps = [svg("path", { class: "cat-box" }, box), svg("path", { class: "cat-box" }, box)];

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  boop.addEventListener("click", () => {
    if (boop.disabled) return;
    scene.classList.remove("is-booped");
    void scene.offsetWidth;
    scene.classList.add("is-booped");
  });
  let scale = 1;
  let trayHeight = 64;
  let previous = -1;
  let queued = false;
  let range = 1;
  let force = true;

  function measure() {
    const rect = scene.getBoundingClientRect();
    scale = back.getBoundingClientRect().width / 640;
    // Op mobiel begint het optillen pas wanneer de scène de onderrand bereikt.
    range = Math.max(1, Math.min(480, document.documentElement.scrollHeight - scrollY - rect.top));
    scene.dataset.scrollRange = String(range);
    trayHeight = links.getBoundingClientRect().height / scale;
    force = true;
    schedule();
  }

  function draw(p) {
    scene.dataset.progress = p.toFixed(3);
    const lift = ramp(p, 0.22, 1);
    const top = mix(345, 24, lift);
    links.style.setProperty("--lift", `${top * scale}px`);
    const bottom = top + trayHeight;
    const reveal = ramp(p, 0.1, 0.76);
    const canBoop = reveal >= 1;
    boop.disabled = !canBoop;
    scene.classList.toggle("is-boopable", canBoop);
    if (!canBoop) scene.classList.remove("is-booped");
    drawCat(cats[0], {
      x: 320, floor: 326,
      face: mix(365, Math.max(158, bottom + 60), reveal),
      hands: [[274, bottom + 3], [366, bottom + 3]],
      tilt: -5 * Math.sin(p * Math.PI),
      wag: 13 * Math.sin(p * Math.PI * 2),
      look: Math.round(2 * Math.sin(p * Math.PI * 2)),
    });
    const open = ramp(p, 0, 0.32);
    flaps[0].setAttribute("d", `M230 230L${mix(320, 196, open)} ${mix(218, 257, open)}L${mix(320, 196, open)} ${mix(230, 269, open)}L230 242Z`);
    flaps[1].setAttribute("d", `M410 230L${mix(320, 444, open)} ${mix(218, 257, open)}L${mix(320, 444, open)} ${mix(230, 269, open)}L410 242Z`);
  }

  function update() {
    queued = false;
    const distance = document.documentElement.scrollHeight - innerHeight - scrollY;
    const p = reducedMotion.matches || scene.contains(document.activeElement) ? 1 : clamp(1 - distance / range);
    if (force || Math.abs(p - previous) > 0.0001) {
      draw(p);
      previous = p;
      force = false;
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", measure);
  scene.addEventListener("focusin", schedule);
  scene.addEventListener("focusout", schedule);
  reducedMotion.addEventListener("change", schedule);
  new ResizeObserver(measure).observe(scene);
  document.fonts.ready.then(measure);
  measure();
})();
