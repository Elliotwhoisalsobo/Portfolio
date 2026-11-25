const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");
const root = resolve(__dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

const script = read("js/project-cat.js");

test("De uitgeschakelde kat bewaart de PNG en aparte lagen voor kop, lijf en staart", () => {
  const html = read("index.html");
  const svg = html.match(/<svg class="project-cat"[\s\S]*?<\/svg>/)[0];
  assert.match(svg, /viewBox="0 0 462 1016" aria-hidden="true"/);
  assert.equal([...svg.matchAll(/href="img\/project-cat.png"/g)].length, 3);
  assert.ok(existsSync(resolve(root, "img/project-cat.png")));
  for (const part of ["head", "body", "tail"]) {
    assert.ok(svg.includes(`id="project-cat-${part}-clip"`));
    assert.ok(svg.includes(`clip-path="url(#project-cat-${part}-clip)"`));
  }
  assert.match(html, /src="js\/project-cat.js" defer/);
  assert.match(html, /class="cat-motion-toggle"[^>]* hidden/);
  const css = read("css/style.css");
  assert.match(css, /--project-cat-width: 80px/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.project-cat\.is-animated/);
  assert.match(css, /animation-play-state: paused/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.cat-motion-toggle \{ display: none;/);
});

test("De projectkat, pauzeknop, extra ruimte en het script zijn uitgeschakeld", () => {
  const activeHtml = read("index.html").replace(/<!--[\s\S]*?-->/g, "");
  assert.doesNotMatch(activeHtml, /project-cat|cat-motion-toggle|work-col-cat/);
  assert.match(activeHtml, /class="group-label"/);
});

test("Pauzeren en hervatten veranderen beide animaties en de knopstatus", () => {
  const classes = new Set();
  const cat = {
    classList: {
      add: (name) => classes.add(name),
      toggle(name) {
        if (classes.has(name)) { classes.delete(name); return false; }
        classes.add(name);
        return true;
      },
    },
  };
  const attributes = { "aria-pressed": "false" };
  const icon = { className: "ph ph-pause" };
  let click;
  const button = {
    hidden: true,
    setAttribute: (name, value) => { attributes[name] = value; },
    querySelector: () => icon,
    addEventListener: (name, handler) => { assert.equal(name, "click"); click = handler; },
  };
  runInNewContext(script, { document: { querySelector: (selector) => selector === ".project-cat" ? cat : button } });
  assert.equal(button.hidden, false);
  assert.ok(classes.has("is-animated"));
  for (let cycle = 0; cycle < 2; cycle++) {
    click();
    assert.ok(classes.has("is-paused"));
    assert.equal(attributes["aria-pressed"], "true");
    assert.equal(attributes["aria-label"], "Kattenanimatie hervatten");
    assert.equal(icon.className, "ph ph-play");
    click();
    assert.ok(!classes.has("is-paused"));
    assert.equal(attributes["aria-pressed"], "false");
    assert.equal(attributes["aria-label"], "Kattenanimatie pauzeren");
    assert.equal(icon.className, "ph ph-pause");
  }
});

test("Pagina’s zonder kat of knop blijven werken", () => {
  for (const missing of [".project-cat", ".cat-motion-toggle"]) {
    assert.doesNotThrow(() => runInNewContext(script, {
      document: { querySelector: (selector) => selector === missing ? null : {} },
    }));
  }
});
