/* PayGate home: motion and interactions.
   GSAP (+ScrollTrigger, SplitText) choreographs; Motion handles spring micro-interactions. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]still\b/.test(location.search);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasG = !!window.gsap;
  if (hasG) gsap.registerPlugin(ScrollTrigger, SplitText);
  const M = window.Motion;
  const naira = (n) => "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---------- decorative demo QR codes ---------- */
  $$("[data-qr]").forEach((svg, k) => {
    const N = 25, cell = []; let s = 7 + k * 13;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const finder = (x, y) => cell.push(`<rect x="${x}" y="${y}" width="7" height="7" rx="1.5" fill="#06082e"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx=".6" fill="#000bb8"/>`);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const inF = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
      if (!inF && rnd() > 0.52) cell.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="#06082e"/>`);
    }
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    svg.innerHTML = cell.join("");
  });

  /* ---------- navigation ---------- */
  const nav = $("[data-nav]");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  $$("[data-dd]").forEach((dd) => {
    const btn = $("button", dd), panel = $(".dd__panel", dd);
    const open = (v) => {
      btn.setAttribute("aria-expanded", String(v)); panel.hidden = !v;
      if (v && hasG && !reduce) gsap.fromTo(panel, { autoAlpha: 0, y: -6, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.3, ease: "power3.out", clearProps: "filter" });
    };
    btn.addEventListener("click", () => open(btn.getAttribute("aria-expanded") !== "true"));
    btn.addEventListener("keydown", (e) => { if (e.key === "ArrowDown") { e.preventDefault(); open(true); $("a", panel).focus(); } });
    dd.addEventListener("keydown", (e) => { if (e.key === "Escape") { open(false); btn.focus(); } });
    document.addEventListener("click", (e) => { if (!dd.contains(e.target)) open(false); });
    panel.addEventListener("focusout", (e) => { if (!dd.contains(e.relatedTarget)) open(false); });
  });

  const menuBtn = $("[data-menu]"), drawer = $("#drawer");
  menuBtn?.addEventListener("click", () => {
    const v = menuBtn.getAttribute("aria-expanded") !== "true";
    menuBtn.setAttribute("aria-expanded", String(v)); drawer.hidden = !v;
    menuBtn.setAttribute("aria-label", v ? "Close menu" : "Open menu");
    menuBtn.innerHTML = `<i data-lucide="${v ? "x" : "menu"}"></i>`; lucide.createIcons({ attrs: { "stroke-width": 1.75, "aria-hidden": "true" } });
    if (v && hasG && !reduce) gsap.from($$("a", drawer), { y: 10, opacity: 0, stagger: 0.03, duration: 0.35, ease: "power3.out" });
  });
  $$("a", drawer).forEach((a) => a.addEventListener("click", () => { if (menuBtn.getAttribute("aria-expanded") === "true") menuBtn.click(); }));

  /* theme icon reflects state */
  const themeBtn = $("[data-theme-toggle]");
  const syncThemeIcon = () => {
    const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    themeBtn.innerHTML = `<i data-lucide="${dark ? "sun" : "moon"}"></i>`;
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    lucide.createIcons({ attrs: { "stroke-width": 1.75, "aria-hidden": "true" } });
  };
  themeBtn?.addEventListener("click", () => setTimeout(syncThemeIcon, 0)); syncThemeIcon();

  /* ---------- spring micro-interactions (Motion) ---------- */
  if (M && !reduce) {
    M.press("[data-press]", (el) => {
      M.animate(el, { scale: 0.965 }, { type: "spring", stiffness: 700, damping: 30 });
      return () => M.animate(el, { scale: 1 }, { type: "spring", stiffness: 500, damping: 18 });
    });
    M.hover("[data-lift]", (el) => {
      M.animate(el, { y: -6 }, { type: "spring", stiffness: 300, damping: 22 });
      const chip = el.querySelector(".chip"); if (chip) M.animate(chip, { y: -4 }, { type: "spring", stiffness: 260, damping: 18 });
      return () => { M.animate(el, { y: 0 }, { type: "spring", stiffness: 300, damping: 24 }); if (chip) M.animate(chip, { y: 0 }, { type: "spring", stiffness: 260, damping: 20 }); };
    });
    M.hover("[data-rail]", (el) => {
      const frag = el.querySelector(".frag"), ico = el.querySelector(".rail__ico"), flip = el.querySelector("[data-flip]");
      M.animate(frag, { y: -4, scale: 1.02 }, { type: "spring", stiffness: 320, damping: 20 });
      M.animate(ico, { rotate: -8, scale: 1.08 }, { type: "spring", stiffness: 400, damping: 14 });
      if (flip) { flip.textContent = "Received"; flip.className = "badge badge--ok"; }
      return () => {
        M.animate(frag, { y: 0, scale: 1 }, { type: "spring", stiffness: 300, damping: 22 });
        M.animate(ico, { rotate: 0, scale: 1 }, { type: "spring", stiffness: 300, damping: 18 });
        if (flip) { flip.textContent = "Waiting"; flip.className = "badge badge--wait"; }
      };
    });
  }

  /* ---------- the haze breathes ---------- */
  const hazes = $$("[data-haze]");
  if (hasG && !reduce) {
    hazes.forEach((h, i) => {
      const band = h.classList.contains("haze--band");
      gsap.set(h, { opacity: 0.9 });
      gsap.to(h, { xPercent: band ? gsap.utils.random(-6, 6) : gsap.utils.random(-4, 4), scaleX: gsap.utils.random(1.04, 1.12), scaleY: gsap.utils.random(0.9, 1.15),
        duration: gsap.utils.random(7, 11), ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.4 });
    });
  }
  /* brighten the haze when money lands */
  window.PG = Object.assign(window.PG || {}, {
    pulseNear(node) {
      if (!hasG || reduce) return;
      const scope = node.closest(".hero__stage, .icard, section") || document;
      $$("[data-haze]", scope).forEach((h) => gsap.fromTo(h, { opacity: 0.9 }, { opacity: 1, scaleY: "+=0.25", duration: 0.6, ease: "power2.out", yoyo: true, repeat: 1 }));
    },
  });

  /* ---------- animated text ---------- */
  const splitWords = (el) => (window.SplitText ? new SplitText(el, { type: "words", wordsClass: "w" }).words : []);

  if (hasG && !reduce) {
    // hero: words resolve from blur, then the rest rises (content is visible by default)
    const heroH = $(".hero h1");
    const hw = splitWords(heroH);
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(hw, { opacity: 0, y: 14, filter: "blur(10px)", duration: 0.9, stagger: 0.045, clearProps: "filter" })
      .from($$(".hero [data-rise]").filter((el) => !el.matches(".hero__stage, .split__stage, .ab-media, .pg-code")), { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 }, "-=0.55")
      // the product stage only moves: it is never invisible, even on a slow phone
      .from($$(".hero__stage, .split__stage, .ab-media, .pg-code"), { y: 28, scale: 0.985, duration: 1.1, clearProps: "transform" }, "<0.1");

    // section headings: word reveal once, when they enter
    $$("[data-words]").forEach((h) => {
      if (h === heroH) return;
      const w = splitWords(h);
      gsap.from(w, { opacity: 0, y: 10, filter: "blur(8px)", duration: 0.8, stagger: 0.035, ease: "expo.out", clearProps: "filter",
        scrollTrigger: { trigger: h, start: "top 85%", once: true } });
    });

    // statement: words sharpen as you scroll (Interfere's quote)
    $$("[data-scrub]").forEach((q) => {
      const w = splitWords(q);
      gsap.fromTo(w, { opacity: 0.12, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", stagger: 0.12, ease: "none",
        scrollTrigger: { trigger: q, start: "top 82%", end: "bottom 48%", scrub: 0.6 } });
    });
  }

  /* ---------- count-up ---------- */
  $$("[data-count]").forEach((el) => {
    const target = +el.dataset.count;
    if (!hasG || reduce) { el.textContent = naira(target); return; }
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: "top 95%", once: true, onEnter: () =>
      gsap.to(o, { v: target, duration: 1.8, ease: "power3.out", onUpdate: () => (el.textContent = naira(Math.round(o.v))) }) });
  });

  /* ---------- live payments feed ---------- */
  const PEOPLE = ["Chiamaka O.", "Bello Stores", "Ife A.", "Musa K.", "Grace E.", "Tunde B.", "Amaka N.", "Yusuf D.", "Kemi L.", "Obinna C.", "Halima S.", "Segun F."];
  const CH = [["Card", "credit-card"], ["Transfer", "landmark"], ["NQR", "qr-code"], ["POS", "smartphone-nfc"]];
  let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const icons = () => lucide.createIcons({ attrs: { "stroke-width": 1.75, "aria-hidden": "true" } });
  const makeItem = (who, ch, ico, amt, when) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="feed__ico"><i data-lucide="${ico}"></i></span><b>${who}</b><span class="num">${naira(amt)}</span><span class="meta">${ch} · ${when}</span><span class="badge badge--ok">Successful</span>`;
    return li;
  };
  const feed = $("[data-feed]");
  if (feed) {
    // earlier payments today (history); new ones arrive only when the film's payment lands
    for (let i = 0; i < 5; i++) {
      const [ch, ico] = CH[Math.floor(rnd() * CH.length)];
      feed.appendChild(makeItem(PEOPLE[Math.floor(rnd() * PEOPLE.length)], ch, ico, Math.round((1500 + rnd() * 120000) / 50) * 50, `${2 + i * 3} min ago`));
    }
    icons();
  }

  /* one clock for the hero: the film's "payment landed" moment drives the chip, the feed and the total */
  const METHOD = { card: ["Card", "credit-card"], transfer: ["Transfer", "landmark"], nqr: ["NQR", "qr-code"], pos: ["POS", "smartphone-nfc"] };
  const BUYERS = ["Chiamaka O.", "Ngozi A.", "Tunde B.", "Halima S."];
  let buyer = 0;
  const chip = $("[data-chip]"), totalEl = $("[data-count]");
  document.addEventListener("pg:paid", (e) => {
    if (!hasG || reduce) return;
    const { method, amount } = e.detail, [label, ico] = METHOD[method] || METHOD.card;
    if (chip) gsap.to(chip, { y: 8, opacity: 0, filter: "blur(4px)", duration: 0.25, ease: "power2.in", onComplete: () => {
      chip.innerHTML = `<span class="dot"><i data-lucide="${ico}"></i></span><span><strong>₦${amount.toLocaleString("en-NG")} received</strong><span>${label} · just now</span></span>`;
      icons(); gsap.to(chip, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "back.out(2)", clearProps: "filter" });
    } });
    if (feed && feed.offsetParent) {
      const li = makeItem(BUYERS[buyer++ % BUYERS.length], label, ico, amount, "just now");
      feed.prepend(li); icons();
      gsap.from(li, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, duration: 0.5, ease: "power3.out" });
      const last = feed.lastElementChild; gsap.to(last, { opacity: 0, duration: 0.3, onComplete: () => last.remove() });
    }
    if (totalEl) { const now = +totalEl.dataset.count + amount; totalEl.dataset.count = now; totalEl.textContent = naira(now); }
  });

  /* ---------- rails: currency + copy ---------- */
  $$("[data-cur]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-cur]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    const amt = $("[data-cur-amt]"); amt.textContent = b.dataset.cur === "usd" ? "$160.00" : "₦250,000.00";
    if (hasG && !reduce) gsap.fromTo(amt, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" });
  }));
  $$("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText("https://pay.paygate.example/adaeze"); } catch (e) {}
    b.textContent = "Copied"; setTimeout(() => (b.textContent = "Copy"), 1600);
  }));

  /* ---------- dashboard tour ---------- */
  const tour = $("[data-tour]");
  if (tour) {
    const tabs = $$("[role=tab]", tour), panes = $$("[role=tabpanel]", tour);
    // Plays by itself: the blue line is a loader, then the next tab opens.
    // A click pauses autoplay so the visitor can explore; leaving the section resets it to play again.
    let idx = 0, bar = null, userPaused = false, inView = false;
    const canAuto = () => hasG && !reduce && !userPaused;
    const DUR = 6;
    /* each view acts out a few seconds of a real working day while it is open */
    const rowsBody = $("[data-rows]", tour), ROWS0 = rowsBody?.innerHTML;
    const kpis = $$(".kpi .num", tour), KPI0 = kpis.map((k) => k.textContent);
    const teamList = $(".team", tour), TEAM0 = teamList?.innerHTML;
    const logList = $(".log", tour), LOG0 = logList?.innerHTML;
    const splitNums = $$(".split-row .num", tour), SPLIT0 = splitNums.map((n) => n.textContent);
    const splitToast = $("#v-split .toast", tour), TOAST0 = splitToast?.innerHTML;
    const exportBtn = $("[data-export]", tour);
    const short = (n) => "₦" + Math.round(n).toLocaleString("en-NG");
    const kv = { ok: 4812350, wait: 120000 };
    const countTo = (el, from, to, fmt = short) => { const o = { v: from }; return gsap.to(o, { v: to, duration: 0.9, ease: "power2.out", onUpdate: () => (el.textContent = fmt(o.v)) }); };
    const pop = (el) => gsap.fromTo(el, { scale: 0.8 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
    const setBadge = (b, kind, text) => { b.className = "badge badge--" + kind; b.textContent = text; pop(b); };
    const addRow = (ref, who, ch, amt, status) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td class="num" style="text-align:left">${ref}</td><td class="hide-sm">${who}</td><td>${ch}</td><td class="num">${naira(amt)}</td><td><span class="badge badge--${status === "Pending" ? "wait" : "ok"}">${status}</span></td>`;
      rowsBody.prepend(tr);
      gsap.fromTo(tr, { opacity: 0, y: -10, backgroundColor: "rgba(42,59,255,.08)" }, { opacity: 1, y: 0, backgroundColor: "rgba(42,59,255,0)", duration: 1.2, ease: "power3.out", clearProps: "backgroundColor" });
      while (rowsBody.children.length > 5) rowsBody.lastElementChild.remove();
      return tr;
    };
    const PLAYS = {
      "v-live": (tl) => {
        rowsBody.innerHTML = ROWS0; kpis.forEach((k, i) => (k.textContent = KPI0[i])); kv.ok = 4812350; kv.wait = 120000;
        let ngozi;
        tl.call(() => { ngozi = addRow("PG-7F3A2B", "Ngozi A.", "Card", 45000, "Pending"); countTo(kpis[1], kv.wait, (kv.wait += 45000)); }, null, 0.9)
          .call(() => { setBadge(ngozi.querySelector(".badge"), "ok", "Successful"); countTo(kpis[0], kv.ok, (kv.ok += 45000)); countTo(kpis[1], kv.wait, (kv.wait -= 45000)); }, null, 2.2)
          .call(() => { addRow("PG-7F3A2C", "Kola T.", "NQR", 3200, "Successful"); countTo(kpis[0], kv.ok, (kv.ok += 3200)); }, null, 3.4)
          .call(() => {
            const bello = [...rowsBody.children].find((r) => r.textContent.includes("Bello Stores"));
            if (bello) setBadge(bello.querySelector(".badge"), "ok", "Successful");
            countTo(kpis[0], kv.ok, (kv.ok += 120000)); countTo(kpis[1], kv.wait, (kv.wait -= 120000));
          }, null, 4.5);
      },
      "v-split": (tl) => {
        splitToast.innerHTML = TOAST0; gsap.set(splitToast, { autoAlpha: 0, y: 8 });
        splitNums.forEach((n, i) => { const to = +SPLIT0[i].replace(/[^\d.]/g, ""); n.textContent = naira(0); tl.add(countTo(n, 0, to, naira), 0.25 + i * 0.12); });
        tl.to(splitToast, { autoAlpha: 1, y: 0, duration: 0.45, ease: "back.out(2)" }, 1.5)
          .call(() => { splitToast.querySelector("strong").textContent = "3 settlements sent"; splitToast.querySelector("div span").textContent = "University, faculty and hostel accounts credited"; pop(splitToast.querySelector(".toast__icon")); }, null, 3.4);
      },
      "v-team": (tl) => {
        teamList.innerHTML = TEAM0;
        tl.call(() => {
          const li = document.createElement("li");
          li.innerHTML = `<span class="avatar" style="background:#067a40">KL</span><span>Kemi Lawal</span><span class="role">Finance · invited</span><span class="toggle" aria-label="Cannot approve payouts yet"></span>`;
          teamList.appendChild(li); gsap.from(li, { opacity: 0, y: 10, duration: 0.5, ease: "power3.out" });
        }, null, 1.1)
          .call(() => { const li = teamList.lastElementChild; li.querySelector(".role").textContent = "Finance"; li.querySelector(".toggle").classList.add("on"); pop(li.querySelector(".role")); }, null, 2.8);
      },
      "v-rec": (tl) => {
        const label = $("span", exportBtn); label.textContent = "Download 1,284 payments"; exportBtn.removeAttribute("aria-busy");
        tl.to(exportBtn, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 }, 1.2)
          .call(() => { exportBtn.setAttribute("aria-busy", "true"); label.textContent = "Preparing 1,284 payments…"; }, null, 1.4)
          .call(() => { exportBtn.removeAttribute("aria-busy"); label.textContent = "Ready · october-2026.csv"; pop(exportBtn); }, null, 3.2);
      },
      "v-audit": (tl) => {
        logList.innerHTML = LOG0;
        tl.call(() => {
          const li = document.createElement("li");
          li.innerHTML = `<b>System</b> settled ₦4,980,550.00 to account ending 4412<time>Today · just now</time>`;
          logList.prepend(li); gsap.from(li, { opacity: 0, x: -10, duration: 0.5, ease: "power3.out" });
        }, null, 1.2);
      },
    };
    let paneTl = null;
    const enter = (pane) => {
      if (!hasG || reduce) return;
      paneTl?.kill(); paneTl = gsap.timeline({ paused: !inView });
      PLAYS[pane.id]?.(paneTl);
      gsap.fromTo(pane, { opacity: 0, y: 10, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out", clearProps: "filter" });
      gsap.from($$(".track i", pane), { scaleX: 0, duration: 1, ease: "expo.out", stagger: 0.12, delay: 0.15 });
      gsap.from($$("tbody tr, .team li, .log li, .opt", pane), { opacity: 0, y: 8, duration: 0.45, stagger: 0.05, ease: "power2.out", delay: 0.1 });
    };
    const runBar = (n) => {
      bar?.kill();
      $$(".bar i", tour).forEach((b) => hasG ? gsap.set(b, { scaleX: 0 }) : (b.style.transform = "scaleX(0)"));
      const b = $(".bar i", tabs[n]);
      if (canAuto()) bar = gsap.fromTo(b, { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: "none", paused: !inView, onComplete: () => show((n + 1) % tabs.length) });
      else if (hasG) gsap.set(b, { scaleX: 1 }); else b.style.transform = "scaleX(1)";
    };
    const show = (n, focus) => {
      idx = n;
      tabs.forEach((t, i) => { t.setAttribute("aria-selected", String(i === n)); t.tabIndex = i === n ? 0 : -1; });
      panes.forEach((p, i) => (p.hidden = i !== n));
      if (focus) tabs[n].focus();
      enter(panes[n]);
      runBar(n);
    };
    const pauseByUser = (n, focus) => { userPaused = true; tour.dataset.paused = ""; show(n, focus); };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => pauseByUser(i));
      t.addEventListener("keydown", (e) => {
        const k = e.key, last = tabs.length - 1; let to = null;
        if (k === "ArrowDown" || k === "ArrowRight") to = i === last ? 0 : i + 1;
        if (k === "ArrowUp" || k === "ArrowLeft") to = i === 0 ? last : i - 1;
        if (k === "Home") to = 0; if (k === "End") to = last;
        if (to !== null) { e.preventDefault(); pauseByUser(to, true); }
      });
    });
    // any interaction inside the dashboard also counts as "I'm exploring"
    $(".tour__view", tour)?.addEventListener("pointerdown", () => { if (!userPaused) pauseByUser(idx); });
    const arrive = () => { inView = true; paneTl?.resume(); if (bar && !userPaused) bar.resume(); else if (!bar) show(idx); };
    const depart = () => { inView = false; bar?.pause(); paneTl?.pause(); if (userPaused) { userPaused = false; delete tour.dataset.paused; runBar(idx); } };
    if (hasG) ScrollTrigger.create({ trigger: tour, start: "top 75%", end: "bottom 25%", onEnter: arrive, onEnterBack: arrive, onLeave: depart, onLeaveBack: depart });
    else show(0);
    // export button micro-interaction (a human click)
    $("[data-export]")?.addEventListener("click", (e) => {
      paneTl?.kill();
      const b = e.currentTarget, label = $("span", b);
      b.setAttribute("aria-busy", "true"); label.textContent = "Preparing…";
      setTimeout(() => { b.removeAttribute("aria-busy"); label.textContent = "Downloaded · demo"; }, 1200);
    });
  }

  /* ---------- terminal prints a receipt ---------- */
  const term = $("[data-terminal]");
  if (term && hasG && !reduce) {
    const rec = $(".terminal__receipt", term), scr = $(".terminal__screen", term);
    const print = () => gsap.timeline()
      .set(rec, { clipPath: "inset(100% 0 0 0)" })
      .fromTo(scr.children, { opacity: 0, y: 4 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.3 })
      .to(rec, { clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "steps(12)" }, "+=0.2")
      .fromTo(term, { y: 0 }, { y: -3, duration: 0.08, repeat: 5, yoyo: true }, "<");
    ScrollTrigger.create({ trigger: term, start: "top 85%", onEnter: print, onEnterBack: print });
    if (M) M.hover(".term__media", () => { M.animate(term, { rotate: -2, y: -6 }, { type: "spring", stiffness: 260, damping: 16 }); return () => M.animate(term, { rotate: 0, y: 0 }, { type: "spring", stiffness: 260, damping: 18 }); });
  }

  /* ---------- developers: run in sandbox ---------- */
  const run = $("[data-run]"), resp = $("[data-resp]");
  const RESP = `<span class="st">200 OK</span> · 182 ms
{
  "id": "pay_7F3A21",
  "status": "pending",
  "amount": 4500000,
  "currency": "NGN",
  "checkout_url": "https://pay.paygate.example/c/7F3A21",
  "channels": ["card", "transfer", "nqr"]
}
<span class="tok-c">// webhook → payment.successful (in a moment)</span>`;
  run?.addEventListener("click", () => {
    run.disabled = true;
    if (!hasG || reduce) { resp.innerHTML = RESP; run.disabled = false; return; }
    resp.innerHTML = '<span class="tok-c">// Sending…</span>';
    setTimeout(() => {
      resp.innerHTML = RESP;
      const lines = resp.innerHTML.split("\n");
      resp.innerHTML = lines.map((l) => `<span class="ln" style="display:block">${l || " "}</span>`).join("");
      gsap.from($$(".ln", resp), { opacity: 0, x: -6, duration: 0.3, stagger: 0.06, ease: "power2.out", onComplete: () => (run.disabled = false) });
    }, 500);
  });

  /* ---------- documents switch ---------- */
  $$("[data-doc]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-doc]").forEach((x) => { x.setAttribute("aria-pressed", String(x === b)); });
    $$("[data-doclist]").forEach((l) => (l.hidden = l.dataset.doclist !== b.dataset.doc));
    const shown = $(`[data-doclist="${b.dataset.doc}"]`);
    if (hasG && !reduce) gsap.from($$("li", shown), { opacity: 0, y: 6, stagger: 0.04, duration: 0.35, ease: "power2.out" });
  }));

  /* ---------- FAQ: smooth open/close ---------- */
  $$("[data-faq] details").forEach((d) => {
    const s = $("summary", d), a = $(".ans", d);
    s.addEventListener("click", (e) => {
      if (!hasG || reduce) return;
      e.preventDefault();
      if (d.open) gsap.to(a, { height: 0, opacity: 0, duration: 0.3, ease: "power2.inOut", onComplete: () => { d.open = false; gsap.set(a, { clearProps: "all" }); } });
      else { d.open = true; gsap.from(a, { height: 0, opacity: 0, duration: 0.4, ease: "power3.out", clearProps: "all" }); }
    });
  });

  /* ---------- contact form (demo) ---------- */
  const form = $("[data-form]");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    let first = null;
    $$("input[required]", form).forEach((inp) => {
      const f = inp.closest(".field"), hint = $(".hint", f);
      const bad = !inp.value.trim() || (inp.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value));
      f.classList.toggle("field--error", bad); inp.setAttribute("aria-invalid", String(bad));
      if (hint) { hint.hidden = !bad; hint.id = hint.id || inp.id + "-e"; inp.setAttribute("aria-describedby", hint.id); }
      if (bad && !first) first = inp;
    });
    if (first) { first.focus(); if (hasG && !reduce) gsap.fromTo(first, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" }); return; }
    form.classList.add("is-sent");
    const ok = $(".ok", form); ok.tabIndex = -1; ok.focus();
    if (hasG && !reduce) gsap.from(ok, { opacity: 0, y: 10, scale: 0.98, duration: 0.5, ease: "back.out(2)" });
  });

  /* ---------- marquee: seamless loop ---------- */
  // with motion off the row stands still, so no duplicate logos
  if (reduce) document.documentElement.classList.add("is-still");
  $$("[data-marquee]").forEach((t) => { if (reduce) return; [...t.children].forEach((c) => { const d = c.cloneNode(true); d.setAttribute("aria-hidden", "true"); d.querySelector("img").alt = ""; t.appendChild(d); }); });
})();
