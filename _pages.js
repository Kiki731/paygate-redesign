/* Sub-page behaviour: support issue picker, legal document tabs. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]still\b/.test(location.search);
  const G = window.gsap && !reduce ? gsap : null;

  /* support: what happened? */
  $$("[data-issue]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-issue]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $$("[data-issue-pane]").forEach((p) => (p.hidden = p.dataset.issuePane !== b.dataset.issue));
    const p = $(`[data-issue-pane="${b.dataset.issue}"]`);
    if (G) G.fromTo(p, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" });
  }));

  /* legal: one document at a time, follows the URL hash */
  const docs = $$(".legal__doc");
  if (docs.length) {
    const show = () => {
      const id = (location.hash || "#terms").slice(1), hit = docs.find((d) => d.id === id) ? id : "terms";
      docs.forEach((d) => (d.hidden = d.id !== hit));
      $$("[data-legal]").forEach((a) => (a.dataset.legal === hit ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    };
    addEventListener("hashchange", () => { show(); scrollTo({ top: 0 }); });
    show();
  }
})();
