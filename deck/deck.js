const slides = [...document.querySelectorAll("[data-slide]")];
let index = 0;
function show(next, write = true) {
  index = Math.max(0, Math.min(slides.length - 1, next));
  slides.forEach((slide, i) => (slide.hidden = i !== index));
  document.getElementById("progress").textContent =
    `${index + 1} / ${slides.length}`;
  document.getElementById("previous").disabled = index === 0;
  document.getElementById("next").disabled = index === slides.length - 1;
  if (write) history.replaceState(null, "", `#${index + 1}`);
  window.scrollTo(0, 0);
  document.title = `Make — ${index + 1} / ${slides.length}`;
}
document
  .getElementById("previous")
  .addEventListener("click", () => show(index - 1));
document
  .getElementById("next")
  .addEventListener("click", () => show(index + 1));
document
  .getElementById("print")
  .addEventListener("click", () => window.print());
document.addEventListener("keydown", (event) => {
  if (
    ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(
      document.activeElement?.tagName,
    )
  )
    return;
  if (["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    show(index + 1);
  }
  if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    show(index - 1);
  }
  if (event.key === "Home") show(0);
  if (event.key === "End") show(slides.length - 1);
});
window.addEventListener("hashchange", () =>
  show((Number(location.hash.slice(1)) || 1) - 1, false),
);
show((Number(location.hash.slice(1)) || 1) - 1, false);
