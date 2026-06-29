const links = Array.from(document.querySelectorAll("[data-view-link]"));
const views = Array.from(document.querySelectorAll("[data-view]"));

function activateView(name) {
  views.forEach((view) => {
    view.classList.toggle("active", view.dataset.view === name);
  });

  links.forEach((link) => {
    link.classList.toggle("active", link.dataset.viewLink === name);
  });
}

function viewFromHash() {
  const hash = window.location.hash.replace("#", "");
  return views.some((view) => view.dataset.view === hash) ? hash : "linkdin";
}

links.forEach((link) => {
  link.addEventListener("click", () => {
    activateView(link.dataset.viewLink);
  });
});

window.addEventListener("hashchange", () => activateView(viewFromHash()));
activateView(viewFromHash());
