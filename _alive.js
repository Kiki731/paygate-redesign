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
  const KEY = "pg-biz";

  /* ---------- who the visitor is ---------- */
  const TYPES = {
    shop: { name: "Adaeze Fabrics", place: "Balogun, Lagos", amt: 45000, bank: "your bank ••4412",
      split: [["Your business account", 80], ["Supplier", 15], ["Delivery partner"]],
      day: [
        { t: "08:05", title: "An order paid online", text: "Chiamaka pays for two yards of ankara on your website. You see it before she closes the tab.", ch: "card", who: "Chiamaka O.", amt: 45000, n: 1 },
        { t: "12:30", title: "Walk-ins scan your NQR", text: "Customers at the counter scan one code with any bank app. Twelve of them by lunch.", ch: "nqr", who: "12 NQR payments", amt: 86400, n: 12 },
        { t: "15:10", title: "A tap on your Upperlink terminal", text: "A regular taps her card on your POS. Same dashboard, same record.", ch: "pos", who: "Bimpe A.", amt: 18750, n: 1 },
        { t: "18:00", title: "Settled, without chasing", text: "Today’s payments settle to your bank account, each with its own record.", ch: "settle" },
      ] },
    hospitality: { name: "Ofada Grill & Suites", place: "Lekki, Lagos", amt: 18500, bank: "your bank ••4412",
      split: [["Restaurant account", 85], ["Delivery partner", 10], ["Staff tips"]],
      day: [
        { t: "09:15", title: "An event deposit by transfer", text: "A client pays the deposit for Saturday’s party into the account on their invoice.", ch: "transfer", who: "Kemi L.", amt: 350000, n: 1 },
        { t: "13:00", title: "Lunch rush, paid by NQR", text: "Guests scan the code on the table. Nobody waits for change.", ch: "nqr", who: "38 NQR payments", amt: 247000, n: 38 },
        { t: "20:30", title: "Dinner and rooms on POS", text: "Card payments at reception and the bar land in the same place.", ch: "pos", who: "21 POS payments", amt: 612500, n: 21 },
        { t: "23:00", title: "The night audit is already done", text: "Every room, table and deposit is reconciled before you close.", ch: "settle" },
      ] },
    school: { name: "Crestfield University", place: "Ibadan, Oyo", amt: 250000, bank: "the university account ••4412",
      split: [["University account", 70], ["Faculty account", 20], ["Hostel account"]],
      day: [
        { t: "08:00", title: "Fees open for 3,200 students", text: "Each parent gets a payment link by SMS and email, with the student’s ID already on it.", ch: "card", who: "214 fee payments", amt: 53500000, n: 214 },
        { t: "11:30", title: "Transfers matched to each student", text: "Every student has their own account number, so transfers match themselves.", ch: "transfer", who: "388 transfers", amt: 97000000, n: 388 },
        { t: "14:00", title: "Split the moment it lands", text: "Each fee is shared: 70% to the university, 20% to the faculty, 10% to the hostel.", ch: "split" },
        { t: "18:00", title: "The bursary sees every naira", text: "602 of 3,200 students paid today. Export the list for the auditors in one click.", ch: "settle" },
      ] },
    agency: { name: "State Revenue Service", place: "Alausa, Ikeja", amt: 75000, bank: "the treasury account ••4412",
      split: [["State treasury", 80], ["Local government", 15], ["Collection agent"]],
      day: [
        { t: "07:30", title: "Levies paid online", text: "Businesses pay their annual levy on the agency website, by card or transfer.", ch: "card", who: "1,120 levy payments", amt: 84000000, n: 1120 },
        { t: "10:00", title: "Bank-branch payments matched", text: "Taxpayers who pay at a bank are matched to their assessment by reference.", ch: "transfer", who: "640 transfers", amt: 152000000, n: 640 },
        { t: "14:00", title: "Collections at the revenue office", text: "Officers take card payments on Upperlink terminals at the desk.", ch: "pos", who: "96 POS payments", amt: 7200000, n: 96 },
        { t: "17:00", title: "Settled, with an audit trail", text: "Every payment, reversal and user action is recorded for the auditors.", ch: "settle" },
      ] },
    enterprise: { name: "Zenvia Marketplace", place: "Victoria Island, Lagos", amt: 12900, bank: "312 settlement accounts",
      split: [["Seller", 85], ["Marketplace fee", 10], ["Delivery partner"]],
      day: [
        { t: "00:00", title: "Checkout runs while you sleep", text: "Thousands of orders paid through the API overnight, by card and transfer.", ch: "card", who: "4,820 API payments", amt: 62178000, n: 4820 },
        { t: "09:00", title: "Every seller gets their share", text: "Sub-merchant codes route each order to the right seller automatically.", ch: "transfer", who: "1,310 transfers", amt: 38600000, n: 1310 },
        { t: "14:00", title: "One integration, every channel", text: "Cards, transfers, NQR and POS across every store, with no new code.", ch: "nqr", who: "2,240 NQR payments", amt: 21400000, n: 2240 },
        { t: "18:00", title: "Settled to every account", text: "Sellers, partners and your platform fee each settle to their own account.", ch: "settle" },
      ] },
  };
  const ICON = { card: "credit-card", transfer: "landmark", nqr: "qr-code", pos: "smartphone-nfc", settle: "banknote", split: "split" };
  const LABEL = { card: "Card", transfer: "Transfer", nqr: "NQR", pos: "POS" };

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const save = (b) => { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch (e) {} };
  const forget = () => { try { localStorage.removeItem(KEY); } catch (e) {} };
  const stored = load();
  let biz = { name: stored?.name || "", type: TYPES[stored?.type] ? stored.type : "shop" };
  const nameOf = () => biz.name.trim() || TYPES[biz.type].name;
  const initials = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "PG";
  const slug = (n) => n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, "and").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 32) || "your-business";

  /* ---------- put their business on the page ---------- */
  const film = $("#film-hero");
  const heroAvatar = film?.querySelector(".checkout__avatar");
  const apply = () => {
    const T = TYPES[biz.type], name = nameOf(), custom = !!biz.name.trim() || biz.type !== "shop";
    $$("[data-you-label]").forEach((el) => (el.textContent = name));
    $$("[data-you-initials]").forEach((el) => (el.textContent = initials(name)));
    $$("[data-you-link]").forEach((el) => (el.textContent = "pay.paygate.ng/" + slug(name)));
    $$("[data-you-amount]").forEach((el) => (el.textContent = naira(T.amt)));
    if (film) {
      film.dataset.amt = T.amt;
      film.querySelector(".checkout__head strong").textContent = name;
      film.querySelector(".checkout__head div span").textContent = T.place;
      film.querySelector(".checkout__amt .num").textContent = naira(T.amt);
      film.querySelector('[data-pane="pos"] .pos-term__screen b').textContent = naira(T.amt);
      const acct = film.querySelector('[data-pane="transfer"] .checkout__row:nth-child(2) span:last-child'); if (acct) acct.textContent = name;
      const lbl = film.querySelector("[data-label]"); if (lbl && /^Pay /.test(lbl.textContent)) lbl.textContent = "Pay " + naira(T.amt);
      // Adaeze keeps her photo; anyone else gets their initials
      let tile = film.querySelector(".checkout__merchant");
      if (custom) { if (!tile) { tile = document.createElement("span"); tile.className = "checkout__merchant"; heroAvatar?.after(tile); } tile.textContent = initials(name); if (heroAvatar) heroAvatar.hidden = true; }
      else { tile?.remove(); if (heroAvatar) heroAvatar.hidden = false; }
    }
    const cap = $(".split__co figcaption"); if (cap) cap.textContent = `Animated demo: a customer pays ${name} ${naira(T.amt)} by card, then bank transfer, NQR and a POS terminal, and each payment is confirmed.`;
    const chip = $("[data-chip] strong"); if (chip && !chip.dataset.live) chip.textContent = short(T.amt) + " received";
    const crumb = $(".dash__top .crumb"); if (crumb) crumb.textContent = name + " · Dashboard";
    const rec = $(".terminal__receipt"); if (rec) { rec.querySelector("b").textContent = name.toUpperCase(); rec.querySelector("span").textContent = T.place; }
    renderStory(); renderSplit();
  };

  /* ---------- the form ---------- */
  const form = $("[data-you-form]"), nameIn = $("[data-you-name]");
  if (form) {
    nameIn.value = biz.name;
    const r = form.querySelector(`input[name="you-type"][value="${biz.type}"]`); if (r) r.checked = true;
    let t = 0;
    const changed = () => {
      biz = { name: nameIn.value.slice(0, 40), type: form.querySelector('input[name="you-type"]:checked').value };
      nameIn.placeholder = TYPES[biz.type].name;
      apply(); clearTimeout(t); t = setTimeout(() => save(biz), 250);
      if (G) G.fromTo("[data-you-receipt]", { y: 6, scale: 0.98 }, { y: 0, scale: 1, duration: 0.5, ease: "back.out(2.5)" });
    };
    nameIn.addEventListener("input", changed);
    form.addEventListener("change", (e) => { if (e.target.name === "you-type") changed(); });
    form.addEventListener("submit", (e) => e.preventDefault());
    $("[data-you-clear]").addEventListener("click", () => { forget(); nameIn.value = ""; form.querySelector('input[value="shop"]').checked = true; biz = { name: "", type: "shop" }; nameIn.placeholder = TYPES.shop.name; apply(); $(".welcome")?.remove(); nameIn.focus(); });
  }

  /* ---------- welcome back ---------- */
  if (stored && (stored.name || stored.type !== "shop")) {
    const w = document.createElement("p");
    w.className = "welcome";
    w.innerHTML = `<span>Welcome back, <b></b>.</span><a href="#day">See your day on PayGate</a><button type="button">Not you?</button>`;
    w.querySelector("b").textContent = nameOf();
    w.querySelector("button").addEventListener("click", () => $("[data-you-clear]")?.click());
    $(".split__copy .hero__ctas, .hero__copy .hero__ctas")?.after(w);
    if (G) G.from(w, { opacity: 0, y: 8, duration: 0.6, delay: 1.2, ease: "expo.out" });
  }

  /* ---------- a day on PayGate ---------- */
  const story = $("[data-story]");
  const stepsEl = $("[data-story-steps]"), feedEl = $("[data-story-feed]"), totalEl = $("[data-story-total]"), countEl = $("[data-story-count]"), clockEl = $("[data-story-clock]");
  let cur = -1, shownTotal = 0, shownCount = 0;
  const flat = () => !G || matchMedia("(max-width: 980px)").matches;
  function renderStory() {
    if (!story) return;
    const day = TYPES[biz.type].day;
    stepsEl.innerHTML = day.map((d) => `<li><b>${d.t} · ${d.title}</b><span>${d.text}</span></li>`).join("");
    const keep = cur; cur = -1; setStep(flat() ? day.length - 1 : Math.max(0, keep), true);
  }
  function setStep(i, instant) {
    const T = TYPES[biz.type], day = T.day;
    if (i === cur) return; const forward = i > cur; cur = i;
    $$("li", stepsEl).forEach((li, k) => { li.classList.toggle("is-on", k === i); li.classList.toggle("is-past", k < i); });
    clockEl.textContent = day[i].t;
    let total = 0, count = 0; const by = { card: 0, transfer: 0, nqr: 0, pos: 0 };
    const items = [];
    day.slice(0, i + 1).forEach((d) => {
      if (d.amt) { total += d.amt; count += d.n; by[d.ch] += d.amt; items.push(`<li><span class="ico"><i data-lucide="${ICON[d.ch]}"></i></span><b>${d.who}</b><span class="num">${short(d.amt)}</span><span class="meta">${LABEL[d.ch]} · ${d.t}</span><span class="badge badge--ok">Successful</span></li>`); }
      else if (d.ch === "split") items.push(`<li><span class="ico"><i data-lucide="split"></i></span><b>${T.split.map((s) => s[0]).join(" · ")}</b><span class="num">3 shares</span><span class="meta">Split rule · ${d.t}</span><span class="badge badge--plain">Split</span></li>`);
      else items.push(`<li class="is-settle"><span class="ico"><i data-lucide="banknote"></i></span><b>Settled to ${T.bank}</b><span class="num">${short(total)}</span><span class="meta">Settlement · ${d.t}</span><span class="badge badge--ok">Paid out</span></li>`);
    });
    feedEl.innerHTML = items.reverse().slice(0, 4).join(""); icons();
    const bars = $$("[data-story-bars] i"); ["card", "transfer", "nqr", "pos"].forEach((k, n) => bars[n].style.setProperty("--w", total ? (by[k] / total) * 100 : 0));
    if (G && !instant) {
      if (forward) G.from(feedEl.firstElementChild, { y: -12, opacity: 0, scale: 0.97, duration: 0.5, ease: "back.out(2)" });
      const o = { v: shownTotal, c: shownCount };
      G.to(o, { v: total, c: count, duration: 0.9, ease: "power2.out", overwrite: true, onUpdate: () => { totalEl.textContent = naira(o.v); countEl.textContent = Math.round(o.c).toLocaleString("en-NG"); } });
      G.fromTo(clockEl, { opacity: 0.3, y: forward ? 8 : -8 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" });
    } else { totalEl.textContent = naira(total); countEl.textContent = count.toLocaleString("en-NG"); }
    shownTotal = total; shownCount = count;
  }
  if (story) {
    if (flat()) story.classList.add("story--flat");
    renderStory();
    if (!flat() && window.ScrollTrigger) {
      const n = () => TYPES[biz.type].day.length;
      ScrollTrigger.create({
        trigger: story, start: () => `top top+=${$(".topnav")?.offsetHeight || 68}`, end: () => "+=" + n() * 520, pin: true, anticipatePin: 1,
        onUpdate: (self) => setStep(Math.min(n() - 1, Math.floor(self.progress * n()))),
      });
    }
  }

  /* ---------- split calculator ---------- */
  const splitCard = $("[data-split]"), rowsEl = $("[data-split-rows]"), amtIn = $("[data-split-amt]"), sumEl = $("[data-split-total]");
  let pcts = [];
  function renderSplit() {
    if (!splitCard) return;
    const T = TYPES[biz.type];
    pcts = [T.split[0][1], T.split[1][1]];
    amtIn.value = T.amt.toLocaleString("en-NG");
    rowsEl.innerHTML = T.split.map((s, k) => k < 2
      ? `<div class="srow"><label for="sp${k}">${s[0]}<span class="pct" data-pct="${k}"></span></label><span class="num" data-share="${k}"></span><div class="bar" aria-hidden="true"><i data-bar="${k}"></i></div><input type="range" id="sp${k}" min="0" max="100" step="5" value="${s[1]}" data-range="${k}" aria-label="${s[0]} share, percent"></div>`
      : `<div class="srow srow--rest"><span style="font-weight:500">${s[0]}<span class="pct" data-pct="2"></span></span><span class="num" data-share="2"></span><div class="bar" aria-hidden="true"><i data-bar="2"></i></div></div>`).join("");
    $$("[data-range]", rowsEl).forEach((r) => r.addEventListener("input", () => {
      const k = +r.dataset.range, other = 1 - k; pcts[k] = +r.value;
      if (pcts[0] + pcts[1] > 100) { pcts[other] = 100 - pcts[k]; $(`[data-range="${other}"]`, rowsEl).value = pcts[other]; }
      updateSplit();
    }));
    updateSplit(true);
  }
  function updateSplit(instant) {
    const amt = +String(amtIn.value).replace(/\D/g, "") || 0;
    const p = [pcts[0], pcts[1], Math.max(0, 100 - pcts[0] - pcts[1])];
    p.forEach((v, k) => {
      $(`[data-pct="${k}"]`, rowsEl).textContent = v + "%";
      $(`[data-share="${k}"]`, rowsEl).textContent = naira((amt * v) / 100);
      const bar = $(`[data-bar="${k}"]`, rowsEl);
      if (G && !instant) G.to(bar, { width: v + "%", duration: 0.5, ease: "power3.out" }); else bar.style.width = v + "%";
    });
    sumEl.textContent = naira(amt);
  }
  amtIn?.addEventListener("input", () => { const d = amtIn.value.replace(/\D/g, "").slice(0, 12); amtIn.value = d ? (+d).toLocaleString("en-NG") : ""; updateSplit(); });
  if (splitCard && G) ScrollTrigger.create({ trigger: splitCard, start: "top 80%", once: true, onEnter: () => { $$("[data-bar]", rowsEl).forEach((b) => { const w = b.style.width; G.fromTo(b, { width: 0 }, { width: w, duration: 1.1, ease: "expo.out" }); }); } });

  /* ---------- ticker ---------- */
  const tick = $("[data-ticker]");
  if (tick) {
    const T = [["₦45,000", "Card · Ikeja"], ["₦250,000", "School fees · Abuja"], ["₦3,200", "NQR · Kano"], ["₦75,000", "Levy · Alausa"], ["₦18,750", "POS · Port Harcourt"], ["₦1,200,000", "Transfer · Victoria Island"], ["₦12,900", "Marketplace order · Enugu"], ["₦8,400", "NQR · Ibadan"], ["₦32,500", "POS · Benin City"], ["₦120,000", "Transfer · Kaduna"]];
    const html = T.map(([a, b]) => `<span><i></i><b>${a}</b>${b}</span>`).join("");
    tick.innerHTML = html + (reduce ? "" : html.replace(/<span>/g, '<span aria-hidden="true">'));
  }

  /* ---------- the Nigeria dot map (Anime.js) ---------- */
  const map = $("[data-map]"), tip = $("[data-maptip]");
  const CITIES = [["Lagos", 3.38, 6.52], ["Ibadan", 3.9, 7.38], ["Abuja", 7.49, 9.06], ["Kano", 8.52, 12.0], ["Port Harcourt", 7.01, 4.82], ["Enugu", 7.5, 6.44], ["Kaduna", 7.44, 10.52], ["Benin City", 5.62, 6.34], ["Jos", 8.89, 9.9], ["Maiduguri", 13.16, 11.85], ["Calabar", 8.33, 4.95], ["Sokoto", 5.24, 13.06], ["Ilorin", 4.55, 8.5], ["Owerri", 7.03, 5.48], ["Abeokuta", 3.35, 7.15], ["Yola", 12.46, 9.2]];
  const W = 600, H = 500, LON = [2.6, 14.8], LAT = [4.2, 13.95];
  const px = (lon, lat) => [((lon - LON[0]) / (LON[1] - LON[0])) * W, ((LAT[1] - lat) / (LAT[1] - LAT[0])) * (H - 10) + 5];
  const inside = (x, y, rings) => { let c = false; rings.forEach((r) => { for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } }); return c; };
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
      map.innerHTML = dots.join("") + cities;
      if (!reduce && window.anime) {
        anime({ targets: map.querySelectorAll(".d"), opacity: [0, 1], duration: 900, delay: anime.stagger(3, { from: "center" }), easing: "easeOutQuad" });
        startPulses();
      }
    } catch (e) { map.closest(".deep__map").hidden = true; }
  }
  const countEl2 = $("[data-deep-count]"), nEl = $("[data-deep-n]");
  let deepTotal = 184212450, deepN = 41280, pulseTimer = 0, mapVisible = false;
  const KINDS = ["Card", "Transfer", "NQR", "POS", "School fees", "Levy"];
  function pulse() {
    if (!mapVisible || document.hidden) return;
    const k = Math.floor(Math.random() * CITIES.length), ring = map.querySelector(`[data-ring="${k}"]`);
    const amt = [3200, 12500, 18750, 45000, 75000, 250000, 120000][Math.floor(Math.random() * 7)];
    anime({ targets: ring, r: [4, 26], opacity: [0.9, 0], duration: 1600, easing: "easeOutQuad" });
    const box = map.getBoundingClientRect(), fig = map.parentElement.getBoundingClientRect();
    const [x, y] = px(CITIES[k][1], CITIES[k][2]);
    tip.style.left = (box.left - fig.left + (x / W) * box.width) + "px"; tip.style.top = (box.top - fig.top + (y / H) * box.height) + "px";
    tip.querySelector("b").textContent = short(amt); tip.querySelector("span").textContent = `${CITIES[k][0]} · ${KINDS[Math.floor(Math.random() * KINDS.length)]}`;
    anime({ targets: tip, opacity: [0, 1, 1, 0], translateY: [6, 0, 0, -4], duration: 1500, easing: "easeOutQuad" });
    deepTotal += amt; deepN += 1;
    countEl2.textContent = short(deepTotal); nEl.textContent = deepN.toLocaleString("en-NG");
  }
  function startPulses() { clearInterval(pulseTimer); pulseTimer = setInterval(pulse, 1700); }
  if (countEl2) {
    countEl2.textContent = short(deepTotal); nEl.textContent = deepN.toLocaleString("en-NG");
    const seen = (v) => { mapVisible = v; if (v && !map.childElementCount) drawMap(); };
    if (window.ScrollTrigger) ScrollTrigger.create({ trigger: "[data-deep]", start: "top bottom+=200", end: "bottom top-=200", onToggle: (self) => seen(self.isActive) });
    else seen(true);
    if (G) { const o = { v: 0, n: 0 }; ScrollTrigger.create({ trigger: "[data-deep]", start: "top 75%", once: true, onEnter: () => G.to(o, { v: deepTotal, n: deepN, duration: 2, ease: "power3.out", onUpdate: () => { countEl2.textContent = short(o.v); nEl.textContent = Math.round(o.n).toLocaleString("en-NG"); } }) }); }
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

  apply();
  icons();
  if (window.ScrollTrigger) addEventListener("load", () => ScrollTrigger.refresh());
})();
