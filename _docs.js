/* PayGate Docs: language tabs that stay in sync, copy buttons, scroll-spy, mobile menu, ⌘K search. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]still\b/.test(location.search);
  const icons = () => lucide.createIcons({ attrs: { "stroke-width": 1.75, "aria-hidden": "true" } });

  /* one language choice applies to every code block that has it (remembered for the visit) */
  const setLang = (lang) => {
    $$(".code").forEach((box) => {
      if (!$(`[data-code-tab="${lang}"]`, box)) return;
      $$("[data-code-tab]", box).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.codeTab === lang)));
      $$("[data-code-pane]", box).forEach((p) => (p.hidden = p.dataset.codePane !== lang));
    });
    try { sessionStorage.setItem("pg-lang", lang); } catch (e) {}
  };
  document.addEventListener("click", (e) => { const t = e.target.closest("[data-code-tab]"); if (t) setLang(t.dataset.codeTab); });
  try { const l = sessionStorage.getItem("pg-lang"); if (l) setLang(l); } catch (e) {}

  /* copy */
  const flash = (btn, ok = "Copied") => {
    const label = [...btn.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    btn.innerHTML = '<i data-lucide="check"></i>' + (label ? ok : ""); icons();
    if (!label) btn.setAttribute("aria-label", ok);
    setTimeout(() => { btn.innerHTML = '<i data-lucide="copy"></i>' + (label ? "Copy" : ""); icons(); }, 1500);
  };
  const write = async (text) => { try { await navigator.clipboard.writeText(text); } catch (e) {} };
  $$("[data-copy-code]").forEach((b) => b.addEventListener("click", () => {
    const pre = $$("pre", b.closest(".code")).find((p) => !p.hidden);
    write(pre.innerText); flash(b);
  }));
  $$("[data-copy-text]").forEach((b) => b.addEventListener("click", () => { write(b.dataset.copyText); flash(b); }));

  /* scroll-spy: highlight the current step in the menu */
  const toc = $$("[data-toc] a");
  const map = new Map(toc.map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { toc.forEach((a) => a.classList.remove("is-on")); map.get(en.target.id)?.classList.add("is-on"); } });
  }, { rootMargin: "-20% 0px -70% 0px" });
  $$(".dsec").forEach((s) => map.has(s.id) && spy.observe(s));

  /* mobile menu */
  const menuBtn = $("[data-dmenu]"), side = $("#dside");
  const setMenu = (v) => { side.classList.toggle("is-open", v); menuBtn.setAttribute("aria-expanded", String(v)); menuBtn.setAttribute("aria-label", v ? "Close docs menu" : "Open docs menu"); };
  menuBtn.addEventListener("click", () => setMenu(!side.classList.contains("is-open")));
  $$("a", side).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* theme icon */
  const themeBtn = $("[data-theme-toggle]");
  const syncTheme = () => {
    const t = document.documentElement.dataset.theme, dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    themeBtn.innerHTML = `<i data-lucide="${dark ? "sun" : "moon"}"></i>`; themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme"); icons();
  };
  themeBtn.addEventListener("click", () => setTimeout(syncTheme, 0)); syncTheme();

  /* ⌘K search over the docs menu */
  const pal = $("[data-palette]"), input = $("[data-palette-input]"), list = $("[data-palette-list]");
  const items = $$(".dside a").map((a) => ({ title: a.childNodes[0].textContent.trim(), group: a.closest(".dside__grp").querySelector(".dside__h").textContent.trim(), href: a.getAttribute("href") }));
  let sel = 0, opener = null;
  const render = () => {
    const q = input.value.trim().toLowerCase();
    const hits = items.filter((i) => !q || (i.title + " " + i.group).toLowerCase().includes(q)).slice(0, 10);
    sel = Math.min(sel, Math.max(0, hits.length - 1));
    list.innerHTML = hits.length ? hits.map((h, i) => `<li><a href="${h.href}" class="${i === sel ? "is-sel" : ""}">${h.title}<span>${h.group}</span></a></li>`).join("") : '<li class="empty">No results. Try “test cards” or “3-D Secure”.</li>';
  };
  const open = () => { opener = document.activeElement; pal.hidden = false; input.value = ""; sel = 0; render(); input.focus();
    if (window.gsap && !reduce) gsap.fromTo(".palette__box", { y: -8, scale: 0.98, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.25, ease: "power3.out" }); };
  const close = () => { pal.hidden = true; opener?.focus(); };
  $("[data-search]").addEventListener("click", open);
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? open() : close(); }
    else if (e.key === "/" && pal.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
    else if (!pal.hidden) {
      const links = $$("a", list);
      if (e.key === "Escape") close();
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + links.length) % Math.max(1, links.length); render(); }
      else if (e.key === "Enter" && links[sel]) { e.preventDefault(); location.hash = links[sel].getAttribute("href"); close(); }
    }
  });
  input.addEventListener("input", () => { sel = 0; render(); });
  list.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
  pal.addEventListener("click", (e) => { if (e.target === pal) close(); });

  /* feedback */
  $$("[data-helpful] button").forEach((b) => b.addEventListener("click", () => { $("[data-helpful]").innerHTML = "<span>Thanks, that helps us improve these docs.</span>"; }));

  /* micro-interactions */
  const M = window.Motion;
  if (M && !reduce) M.press("[data-press]", (el) => { M.animate(el, { scale: 0.965 }, { type: "spring", stiffness: 700, damping: 30 }); return () => M.animate(el, { scale: 1 }, { type: "spring", stiffness: 500, damping: 18 }); });
  if (window.gsap && !reduce) gsap.from(".dhead > :not(canvas)", { y: 12, opacity: 0, filter: "blur(6px)", duration: 0.7, stagger: 0.06, ease: "expo.out", clearProps: "all" });
})();
