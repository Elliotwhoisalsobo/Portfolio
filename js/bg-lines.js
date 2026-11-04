// Achtergrond: statische diagonale paarse lijnen, gerenderd met Vue
const { createApp } = Vue;

const lijnen = Array.from({ length: 7 }, (_, i) => ({
  id: i,
  style: {
    "--top": `${Math.random() * 100}%`,
    "--left": `${Math.floor(Math.random() * 95)}%`,
    "--len": `${90 + Math.random() * 140}px`,
    "--hoek": `-${(20 + Math.random() * 35).toFixed(1)}deg`,
    "--opacity": (0.35 + Math.random() * 0.4).toFixed(2)
  }
}));

createApp({
  data: () => ({ lijnen }),
  template: `
    <div class="bg-lines">
      <div v-for="l in lijnen" :key="l.id" class="bg-line" :style="l.style"></div>
    </div>`
}).mount("#bg-app");
