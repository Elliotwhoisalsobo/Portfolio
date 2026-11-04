// Depth-design: mobiel menu, scroll-reveal, jaartal
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});

if (matchMedia("(prefers-reduced-motion: no-preference)").matches) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
}

document.getElementById("year").textContent = new Date().getFullYear();

// Wacht tot het scrollen stopt en de titel zichtbaar is.
const contactTitel = document.querySelector(".contact-title");
let contactTimer;
const wachtOpContact = () => {
  clearTimeout(contactTimer);
  removeEventListener("scroll", controleerContact);
  addEventListener("scroll", controleerContact, { passive: true });
  controleerContact();
};
const controleerContact = () => {
  clearTimeout(contactTimer);
  const rect = contactTitel.getBoundingClientRect();
  if (rect.top >= innerHeight || rect.bottom <= 0) return;
  contactTimer = setTimeout(() => {
    const rect = contactTitel.getBoundingClientRect();
    if (rect.top >= innerHeight || rect.bottom <= 0) return;
    removeEventListener("scroll", controleerContact);
    contactTitel.classList.remove("pulse-actief");
    void contactTitel.offsetWidth; // tweede klik herstart de animatie
    contactTitel.classList.add("pulse-actief");
  }, 150);
};
document.querySelector('a[href="#contact"]').addEventListener("click", () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  wachtOpContact();
});
if (location.hash === "#contact") wachtOpContact();
