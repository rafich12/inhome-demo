/* Слайд-шоу первого экрана: фото салона сменяют друг друга каждые 5 с (плавный переход и лёгкое приближение).
   Следующий кадр грузится заранее; при «меньше движения» и на скрытой вкладке слайд-шоу стоит; кнопка — пауза. */
(function () {
  "use strict";
  const box = document.querySelector("[data-slides]");
  if (!box) return;
  const slides = [...box.querySelectorAll("img")];
  const btn = document.querySelector("[data-slides-pause]");
  const STEP = 5000;
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let i = 0, timer = 0, paused = false;

  // подставить адрес кадра, когда он понадобится (первый уже на месте)
  const load = img => {
    if (img.dataset.srcset) { img.srcset = img.dataset.srcset; delete img.dataset.srcset; }
    if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
  };
  const ready = img => img.complete && img.naturalWidth > 0
    ? Promise.resolve()
    : new Promise(r => { img.addEventListener("load", r, { once: true }); img.addEventListener("error", r, { once: true }); });

  function show(n) {
    const next = slides[n];
    load(next);
    ready(next).then(() => {
      slides[i].classList.remove("is-on");
      next.classList.add("is-on");
      i = n;
      load(slides[(n + 1) % slides.length]);   // следующий заранее
    });
  }
  const tick = () => show((i + 1) % slides.length);
  const running = () => !paused && !still.matches && !document.hidden;
  function sync() {
    clearInterval(timer);
    box.classList.toggle("is-playing", running());
    if (running()) timer = setInterval(tick, STEP);
  }

  if (btn) btn.addEventListener("click", () => {
    paused = !paused;
    btn.setAttribute("aria-pressed", String(paused));
    sync();
  });
  document.addEventListener("visibilitychange", sync);
  still.addEventListener("change", sync);
  // второй кадр начинает грузиться, когда первый уже показан
  window.addEventListener("load", () => { load(slides[1 % slides.length]); sync(); }, { once: true });
})();
