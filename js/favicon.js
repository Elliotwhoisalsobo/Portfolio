"use strict";

// Animeert het tabblad-icoon met de frames van de slaapkat-gif.
// Chrome animeert een gif als favicon niet, daarom wisselen we zelf
// de href van de <link rel="icon"> per frame.
(() => {
  const link = document.querySelector('link[rel="icon"]');
  if (!link) return;

  const frames = 16;
  // Frametijden uit de gif zelf (250ms eerste en laatste, 190ms ertussen).
  const delays = [250, 190, 190, 190, 190, 190, 190, 190, 190, 190, 190, 190, 190, 190, 190, 250];

  // Frames voorladen zodat de animatie niet hapert.
  for (let i = 0; i < frames; i++) {
    new Image().src = "img/favicon/frame-" + String(i).padStart(2, "0") + ".png";
  }

  let i = 0;
  const show = () => {
    link.href = "img/favicon/frame-" + String(i).padStart(2, "0") + ".png";
    const delay = delays[i];
    i = (i + 1) % frames;
    setTimeout(show, delay);
  };
  show();
})();
