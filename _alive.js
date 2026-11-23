/* Home "alive": the visitor sees their own business on PayGate, and the page moves with them.
   GSAP + ScrollTrigger: scroll story, counters, magnetic buttons. Anime.js: the Nigeria dot map.
   Everything is demo data, kept in this browser only. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]still\b/.test(location.search);
  const G = window.gsap && !reduce ? gsap : null;
  const icons = () => window.lucide && lucide.createIcons({ attrs: { "stroke-width": 1.75, "aria-hidden": "true" } });
  const naira = (n) => "₦" + Math.round(n).toLocaleString("en-NG") + ".00";
  const short = (n) => "₦" + Math.round(n).toLocaleString("en-NG");

  /* ---------- the five kinds of organisation PayGate serves ---------- */
  const TYPES = {
    shop: { name: "Adaeze Fabrics", place: "Balogun, Lagos", amt: 45000, bank: "your bank ••4412",
      split: [["Your business account", 80], ["Supplier", 15], ["Delivery partner"]],
      day: [
        { t: "08:05", title: "An order paid online", text: "Chiamaka pays for two yards of ankara on your website. You see it before she closes the tab.", ch: "card", who: "Chiamaka O.", amt: 45000, n: 1 },
        { t: "12:30", title: "Walk-ins pay by transfer", text: "Customers at the counter transfer to a one-time account for the exact amount. Twelve of them by lunch.", ch: "transfer", who: "12 transfers", amt: 86400, n: 12 },
        { t: "15:10", title: "A tap on your Upperlink terminal", text: "A regular taps her card on your POS. Same dashboard, same record.", ch: "pos", who: "Bimpe A.", amt: 18750, n: 1 },
        { t: "18:00", title: "Reconciled, settled tomorrow", text: "Every payment is matched to its reference. The total settles to your bank the next working day (T+1), with a breakdown of amounts and fees.", ch: "settle" },
      ] },
    hospitality: { name: "Ofada Grill & Suites", place: "Lekki, Lagos", amt: 18500, bank: "your bank ••4412",
      split: [["Restaurant account", 85], ["Delivery partner", 10], ["Staff tips"]],
      day: [
        { t: "09:15", title: "An event deposit by transfer", text: "A client pays the deposit for Saturday’s party into the account on their invoice.", ch: "transfer", who: "Kemi L.", amt: 350000, n: 1 },
        { t: "13:00", title: "Lunch rush, paid at the table", text: "Guests tap their cards on a terminal brought to the table. Nobody waits for change.", ch: "pos", who: "38 POS payments", amt: 247000, n: 38 },
        { t: "20:30", title: "Dinner and rooms on POS", text: "Card payments at reception and the bar land in the same place.", ch: "pos", who: "21 POS payments", amt: 612500, n: 21 },
        { t: "23:00", title: "The night audit is already done", text: "Every room, table and deposit is reconciled before you close, and settles to your bank T+1.", ch: "settle" },
      ] },
    school: { name: "Crestfield University", place: "Ibadan, Oyo", amt: 250000, bank: "the university account ••4412",
      split: [["University account", 70], ["Faculty account", 20], ["Hostel account"]],
      day: [
        { t: "08:00", title: "Fees open for 3,200 students", text: "Each parent gets a payment link by SMS and email, with the student’s ID already on it.", ch: "card", who: "214 fee payments", amt: 53500000, n: 214 },
        { t: "11:30", title: "Transfers matched to each student", text: "Every student has their own account number, so transfers match themselves.", ch: "transfer", who: "388 transfers", amt: 97000000, n: 388 },
        { t: "14:00", title: "Split the moment it lands", text: "Each fee is shared: 70% to the university, 20% to the faculty, 10% to the hostel.", ch: "split" },
        { t: "18:00", title: "The bursary sees every naira", text: "602 of 3,200 students paid today, all reconciled. Settlement reaches each account T+1, and the list exports for the auditors in one click.", ch: "settle" },
      ] },
    agency: { name: "State Revenue Service", place: "Alausa, Ikeja", amt: 75000, bank: "the treasury account ••4412",
      split: [["State treasury", 80], ["Local governments", 15], ["Agency operations"]],
      day: [
        { t: "07:30", title: "Levies paid online", text: "Businesses pay their annual levy on the agency website, by card or transfer.", ch: "card", who: "1,120 levy payments", amt: 84000000, n: 1120 },
        { t: "10:00", title: "Bank-branch payments matched", text: "Taxpayers who pay at a bank are matched to their assessment by reference.", ch: "transfer", who: "640 transfers", amt: 152000000, n: 640 },
        { t: "14:00", title: "Collections at the revenue office", text: "Officers take card payments on Upperlink terminals at the desk.", ch: "pos", who: "96 POS payments", amt: 7200000, n: 96 },
        { t: "17:00", title: "Reconciled, with an audit trail", text: "Every payment is matched to its assessment and settles to the treasury T+1. Fewer revenue leakages, and every user action is on record.", ch: "settle" },
      ] },
    enterprise: { name: "Zenvia Marketplace", place: "Victoria Island, Lagos", amt: 12900, bank: "312 settlement accounts",
      split: [["Seller", 85], ["Marketplace fee", 10], ["Delivery partner"]],
      day: [
        { t: "00:00", title: "Checkout runs while you sleep", text: "Thousands of orders paid through the API overnight, by card and transfer.", ch: "card", who: "4,820 API payments", amt: 62178000, n: 4820 },
        { t: "09:00", title: "Every seller gets their share", text: "Sub-merchant codes route each order to the right seller automatically.", ch: "transfer", who: "1,310 transfers", amt: 38600000, n: 1310 },
        { t: "14:00", title: "One integration, every channel", text: "Cards, transfers and POS across every store, with no new code.", ch: "pos", who: "2,240 POS payments", amt: 21400000, n: 2240 },
        { t: "18:00", title: "Reconciled for every account", text: "Sellers, partners and your platform fee are reconciled tonight and settle to their own accounts T+1.", ch: "settle" },
      ] },
  };
  const ICON = { card: "credit-card", transfer: "landmark", nqr: "qr-code", pos: "smartphone-nfc", settle: "banknote", split: "split" };
  const LABEL = { card: "Card", transfer: "Transfer", nqr: "NQR", pos: "POS" };

  /* ---------- built for how you collect: one industry at a time (nothing is remembered) ---------- */
  const COPY = {
    shop: ["Shops and SMEs", "Take cards, transfers and POS in the shop and online, sell with payment pages, and see every naira in one dashboard.", ["Start collecting", "11-signup.html"]],
    hospitality: ["Restaurants and hotels", "Deposits by transfer, and tables, rooms and bars on POS, all reconciled before you close for the night.", ["Request terminals", "#contact"]],
    school: ["Schools and universities", "Fees from thousands of parents, matched to each student and split to university, faculty and hostel accounts automatically.", ["Talk to us about school fees", "#contact"]],
    agency: ["Government and MDAs", "Collect taxes, levies and fees online, at the bank and at the desk, with fewer revenue leakages and an audit trail for every naira.", ["Collect revenue with PayGate", "#contact"]],
    enterprise: ["Enterprises and platforms", "One integration for every channel, sub-merchant routing, and settlement to hundreds of accounts on your rules.", ["Read the developer guide", "08-developers.html"]],
  };
  const PHOTO = { shop: ["market-traders.jpg", "Traders at a fruit stall"], hospitality: ["hotel-pos.jpg", "A hotel attendant holding a card terminal"], school: ["students-campus.jpg", "University students on campus"], agency: ["finance-team.jpg", "A finance team reviewing collections"], enterprise: ["enterprise-team.jpg", "A team working in a busy office"] };
  const ORDER = Object.keys(COPY);
  let ind = "shop";
  const initials = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "PG";
  const tabs = $$("[data-ind]"), panel = $("#ind-panel");
  const showInd = (k, focus) => {
    ind = k;
    const T = TYPES[k], [title, lede, [cta, href]] = COPY[k];
    tabs.forEach((t) => { const on = t.dataset.ind === k; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
    if (focus) $(`[data-ind="${k}"]`).focus();
    if (panel) panel.setAttribute("aria-labelledby", "ind-" + k);
    $("[data-ind-title]").textContent = title; $("[data-ind-lede]").textContent = lede;
    const c = $("[data-ind-cta]"); c.firstChild.textContent = cta + " "; c.setAttribute("href", href);
    $$("[data-you-label]").forEach((el) => (el.textContent = T.name));
    $$("[data-you-initials]").forEach((el) => (el.textContent = initials(T.name)));
    const ph = $("[data-you-photo]");
    if (ph && !ph.src.endsWith(PHOTO[k][0])) { ph.src = "../assets/images/web/" + PHOTO[k][0]; ph.alt = PHOTO[k][1]; }
    cur = -1; renderStory();
    if (G && panel) G.fromTo([".you__form > *", ".you__visual"], { opacity: 0.4, y: 6 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.03, ease: "power3.out", clearProps: "transform,opacity" });
  };
  // a click or key means the visitor is reading: autoplay stops
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => { dayPaused = true; showInd(t.dataset.ind); });
    t.addEventListener("keydown", (e) => {
      const last = tabs.length - 1; let to = null;
      if (e.key === "ArrowRight") to = i === last ? 0 : i + 1; if (e.key === "ArrowLeft") to = i === 0 ? last : i - 1;
      if (e.key === "Home") to = 0; if (e.key === "End") to = last;
      if (to !== null) { e.preventDefault(); dayPaused = true; showInd(tabs[to].dataset.ind, true); }
    });
  });

  /* ---------- a day on PayGate for the chosen industry: four moments, played in place ---------- */
  const dayBox = $(".day"), stepsBox = $("[data-day-steps]");
  const feedEl = $("[data-story-feed]"), totalEl = $("[data-story-total]"), countEl = $("[data-story-count]");
  let cur = -1, shownTotal = 0, shownCount = 0, dayTimer = 0, dayVisible = false, dayPaused = false;
  function renderStory() {
    if (!dayBox) return;
    const day = TYPES[ind].day;
    stepsBox.innerHTML = day.map((d, k) => `<button type="button" aria-pressed="false" data-day="${k}"><span class="num">${d.t}</span><i></i></button>`).join("");
    $$("[data-day]", stepsBox).forEach((b) => b.addEventListener("click", () => { dayPaused = true; setStep(+b.dataset.day); }));
    shownTotal = 0; shownCount = 0; setStep(reduce ? day.length - 1 : 0, true);
  }
  function setStep(i, instant) {
    const T = TYPES[ind], day = T.day;
    if (i === cur) return; const forward = i > cur; cur = i;
    $$("[data-day]", stepsBox).forEach((b, k) => { b.setAttribute("aria-pressed", String(k === i)); b.classList.toggle("is-past", k < i); });
    $("[data-day-clock]").textContent = day[i].t; $("[data-day-title]").textContent = day[i].title; $("[data-day-text]").textContent = day[i].text;
    let total = 0, count = 0; const by = { card: 0, transfer: 0, pos: 0 };
    const items = [];
    day.slice(0, i + 1).forEach((d) => {
      if (d.amt) { total += d.amt; count += d.n; by[d.ch] += d.amt; items.push(`<li><span class="ico"><i data-lucide="${ICON[d.ch]}"></i></span><b>${d.who}</b><span class="num">${short(d.amt)}</span><span class="meta">${LABEL[d.ch]} · ${d.t}</span><span class="badge badge--ok">${d.n > 1 ? "All successful" : "Successful"}</span></li>`); }
      else if (d.ch === "split") items.push(`<li><span class="ico"><i data-lucide="split"></i></span><b>${T.split.map((s) => s[0]).join(" · ")}</b><span class="num">3 shares</span><span class="meta">Split rule · ${d.t}</span><span class="badge badge--plain">Split</span></li>`);
      else items.push(`<li class="is-settle"><span class="ico"><i data-lucide="banknote"></i></span><b>Settles T+1 to ${T.bank}</b><span class="num">${short(total)}</span><span class="meta">Reconciled · ${d.t}</span><span class="badge badge--ok">Reconciled</span></li>`);
    });
    feedEl.innerHTML = items.reverse().slice(0, 3).join(""); icons();
    const bars = $$("[data-story-bars] i"); ["card", "transfer", "pos"].forEach((k, n) => bars[n].style.setProperty("--w", total ? (by[k] / total) * 100 : 0));
    if (G && !instant) {
      if (forward) G.from(feedEl.firstElementChild, { y: -12, opacity: 0, scale: 0.97, duration: 0.5, ease: "back.out(2)" });
      G.fromTo(["[data-day-title]", "[data-day-text]"], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power3.out" });
      const o = { v: shownTotal, c: shownCount };
      G.to(o, { v: total, c: count, duration: 0.9, ease: "power2.out", overwrite: true, onUpdate: () => { totalEl.textContent = naira(o.v); countEl.textContent = Math.round(o.c).toLocaleString("en-NG"); } });
    } else { totalEl.textContent = naira(total); countEl.textContent = count.toLocaleString("en-NG"); }
    shownTotal = total; shownCount = count;
  }
  if (dayBox) {
    showInd("shop");
    // plays through each industry's day, then moves to the next industry, while the section is on screen
    if (G && window.ScrollTrigger) {
      ScrollTrigger.create({ trigger: "#industries", start: "top 75%", end: "bottom 15%", onToggle: (s) => (dayVisible = s.isActive) });
      dayTimer = setInterval(() => {
        if (!dayVisible || dayPaused || document.hidden) return;
        const n = TYPES[ind].day.length;
        if (cur < n - 1) setStep(cur + 1); else showInd(ORDER[(ORDER.indexOf(ind) + 1) % ORDER.length]);
      }, 3400);
    }
  }

  /* ---------- split settlements: one payment flows into three accounts ---------- */
  const flow = $("[data-flow]");
  const PRESETS = { school: ["School fees", 70, 20], enterprise: ["Marketplace", 85, 10], agency: ["Revenue", 80, 15], shop: ["Shop", 80, 15], hospitality: ["Restaurant", 85, 10] };
  let fp = [70, 20], fType = "school", got = [0, 0, 0];
  const svg = $("[data-flow-svg]"), accts = $("[data-flow-accts]"), bar = $("[data-flow-bar]");
  const X = [100, 300, 500];
  const lanePath = (k) => `M300 0 C300 70, ${X[k]} 60, ${X[k]} 150`;
  function renderFlow(type) {
    if (!flow) return;
    fType = type || fType;
    const T = TYPES[fType];
    fp = [T.split[0][1], T.split[1][1]]; got = [0, 0, 0];
    $("[data-flow-amt]").textContent = naira(T.amt);
    svg.innerHTML = `${[0, 1, 2].map((k) => `<path class="lane lane--${k}" d="${lanePath(k)}" data-lane="${k}"/>`).join("")}<g data-coins></g>`;
    accts.innerHTML = T.split.map((s, k) => `<div class="acct" data-acct="${k}"><span class="pct" data-fpct="${k}"></span><b>${s[0]}</b><span class="num" data-fshare="${k}"></span><span class="got" data-fgot="${k}">₦0 received</span></div>`).join("");
    $$("[data-flow-presets] button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.preset === fType)));
    updateFlow();
  }
  function updateFlow() {
    const T = TYPES[fType], p = [fp[0], fp[1], 100 - fp[0] - fp[1]];
    p.forEach((v, k) => {
      $(`[data-fpct="${k}"]`).textContent = v + "%";
      $(`[data-fshare="${k}"]`).textContent = short((T.amt * v) / 100);
      $(`[data-lane="${k}"]`).style.strokeWidth = 3 + v * 0.22;
      $(`[data-seg="${k}"]`).style.width = v + "%";
    });
    const hs = $$(".flow__handle", bar);
    [fp[0], fp[0] + fp[1]].forEach((pos, k) => {
      hs[k].style.left = pos + "%";
      hs[k].setAttribute("aria-valuemin", k ? fp[0] : 0); hs[k].setAttribute("aria-valuemax", k ? 100 : fp[0] + fp[1]);
      hs[k].setAttribute("aria-valuenow", pos);
      hs[k].setAttribute("aria-label", k ? `Where ${T.split[1][0]} ends and ${T.split[2][0]} begins` : `Where ${T.split[0][0]} ends and ${T.split[1][0]} begins`);
      hs[k].setAttribute("aria-valuetext", k ? `${T.split[1][0]} ${fp[1]}%, ${T.split[2][0]} ${100 - fp[0] - fp[1]}%` : `${T.split[0][0]} ${fp[0]}%`);
    });
  }
  function setHandle(k, pos) {
    pos = Math.round(pos / 5) * 5;
    if (k === 0) { const end = fp[0] + fp[1]; fp[0] = Math.max(5, Math.min(end - 5, pos)); fp[1] = end - fp[0]; }
    else { fp[1] = Math.max(5, Math.min(95 - fp[0], pos - fp[0])) ; }
    updateFlow();
  }
  function sendPayment() {
    const T = TYPES[fType], p = [fp[0], fp[1], 100 - fp[0] - fp[1]], g = $("[data-coins]", svg);
    const src = $(".flow__src");
    if (G) G.fromTo(src, { scale: 1 }, { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1 });
    p.forEach((v, k) => {
      if (!v) return;
      const path = $(`[data-lane="${k}"]`), len = path.getTotalLength();
      const coin = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      coin.setAttribute("class", "coin"); coin.setAttribute("r", 4 + v * 0.05); g.appendChild(coin);
      const land = () => {
        coin.remove(); got[k] += (T.amt * v) / 100;
        const a = $(`[data-acct="${k}"]`); a.classList.add("is-hit"); setTimeout(() => a.classList.remove("is-hit"), 500);
        a.style.setProperty("--fill", Math.min(100, (got[k] / (T.amt * v / 100)) * 18) + "%");
        $(`[data-fgot="${k}"]`).textContent = short(got[k]) + " received";
      };
      if (!G) { land(); return; }
      const o = { t: 0 };
      G.to(o, { t: 1, duration: 0.9 + k * 0.05, delay: 0.12 * k, ease: "power2.in", onUpdate: () => { const pt = path.getPointAtLength(o.t * len); coin.setAttribute("cx", pt.x); coin.setAttribute("cy", pt.y); }, onComplete: land });
    });
  }
  if (flow) {
    $("[data-flow-presets]").innerHTML = Object.entries(PRESETS).map(([k, v]) => `<button type="button" data-preset="${k}" aria-pressed="false">${v[0]}</button>`).join("");
    $$("[data-flow-presets] button").forEach((b) => b.addEventListener("click", () => { renderFlow(b.dataset.preset); if (G) sendPayment(); }));
    $("[data-flow-send]").addEventListener("click", sendPayment);
    // drag the handles on the bar (pointer) or nudge them (arrow keys)
    $$(".flow__handle", bar).forEach((h) => {
      const k = +h.dataset.h;
      h.addEventListener("pointerdown", (e) => {
        h.setPointerCapture(e.pointerId);
        const move = (ev) => { const r = bar.getBoundingClientRect(); setHandle(k, ((ev.clientX - r.left) / r.width) * 100); };
        const up = () => { h.removeEventListener("pointermove", move); h.removeEventListener("pointerup", up); };
        h.addEventListener("pointermove", move); h.addEventListener("pointerup", up);
      });
      h.addEventListener("keydown", (e) => {
        const now = k ? fp[0] + fp[1] : fp[0], step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 }[e.key];
        if (step) { e.preventDefault(); setHandle(k, now + step); }
      });
    });
    renderFlow("school");
    // once, when it comes into view: three payments flow in on their own
    if (G) ScrollTrigger.create({ trigger: flow, start: "top 70%", once: true, onEnter: () => { sendPayment(); setTimeout(sendPayment, 1300); setTimeout(sendPayment, 2600); } });
  }

  /* ---------- how a payment moves: rows rise in, the first payment gets approved ---------- */
  if (G) {
    $$(".how__row").forEach((row, i) => {
      const ph = $(".how__ph", row), chip = $(".how__chip", row), tx = $(".how__tx", row);
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 78%", once: true } });
      tl.from(ph, { y: 30, opacity: 0, duration: 0.8, ease: "expo.out" })
        .from(tx.children, { y: 16, opacity: 0, duration: 0.6, stagger: 0.06, ease: "expo.out" }, "<0.1")
        .from(chip, { y: 12, scale: 0.9, opacity: 0, duration: 0.5, ease: "back.out(2.4)" }, "-=0.3");
      if (i === 0) tl.call(() => {
        chip.innerHTML = '<span class="dot"><i data-lucide="check"></i></span><span><strong>₦45,000 · approved</strong><span>Contactless · just now</span></span>'; icons();
        G.fromTo(chip, { scale: 0.94 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
      }, null, "+=1.4");
    });
  }

  /* ---------- the Nigeria map: customers everywhere paying one business ---------- */
  const map = $("[data-map]"), tip = $("[data-maptip]");
  const CITIES = [["Lagos", 3.38, 6.52], ["Ibadan", 3.9, 7.38], ["Abuja", 7.49, 9.06], ["Kano", 8.52, 12.0], ["Port Harcourt", 7.01, 4.82], ["Enugu", 7.5, 6.44], ["Kaduna", 7.44, 10.52], ["Benin City", 5.62, 6.34], ["Jos", 8.89, 9.9], ["Maiduguri", 13.16, 11.85], ["Calabar", 8.33, 4.95], ["Sokoto", 5.24, 13.06], ["Ilorin", 4.55, 8.5], ["Owerri", 7.03, 5.48], ["Abeokuta", 3.35, 7.15], ["Yola", 12.46, 9.2]];
  const W = 600, H = 500, LON = [2.6, 14.8], LAT = [4.2, 13.95];
  const px = (lon, lat) => [((lon - LON[0]) / (LON[1] - LON[0])) * W, ((LAT[1] - lat) / (LAT[1] - LAT[0])) * (H - 10) + 5];
  const inside = (x, y, rings) => { let c = false; rings.forEach((r) => { for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } }); return c; };
  const SVGNS = "http://www.w3.org/2000/svg";
  const CITIES_LBL = CITIES.map((c) => c[0]);
  let arcLayer = null;
  async function drawMap() {
    if (!map) return;
    try {
      const world = await (await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json")).json();
      const ng = topojson.feature(world, world.objects.countries).features.find((f) => f.id === "566");
      const polys = ng.geometry.type === "Polygon" ? [ng.geometry.coordinates] : ng.geometry.coordinates;
      const rings = polys.map((p) => p[0]);
      const dots = [];
      for (let lat = LAT[1]; lat >= LAT[0]; lat -= 0.2) for (let lon = LON[0]; lon <= LON[1]; lon += 0.2) if (inside(lon, lat, rings)) { const [x, y] = px(lon, lat); dots.push(`<circle class="d" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4"/>`); }
      const cities = CITIES.map(([n, lo, la], k) => { const [x, y] = px(lo, la); return `<circle class="ring" data-ring="${k}" cx="${x}" cy="${y}" r="4" opacity="0"/><circle class="city" cx="${x}" cy="${y}" r="3.6"/>`; }).join("");
      const defs = `<defs><linearGradient id="arcg" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fe3b8" stop-opacity="0"/><stop offset=".5" stop-color="#8fe3b8" stop-opacity=".9"/><stop offset="1" stop-color="#c9ccff" stop-opacity=".9"/></linearGradient></defs>`;
      map.innerHTML = defs + dots.join("") + `<g data-arcs></g>` + cities;
      arcLayer = $("[data-arcs]", map); markHome();
      if (!reduce && window.anime) {
        anime({ targets: map.querySelectorAll(".d"), opacity: [0, 1], duration: 900, delay: anime.stagger(3, { from: "center" }), easing: "easeOutQuad" });
        startArcs();
      } else staticArcs();
    } catch (e) { map.closest(".deep__map").hidden = true; }
  }
  // every arc is a customer somewhere in Nigeria paying the visitor's business: payer -> merchant
  let arcTimer = 0, mapVisible = false, inFlight = 0, tipTurn = 0;
  const AMTS = [3200, 12500, 18750, 45000, 75000, 250000, 120000, 8400];
  const dest = () => 0;
  const arcD = (a, b) => {
    const [x1, y1] = px(CITIES[a][1], CITIES[a][2]), [x2, y2] = px(CITIES[b][1], CITIES[b][2]);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, d = Math.hypot(x2 - x1, y2 - y1);
    return { d: `M${x1} ${y1} Q${mx} ${my - Math.max(40, d * 0.45)} ${x2} ${y2}`, end: [x2, y2] };
  };
  function markHome() { if (map) $$(".city", map).forEach((c, k) => c.classList.toggle("is-home", k === dest())); }
  function fly() {
    if (!mapVisible || document.hidden || !arcLayer || inFlight >= 5) return;
    const b = dest(); let a = Math.floor(Math.random() * CITIES.length); if (a === b) a = (a + 3) % CITIES.length;
    const { d } = arcD(a, b), amt = AMTS[Math.floor(Math.random() * AMTS.length)];
    const path = document.createElementNS(SVGNS, "path"); path.setAttribute("d", d); path.setAttribute("class", "arc"); arcLayer.appendChild(path);
    const runner = document.createElementNS(SVGNS, "circle"); runner.setAttribute("r", 3); runner.setAttribute("class", "runner"); arcLayer.appendChild(runner);
    const len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    inFlight++;
    const o = { t: 0 };
    anime({ targets: o, t: 1, duration: 1500 + Math.random() * 600, easing: "easeInOutSine",
      update: () => { path.style.strokeDashoffset = len * (1 - o.t); const pt = path.getPointAtLength(o.t * len); runner.setAttribute("cx", pt.x); runner.setAttribute("cy", pt.y); },
      complete: () => {
        runner.remove(); inFlight--;
        anime({ targets: map.querySelector(`[data-ring="${b}"]`), r: [4, 22], opacity: [0.9, 0], duration: 1300, easing: "easeOutQuad" });
        anime({ targets: path, opacity: [1, 0], duration: 900, easing: "easeOutQuad", complete: () => path.remove() });
        if (++tipTurn % 3 === 0) showTip(b, `Example · ${short(amt)}`, `from ${CITIES[a][0]}`);
      } });
  }
  function showTip(k, amt, label) {
    const box = map.getBoundingClientRect(), fig = map.parentElement.getBoundingClientRect();
    const [x, y] = px(CITIES[k][1], CITIES[k][2]);
    tip.style.left = (box.left - fig.left + (x / W) * box.width) + "px"; tip.style.top = (box.top - fig.top + (y / H) * box.height) + "px";
    tip.querySelector("b").textContent = amt; tip.querySelector("span").textContent = label;
    anime({ targets: tip, opacity: [0, 1, 1, 0], translateY: [6, 0, 0, -4], duration: 1800, easing: "easeOutQuad" });
  }
  function staticArcs() { [3, 2, 9, 11, 4].forEach((a) => { const p = document.createElementNS(SVGNS, "path"); p.setAttribute("d", arcD(a === dest() ? 6 : a, dest()).d); p.setAttribute("class", "arc"); arcLayer.appendChild(p); }); }
  function startArcs() { clearInterval(arcTimer); fly(); arcTimer = setInterval(fly, 700); }
  if (map) {
    const seen = (v) => { mapVisible = v; if (v && !map.childElementCount) drawMap(); };
    if (window.ScrollTrigger) ScrollTrigger.create({ trigger: "[data-deep]", start: "top bottom+=200", end: "bottom top-=200", onToggle: (self) => seen(self.isActive) });
    else seen(true);
  }

  /* ---------- small rewards ---------- */
  $$("[data-tap]").forEach((b) => b.addEventListener("click", () => { window.PG?.printReceipt?.(); const term = $("[data-terminal]"); if (G && term) G.fromTo(term, { rotate: 0 }, { rotate: -3, duration: 0.12, yoyo: true, repeat: 3, ease: "sine.inOut" }); }));
  if (matchMedia("(hover: hover)").matches) {
    $$(".pg-alive .ind a").forEach((a) => a.addEventListener("pointermove", (e) => { const r = a.getBoundingClientRect(); a.style.setProperty("--mx", e.clientX - r.left + "px"); a.style.setProperty("--my", e.clientY - r.top + "px"); }));
    if (G) $$("[data-magnet], .split__copy .hero__ctas .btn--primary, #contact .send").forEach((el) => {
      const xTo = G.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }), yTo = G.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ======================================================================
     1 · SEND A TEST PAYMENT: the visitor pays ₦100 in the hero film and watches the clock
     ====================================================================== */
  const tryBtn = $("[data-try]"), heroFilm = $("#film-hero");
  if (tryBtn && heroFilm) {
    const clock = document.createElement("output");
    clock.className = "try__clock"; clock.setAttribute("aria-live", "polite"); clock.hidden = true;
    tryBtn.closest(".co-under").after(clock);
    let raf = 0;
    const show = (html) => { clock.hidden = false; clock.innerHTML = html; icons(); };
    heroFilm.addEventListener("pg:try-start", (e) => {
      const t0 = e.detail.t0;
      tryBtn.disabled = true;
      const tick = () => { clock.querySelector("[data-secs]").textContent = ((performance.now() - t0) / 1000).toFixed(2); raf = requestAnimationFrame(tick); };
      show('<i data-lucide="timer"></i><span>Confirming… <b class="num"><span data-secs>0.00</span> s</b></span>');
      raf = requestAnimationFrame(tick);
    });
    heroFilm.addEventListener("pg:try-done", (e) => {
      cancelAnimationFrame(raf);
      show(`<i data-lucide="circle-check"></i><span>Confirmed in <b class="num">${e.detail.secs.toFixed(1)} s</b> · demo</span>`);
      if (G) G.fromTo(clock, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
      setTimeout(() => { tryBtn.disabled = false; }, 3200);
    });
    tryBtn.addEventListener("click", () => {
      if (heroFilm._try) { heroFilm._try(100); return; }
      // motion off: the same result without the animation
      show(`<i data-lucide="circle-check"></i><span>₦100 confirmed in <b class="num">1.6 s</b> · demo</span>`);
    });
  }

  /* ======================================================================
     2 · WHEN WILL MY MONEY LAND? live T+1 / T+2 clock (working days only)
     ====================================================================== */
  const t1 = $("[data-t1]");
  if (t1) {
    let cycle = 1;
    const isWork = (d) => d.getDay() !== 0 && d.getDay() !== 6;
    const addWork = (d, n) => { const x = new Date(d); while (n > 0) { x.setDate(x.getDate() + 1); if (isWork(x)) n--; } return x; };
    const day = (d) => d.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
    const time = (d) => d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
    const render = () => {
      const now = new Date();
      // a weekend payment is processed on the next working day, then settles T+n after that
      let base = new Date(now); if (!isWork(base)) { base = addWork(base, 1); }
      const settle = addWork(base, cycle);
      $("[data-t1-paid]", t1).textContent = `${day(now)}, ${time(now)}`;
      const out = $("[data-t1-settle]", t1); const txt = day(settle);
      if (out.textContent !== txt) { out.textContent = txt; if (G) G.fromTo(out, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }); }
    };
    $$("[data-t1-cycle]", t1).forEach((b) => b.addEventListener("click", () => {
      cycle = +b.dataset.t1Cycle;
      $$("[data-t1-cycle]", t1).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      render();
    }));
    render(); setInterval(render, 30000);
  }

  /* ======================================================================
     3 · BUILD YOUR CHECKOUT: kept in this browser, shown in the hero, carried into sign-up
     ====================================================================== */
  const CK = "pg-checkout";
  const bForm = $("[data-build]");
  const readCk = () => { try { return JSON.parse(localStorage.getItem(CK)) || null; } catch (e) { return null; } };
  const saveCk = (c) => { try { localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {} };
  const dropCk = () => { try { localStorage.removeItem(CK); } catch (e) {} };
  const DEF = { name: "", item: "", amt: 45000, colour: "#000bb8", methods: ["card", "transfer"] };
  const saved = readCk();
  let ck = Object.assign({}, DEF, saved || {});
  const ckName = () => ck.name.trim() || "Adaeze Fabrics";
  const slugOf = (n) => n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, "and").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 32) || "your-business";
  const METH = { card: ["credit-card", "Card"], transfer: ["landmark", "Transfer"], pos: ["smartphone-nfc", "POS"] };
  const drawQr = (svg, seedText) => {
    let s = 0; for (const ch of seedText) s = (s * 31 + ch.charCodeAt(0)) % 233280;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280, N = 25, cells = [];
    const finder = (x, y) => cells.push(`<rect x="${x}" y="${y}" width="7" height="7" rx="1.5" fill="#06082e"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx=".6" fill="${ck.colour}"/>`);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const f = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9); if (!f && rnd() > 0.52) cells.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="#06082e"/>`); }
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    svg.innerHTML = cells.join("");
  };
  function renderCk(animate) {
    const name = ckName(), amt = naira(ck.amt || 0);
    const co = $("[data-b-checkout]"); if (!co) return;
    co.style.setProperty("--co", ck.colour);
    $("[data-b-initials]").textContent = initials(name);
    $("[data-b-label]").textContent = name;
    $("[data-b-itemout]").textContent = ck.item.trim() || "Order #1042";
    $("[data-b-total]").textContent = amt;
    const tabsEl = $("[data-b-tabs]");
    tabsEl.style.gridTemplateColumns = `repeat(${ck.methods.length}, 1fr)`;
    tabsEl.innerHTML = ck.methods.map((m, i) => `<span class="ctab${i === 0 ? " is-on" : ""}"><i data-lucide="${METH[m][0]}"></i>${METH[m][1]}</span>`).join("");
    const first = ck.methods[0];
    $("[data-b-body]").innerHTML = first === "card"
      ? `<div class="checkout__row"><span>Card</span><span class="num">•••• •••• •••• ••••</span></div><span class="btn checkout__pay build__pay">Pay ${amt}</span>`
      : first === "transfer"
        ? `<div class="checkout__row"><span>Pay into</span><span class="num">0123 456 789</span></div><div class="checkout__row"><span>Amount</span><span class="num">${amt}</span></div><span class="btn checkout__pay build__pay">I’ve sent the money</span>`
        : `<div class="checkout__row"><span>At the counter</span><span>Tap, insert or swipe</span></div><span class="btn checkout__pay build__pay">${amt} on terminal</span>`;
    const link = "paygate.upperlink.ng/pay/" + slugOf(name);
    $("[data-b-link]").textContent = link;
    drawQr($("[data-b-qr]"), link);
    icons();
    if (animate && G) G.fromTo(co, { scale: 0.985 }, { scale: 1, duration: 0.35, ease: "power2.out" });
    heroFromCk();
  }
  // the hero film carries their checkout once they've built one
  function heroFromCk() {
    if (!heroFilm || !(readCk() || (ck.name || "").trim())) return;
    const name = ckName();
    heroFilm.dataset.amt = ck.amt || 45000;
    heroFilm.querySelector(".checkout__head strong").textContent = name;
    heroFilm.querySelector(".checkout__amt .num").textContent = naira(ck.amt || 45000);
    const posAmt = heroFilm.querySelector('[data-pane="pos"] .pos-term__screen b'); if (posAmt) posAmt.textContent = naira(ck.amt || 45000);
    const acct = heroFilm.querySelector('[data-pane="transfer"] .checkout__row:nth-child(2) span:last-child'); if (acct) acct.textContent = name;
    const av = heroFilm.querySelector(".checkout__avatar");
    let tile = heroFilm.querySelector(".checkout__merchant");
    if (!tile) { tile = document.createElement("span"); tile.className = "checkout__merchant"; av?.after(tile); }
    tile.textContent = initials(name); tile.style.background = ck.colour; if (av) av.hidden = true;
  }
  if (bForm) {
    const f = (sel) => $(sel, bForm);
    f("[data-b-name]").value = ck.name; f("[data-b-item]").value = ck.item;
    f("[data-b-amt]").value = ck.amt ? Number(ck.amt).toLocaleString("en-NG") : "";
    $$('input[name="b-colour"]', bForm).forEach((r) => (r.checked = r.value === ck.colour));
    $$('input[name="b-m"]', bForm).forEach((c) => (c.checked = ck.methods.includes(c.value)));
    let t = 0;
    const changed = () => {
      const amtIn = f("[data-b-amt]"); const digits = amtIn.value.replace(/\D/g, "").slice(0, 10);
      amtIn.value = digits ? Number(digits).toLocaleString("en-NG") : "";
      const methods = $$('input[name="b-m"]:checked', bForm).map((c) => c.value);
      f("[data-b-hint]").hidden = methods.length > 0;
      if (!methods.length) return;
      ck = { name: f("[data-b-name]").value.slice(0, 40), item: f("[data-b-item]").value.slice(0, 48), amt: Number(digits) || 0, colour: $('input[name="b-colour"]:checked', bForm).value, methods };
      renderCk(true); clearTimeout(t); t = setTimeout(() => saveCk(ck), 300);
    };
    bForm.addEventListener("input", changed);
    bForm.addEventListener("change", changed);
    bForm.addEventListener("submit", (e) => e.preventDefault());
    $("[data-b-go]").addEventListener("click", () => saveCk(ck));
    $("[data-b-reset]").addEventListener("click", () => { dropCk(); location.reload(); });
    renderCk(false);
  }
  // welcome back: only when they built a checkout on an earlier visit
  if (saved && (saved.name || "").trim()) {
    const w = document.createElement("p");
    w.className = "welcome";
    w.innerHTML = `<span>Welcome back, <b></b>. Your checkout is ready.</span><a href="11-signup.html?from=checkout">Finish setting up</a><a href="#build">Edit it</a>`;
    w.querySelector("b").textContent = saved.name.trim();
    $(".split__copy .hero__ctas, .hero__copy .hero__ctas")?.after(w);
    if (G) G.from(w, { opacity: 0, y: 8, duration: 0.6, delay: 1.2, ease: "expo.out" });
    heroFromCk();
  }

  /* ======================================================================
     4 · FOLLOW THE NAIRA: one payment travels down the page with the visitor
     ====================================================================== */
  const STAGES = [
    { key: "paying", label: "Paying", sub: "Your customer is at checkout", at: ".hero" },
    { key: "paid", label: "Paid", sub: "By card, transfer or POS", at: "#how .how__row:nth-child(1)" },
    { key: "confirmed", label: "Confirmed", sub: "Checked and bank-approved", at: "#how .how__row:nth-child(2)" },
    { key: "settled", label: "Settled T+1", sub: "On its way to your account", at: "#how .how__row:nth-child(3)" },
    { key: "reconciled", label: "Reconciled", sub: "Matched to its reference", at: "#tour" },
  ];
  if (window.ScrollTrigger && $(STAGES[1].at)) {
    const j = document.createElement("nav");
    j.className = "journey"; j.setAttribute("aria-label", "Follow a payment through this page");
    j.innerHTML = `<p class="journey__amt"><span class="small">Follow the payment</span><b class="num" data-j-amt>₦45,000.00</b></p>
      <ol>${STAGES.map((s, i) => `<li data-j="${i}"><a href="${s.at.startsWith("#how") ? "#how" : s.at === ".hero" ? "#main" : s.at}" aria-label="${s.label}: ${s.sub}"><i></i><span><b>${s.label}</b><small>${s.sub}</small></span></a></li>`).join("")}</ol>`;
    document.body.appendChild(j);
    const amtOut = $("[data-j-amt]", j);
    const setAmt = () => (amtOut.textContent = naira((readCk() && ck.amt) || 45000));
    setAmt(); bForm?.addEventListener("input", setAmt);
    let stage = -1;
    const go = (i) => {
      if (i === stage) return; const fwd = i > stage; stage = i;
      $$("li", j).forEach((li, k) => { li.classList.toggle("is-on", k === i); li.classList.toggle("is-done", k < i); li.querySelector("a").toggleAttribute("aria-current", k === i); if (k === i) li.querySelector("a").setAttribute("aria-current", "step"); });
      j.dataset.stage = STAGES[i].key;
      if (G && fwd) G.fromTo($(`[data-j="${i}"] i`, j), { scale: 0.4 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
    };
    // stage and visibility come straight from the scroll position, so jumps and back-scrolls stay right
    const els = STAGES.map((s) => $(s.at));
    const heroEl = $(".hero"), devEl = $("#developers");
    const where = () => {
      const line = innerHeight * 0.6;
      let i = 0; els.forEach((el, k) => { if (el && el.getBoundingClientRect().top < line) i = k; });
      go(i);
      const after = heroEl.getBoundingClientRect().bottom < innerHeight * 0.7;
      const before = !devEl || devEl.getBoundingClientRect().top > innerHeight * 0.4;
      j.classList.toggle("is-shown", after && before);
    };
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: where, onRefresh: where });
    addEventListener("scroll", where, { passive: true });
    go(0);
  }

  icons();
  if (window.ScrollTrigger) addEventListener("load", () => ScrollTrigger.refresh());
})();
