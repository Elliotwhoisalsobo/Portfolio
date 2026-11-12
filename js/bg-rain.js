// Achtergrond: subtiele paarse regenstrepen met Three.js
// Geen LineBasicMaterial: die is altijd 1px dik in WebGL.
// Daarom quads (2 driehoeken per streep), zodat de dikte instelbaar is.
const AANTAL = 50;
const MOBIEL_AANTAL = 18;
const MOBIEL = matchMedia("(max-width: 700px)");
const KLEUR = 0x8b7cff;   // accent violet uit style.css

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(0, innerWidth, 0, innerHeight, -1, 1);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.getElementById("bg-app").appendChild(renderer.domElement);

// EEN mesh met 2 driehoeken per streep: goedkoop te tekenen, makkelijk te verplaatsen
// 6 vertices x 3 coördinaten per streep
const posities = new Float32Array(AANTAL * 18);
const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(posities, 3));
geometry.setDrawRange(0, (MOBIEL.matches ? MOBIEL_AANTAL : AANTAL) * 6);
const materiaal = new THREE.MeshBasicMaterial({ color: KLEUR, transparent: true, opacity: 0.25 });
scene.add(new THREE.Mesh(geometry, materiaal));

const regen = Array.from({ length: AANTAL }, () => {
  const val = 120 + Math.random() * 120; // valsnelheid in px/s, rustig
  return {
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    val,
    // vaste maat voor alle strepen, zodat het geuniformeerd stippelt
    lengte: 18,
    breedte: 3
  };
});

function stap(dt) {
  for (let i = 0; i < AANTAL; i++) {
    const d = regen[i];
    d.y += d.val * dt;
    if (d.y - d.lengte > innerHeight + 60) {
      d.y = -60;
      d.x = Math.random() * innerWidth;
    }

    // verticale streep: quad van (x - b/2, y) tot (x + b/2, y - lengte)
    const b = d.breedte / 2;
    const o = i * 18;
    posities[o]      = d.x - b; posities[o + 1]  = d.y;           posities[o + 2]  = 0;
    posities[o + 3]  = d.x + b; posities[o + 4]  = d.y;           posities[o + 5]  = 0;
    posities[o + 6]  = d.x + b; posities[o + 7]  = d.y - d.lengte; posities[o + 8]  = 0;
    posities[o + 9]  = d.x - b; posities[o + 10] = d.y;           posities[o + 11] = 0;
    posities[o + 12] = d.x + b; posities[o + 13] = d.y - d.lengte; posities[o + 14] = 0;
    posities[o + 15] = d.x - b; posities[o + 16] = d.y - d.lengte; posities[o + 17] = 0;
  }
  geometry.attributes.position.needsUpdate = true;
}

function formaat() {
  camera.right = innerWidth;
  camera.bottom = innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  geometry.setDrawRange(0, (MOBIEL.matches ? MOBIEL_AANTAL : AANTAL) * 6);
}
addEventListener("resize", formaat);

const klok = new THREE.Clock();
function lus() {
  stap(Math.min(klok.getDelta(), 0.1));
  renderer.render(scene, camera);
  requestAnimationFrame(lus);
}

lus();
