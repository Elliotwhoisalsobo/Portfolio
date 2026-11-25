"use strict";

(() => {
  const cat = document.querySelector(".project-cat");
  const button = document.querySelector(".cat-motion-toggle");
  if (!cat || !button) return;

  button.addEventListener("click", () => {
    const paused = cat.classList.toggle("is-paused");
    button.setAttribute("aria-pressed", String(paused));
    button.setAttribute("aria-label", paused ? "Kattenanimatie hervatten" : "Kattenanimatie pauzeren");
    button.querySelector("i").className = paused ? "ph ph-play" : "ph ph-pause";
  });
  button.hidden = false;
  cat.classList.add("is-animated");
})();
