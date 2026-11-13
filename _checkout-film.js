/* PayGate hero: the checkout as a continuous film.
   Card → Transfer → NQR → POS, each acted out, looping forever.
   Decorative (aria-hidden); a visible Pause control sits outside it (WCAG 2.2.2). */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]still\b/.test(location.search);
  // the amount comes from data-amt on the film (a visitor's own business can change it)
  const fmt = (n) => "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const DONE = {
    card: ["Payment successful", (a) => `${a} · Visa •••• 0921`],
    transfer: ["Transfer received", (a) => `${a} · confirmed instantly`],
    nqr: ["NQR payment received", (a) => `${a} · scanned from bank app`],
    pos: ["Approved at the counter", (a) => `${a} · terminal PG-0217`],
  };

  function film(root) {
    const q = (s) => root.querySelector(s);
    const pane = (m) => q(`[data-pane="${m}"]`);
    const tabs = [...root.querySelectorAll("[data-m]")];
    const done = q(".checkout__done"), doneT = done.querySelector("strong"), doneS = done.querySelector(".small");
    const cursor = q(".cursor"), body = q(".checkout__body");
    const toggle = document.querySelector(`[data-film-toggle="${root.id}"]`);
    const typed = [...root.querySelectorAll("[data-type]")];
    const pay = q('[data-pane="card"] .checkout__pay'), payLabel = pay.querySelector("[data-label]"), spin = pay.querySelector(".spin");
    const wait = q("[data-wait]"), waitRow = wait.closest(".checkout__row");
    const scan = q(".scanline"), tapcard = q(".tapcard"), waves = q(".waves"), posTxt = q("[data-pos]"), posScr = q(".pos-term__screen");

    const amt = () => +(root.dataset.amt || 45000);
    const select = (m) => {
      tabs.forEach((t) => t.classList.toggle("is-on", t.dataset.m === m));
      ["card", "transfer", "nqr", "pos"].forEach((k) => (pane(k).hidden = k !== m));
    };
    const resetAll = () => {
      typed.forEach((el) => (el.textContent = el.dataset.placeholder || ""));
      payLabel.textContent = "Pay " + fmt(amt()); spin.hidden = true;
      wait.textContent = "Waiting for your transfer"; waitRow.classList.remove("is-ok");
      posTxt.textContent = "TAP · INSERT · SWIPE"; posScr.classList.remove("is-ok");
      gsap.set([done], { autoAlpha: 0 }); gsap.set(cursor, { autoAlpha: 0 });
      gsap.set(tapcard, { x: 90, y: 30, rotate: 12, autoAlpha: 0 }); gsap.set(waves, { autoAlpha: 0 }); gsap.set(scan, { yPercent: 0, autoAlpha: 0 });
    };

    if (reduce || !window.gsap) {
      // a still, complete frame: the card pane filled in
      select("card"); typed.forEach((el) => (el.textContent = el.dataset.mask || el.dataset.type));
      tabs[0].querySelector(".ctab__bar i").style.transform = "scaleX(1)";
      if (toggle) toggle.hidden = true;
      return;
    }

    // types the masked value, so the full card number and CVV never show on screen
    const typeInto = (el, dur) => {
      const full = el.dataset.mask || el.dataset.type, o = { n: 0 };
      return gsap.to(o, { n: full.length, duration: dur, ease: "none", onUpdate: () => (el.textContent = full.slice(0, Math.round(o.n))) });
    };
    const moveCursorTo = (target) => {
      const b = body.getBoundingClientRect(), r = target.getBoundingClientRect();
      gsap.set(cursor, { autoAlpha: 1, x: b.width * 0.82, y: b.height * 0.05 });
      gsap.to(cursor, { x: r.left - b.left + r.width * 0.62, y: r.top - b.top + r.height * 0.55, duration: 0.7, ease: "power3.inOut" });
    };
    const success = (m) => {
      const [a, s] = DONE[m]; doneT.textContent = a; doneS.textContent = s(fmt(amt()));
      window.PG?.pulseNear?.(root);
      // the rest of the hero (chip, live feed, total) reacts to this one moment
      root.dispatchEvent(new CustomEvent("pg:paid", { bubbles: true, detail: { method: m, amount: amt() } }));
      gsap.fromTo(done, { autoAlpha: 0, y: 8, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power3.out" });
      gsap.fromTo(done.querySelector(".tick"), { scale: 0.5 }, { scale: 1, duration: 0.7, ease: "back.out(2.4)" });
    };
    const enterPane = (m) => gsap.fromTo(pane(m), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" });

    const scenes = {
      card: () => gsap.timeline()
        .add(enterPane("card"))
        .add(typeInto(typed[0], 1.1), "+=0.2")
        .add(typeInto(typed[1], 0.5), "+=0.15")
        .call(() => moveCursorTo(pay), null, "+=0.2")
        .to(cursor, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 }, "+=0.75")
        .to(pay, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 }, "<")
        .call(() => { spin.hidden = false; payLabel.textContent = "Processing…"; gsap.to(cursor, { autoAlpha: 0, duration: 0.3 }); })
        .call(() => success("card"), null, "+=0.9")
        .to({}, { duration: 1.9 }),
      transfer: () => gsap.timeline()
        .add(enterPane("transfer"))
        .call(() => { wait.textContent = "Transfer detected"; waitRow.classList.add("is-ok"); }, null, "+=2")
        .fromTo(waitRow, { scale: 0.98 }, { scale: 1, duration: 0.4, ease: "back.out(3)" })
        .call(() => success("transfer"), null, "+=0.5")
        .to({}, { duration: 1.9 }),
      nqr: () => gsap.timeline()
        .add(enterPane("nqr"))
        .set(scan, { autoAlpha: 1, yPercent: 0 })
        .to(scan, { yPercent: 1150, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 1 })
        .to(scan, { autoAlpha: 0, duration: 0.2 })
        .fromTo(q(".qrwrap"), { scale: 1 }, { scale: 1.04, duration: 0.18, yoyo: true, repeat: 1 })
        .call(() => success("nqr"), null, "+=0.2")
        .to({}, { duration: 1.9 }),
      pos: () => gsap.timeline()
        .add(enterPane("pos"))
        .to(tapcard, { autoAlpha: 1, x: 0, y: 0, rotate: -8, duration: 0.8, ease: "power3.out" }, "+=0.3")
        .fromTo(waves, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1.1, duration: 0.5, ease: "power2.out", repeat: 1, yoyo: true })
        .call(() => (posTxt.textContent = "READING CARD…"), null, "<")
        .call(() => { posTxt.textContent = "APPROVED"; posScr.classList.add("is-ok"); }, null, "+=0.7")
        .to(tapcard, { x: 70, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "+=0.3")
        .call(() => success("pos"), null, "-=0.1")
        .to({}, { duration: 1.9 }),
    };

    const tl = gsap.timeline({ repeat: -1, paused: true });
    ["card", "transfer", "nqr", "pos"].forEach((m, k) => {
      const scene = scenes[m]();
      const start = tl.duration();
      tl.call(() => { resetAll(); select(m); gsap.set(tabs.map((t) => t.querySelector(".ctab__bar i")), { scaleX: 0 }); }, null, start);
      tl.add(scene, start);
      tl.fromTo(tabs[k].querySelector(".ctab__bar i"), { scaleX: 0 }, { scaleX: 1, duration: scene.duration(), ease: "none" }, start);
      tl.to(done, { autoAlpha: 0, duration: 0.25 }, start + scene.duration() - 0.25);
    });

    root._tl = tl; // for review tooling
    let userPaused = false, onScreen = false;
    const sync = () => (onScreen && !userPaused && !document.hidden ? tl.play() : tl.pause());
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { threshold: 0.25 }).observe(root);
    document.addEventListener("visibilitychange", sync);
    toggle?.addEventListener("click", () => {
      userPaused = !userPaused;
      toggle.setAttribute("aria-pressed", String(userPaused));
      toggle.querySelector("span").textContent = userPaused ? "Play animation" : "Pause animation";
      toggle.querySelector("svg")?.remove();
      toggle.insertAdjacentHTML("afterbegin", `<i data-lucide="${userPaused ? "play" : "pause"}"></i>`);
      window.lucide?.createIcons({ attrs: { "stroke-width": 1.75, "aria-hidden": "true" } });
      sync();
    });
    resetAll(); select("card");
  }

  const boot = () => document.querySelectorAll("[data-film]").forEach(film);
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
