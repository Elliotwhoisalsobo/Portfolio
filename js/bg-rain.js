// Achtergrond: subtiele paarse regenlijnen met Three.js
const AANTAL = 50;        // aantal lijnen, bewust schaars
const KLEUR = 0x8b7cff;   // accent violet uit style.css

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(0, innerWidth, 0, innerHeight, -1, 1);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.getElementById("bg-app").appendChild(renderer.domElement);

// EEN LineSegments met 2 vertices per lijn: goedkoop te tekenen, makkelijk te verplaatsen
const posities = new Float32Array(AANTAL * 6);
const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(posities, 3));
const materiaal = new THREE.LineBasicMaterial({ color: KLEUR, transparent: true, opacity: 0.25 });
scene.add(new THREE.LineSegments(geometry, materiaal));

const regen = Array.from({ length: AANTAL }, () => {
  const val = 120 + Math.random() * 120; // valsnelheid in px/s, rustig
  return {
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    val,
    drift: 8 + Math.random() * 14,        // bijpassende schuine helling
    // korte sporen, zodat het stippelt maar wel leesbaar blijft
    lengte: val * (0.08 + Math.random() * 0.05)
  };
});

function stap(dt) {
  for (let i = 0; i < AANTAL; i++) {
    const d = regen[i];
    d.y += d.val * dt;
    d.x -= d.drift * dt;
    if (d.y > innerHeight + 60) { d.y = -60; d.x = Math.random() * (innerWidth + 120); }
    if (d.x < -120) d.x = innerWidth + 120;

    // lijnstuk langs de bewegingsrichting, zodat het streepje "meebeweegt"
    const s = Math.hypot(d.val, d.drift);
    const ux = -d.drift / s, uy = d.val / s;
    const o = i * 6;
    posities[o] = d.x;              posities[o + 1] = d.y;            posities[o + 2] = 0;
    posities[o + 3] = d.x + ux * d.lengte; posities[o + 4] = d.y + uy * d.lengte; posities[o + 5] = 0;
  }
  geometry.attributes.position.needsUpdate = true;
}

function formaat() {
  camera.right = innerWidth;
  camera.bottom = innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener("resize", formaat);

const klok = new THREE.Clock();
function lus() {
  stap(Math.min(klok.getDelta(), 0.1));
  renderer.render(scene, camera);
  requestAnimationFrame(lus);
}

lus();
