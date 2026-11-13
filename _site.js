/* PayGate shared behaviour: theme switch, code tabs, entrance reveal */
(() => {
  const root = document.documentElement;
  const KEY = "pg-theme";
  try { const saved = localStorage.getItem(KEY); if (saved) root.dataset.theme = saved; } catch (e) {}

  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const sync = () => document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
    b.setAttribute("aria-pressed", String(isDark()));
    const l = b.querySelector("span"); if (l) l.textContent = isDark() ? "Light mode" : "Dark mode";
  });

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-theme-toggle]");
    if (t) {
      root.dataset.theme = isDark() ? "light" : "dark";
      try { localStorage.setItem(KEY, root.dataset.theme); } catch (err) {}
      sync();
    }
    const tab = e.target.closest("[data-code-tab]");
    if (tab) {
      const box = tab.closest(".code");
      box.querySelectorAll("[data-code-tab]").forEach((b) => b.setAttribute("aria-selected", String(b === tab)));
      box.querySelectorAll("[data-code-pane]").forEach((p) => { p.hidden = p.dataset.codePane !== tab.dataset.codeTab; });
    }
  });

  const boot = () => {
    sync();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.gsap || reduce) return;
    // one authored entrance: the hero headline resolves out of blur; content is visible by default
    const hero = document.querySelector("[data-reveal]");
    if (hero) {
      gsap.from(hero.querySelectorAll("[data-reveal-item]"), {
        y: 14, opacity: 0, filter: "blur(8px)", duration: 0.6, ease: "expo.out", stagger: 0.05, clearProps: "filter,opacity,transform",
      });
    }
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
