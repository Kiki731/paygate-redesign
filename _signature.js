/* PayGate signature: the rising light (WebGL) + the live checkout.
   Mount by attribute:  <div class="glow" data-glow data-rise=".75"></div>
                        <div data-checkout>…</div>
   Needs GSAP for the checkout choreography. */
(() => {
  const _still = /[?&]still\b/.test(location.search);
  const reduce = _still ? { matches: true, addEventListener() {} } : matchMedia("(prefers-reduced-motion: reduce)");
  const glows = [];

  /* ---------------- Rising light ---------------- */
  const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
  const FRAG = `
    precision mediump float;
    uniform vec2 r; uniform float t; uniform float pulse; uniform float rise;
    uniform vec3 c1; uniform vec3 c2; uniform vec3 c3; uniform vec3 c4;
    float blob(vec2 p, vec2 c, float s){ vec2 d = (p - c) * vec2(1.0, 1.55); return exp(-dot(d, d) / s); }
    void main(){
      vec2 uv = gl_FragCoord.xy / r;              // y = 0 at the bottom
      float a = r.x / r.y;
      vec2 p = vec2(uv.x * a, uv.y);
      vec2 b1 = vec2(a * (0.18 + 0.07 * sin(t * 0.21)),        -0.06 + 0.05 * sin(t * 0.33));
      vec2 b2 = vec2(a * (0.50 + 0.10 * sin(t * 0.17 + 1.3)),  -0.12 + 0.06 * cos(t * 0.27));
      vec2 b3 = vec2(a * (0.84 + 0.06 * cos(t * 0.19 + 0.4)),  -0.04 + 0.05 * sin(t * 0.23 + 2.0));
      vec2 b4 = vec2(a * (0.36 + 0.16 * sin(t * 0.11 + 3.0)),   0.02 + 0.05 * sin(t * 0.29));
      float s = 0.20 * (1.0 + 0.45 * pulse) * (0.6 + rise);
      float w1 = blob(p, b1, s * 1.15), w2 = blob(p, b2, s), w3 = blob(p, b3, s * 0.85), w4 = blob(p, b4, s * 1.5);
      float W = w1 + w2 + w3 + w4 + 1e-4;
      vec3 col = (c1 * w1 * 1.25 + c2 * w2 + c4 * w3 * 1.2 + c3 * w4) / (W + 0.25 * w1 + 0.2 * w3);
      float alpha = clamp(W * 1.1, 0.0, 1.0);
      float m = 1.0 - smoothstep(0.0, rise, uv.y);  // fades upward into the page
      alpha *= m * m * (3.0 - 2.0 * m);
      gl_FragColor = vec4(col * alpha, alpha);      // premultiplied
    }`;

  const hex = (v) => {
    v = (v || "").trim();
    if (v[0] !== "#") return [0, 0, 0];
    if (v.length === 4) v = "#" + [...v.slice(1)].map((c) => c + c).join("");
    const n = parseInt(v.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };

  function mountGlow(el) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    el.appendChild(canvas);
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) return; // CSS fallback stays

    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(["r", "t", "pulse", "rise", "c1", "c2", "c3", "c4"].map((n) => [n, gl.getUniformLocation(prog, n)]));

    const state = { el, gl, canvas, U, pulse: 0, visible: true, raf: 0, t0: performance.now(), rise: parseFloat(el.dataset.rise || ".75") };

    state.colors = () => {
      const cs = getComputedStyle(el);
      ["c1", "c2", "c3", "c4"].forEach((k, i) => gl.uniform3fv(U[k], hex(cs.getPropertyValue("--g" + (i + 1)))));
    };
    state.size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);   // light effect, cap the cost
      const w = Math.max(1, Math.round(el.clientWidth * dpr * 0.6));
      const h = Math.max(1, Math.round(el.clientHeight * dpr * 0.6));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(U.r, w, h);
    };
    state.draw = (now) => {
      gl.uniform1f(U.t, reduce.matches ? 12.0 : (now - state.t0) / 1000);
      gl.uniform1f(U.pulse, state.pulse);
      gl.uniform1f(U.rise, state.rise);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    state.loop = (now) => {
      state.draw(now);
      if (!reduce.matches && state.visible && !document.hidden) state.raf = requestAnimationFrame(state.loop);
      else state.raf = 0;
    };
    state.kick = () => { if (!state.raf) state.raf = requestAnimationFrame(state.loop); };

    state.colors(); state.size(); state.draw(performance.now());
    el.classList.add("is-live");

    new ResizeObserver(() => { state.size(); state.draw(performance.now()); }).observe(el);
    new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; if (state.visible) state.kick(); }, { rootMargin: "120px" }).observe(el);
    document.addEventListener("visibilitychange", state.kick);
    reduce.addEventListener?.("change", state.kick);
    glows.push(state);
    state.kick();
  }

  const recolor = () => glows.forEach((g) => { g.colors(); g.draw(performance.now()); });
  new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", recolor);

  /* brighten the nearest light briefly: used when a payment lands */
  function pulseNear(node) {
    const g = glows.find((s) => s.el.parentElement && s.el.parentElement.contains(node)) || glows[0];
    if (!g || reduce.matches || !window.gsap) return;
    gsap.fromTo(g, { pulse: 0 }, { pulse: 1, duration: 0.5, ease: "power2.out", yoyo: true, repeat: 1, repeatDelay: 0.3, onUpdate: g.kick });
  }

  /* ---------------- Live checkout ---------------- */
  const DONE = {
    card:     ["Payment successful",     "₦45,000.00 · Visa •••• 4412"],
    transfer: ["Transfer received",      "₦45,000.00 · confirmed instantly"],
    nqr:      ["NQR payment received",   "₦45,000.00 · scanned from bank app"],
    pos:      ["Approved at the counter","₦45,000.00 · terminal PG-0217"],
  };

  function mountCheckout(root) {
    const tabs = [...root.querySelectorAll("[role=tab]")];
    const panes = [...root.querySelectorAll("[role=tabpanel]")];
    const done = root.querySelector(".checkout__done");
    const doneTitle = done.querySelector("strong");
    const doneSub = done.querySelector(".small");
    const toggle = root.querySelector("[data-autoplay]");
    const live = root.querySelector("[data-live]");
    let i = 0, tl = null, playing = !reduce.matches;

    const select = (idx, focus) => {
      i = idx;
      tabs.forEach((t, n) => { t.setAttribute("aria-selected", n === idx); t.tabIndex = n === idx ? 0 : -1; });
      panes.forEach((p, n) => { p.hidden = n !== idx; });
      if (focus) tabs[idx].focus();
    };

    const showDone = (method, announce) => {
      const [a, b] = DONE[method];
      doneTitle.textContent = a; doneSub.textContent = b;
      if (announce && live) live.textContent = a + ". " + b;
      ((window.PG && window.PG.pulseNear) || pulseNear)(root);
      if (!window.gsap || reduce.matches) { done.style.opacity = 1; done.style.visibility = "visible"; return; }
      gsap.fromTo(done, { autoAlpha: 0, y: 8, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power3.out" });
      gsap.fromTo(done.querySelector(".tick"), { scale: 0.6 }, { scale: 1, duration: 0.6, ease: "back.out(2.2)" });
    };
    const hideDone = () => {
      if (!window.gsap || reduce.matches) { done.style.opacity = 0; done.style.visibility = "hidden"; return; }
      gsap.to(done, { autoAlpha: 0, duration: 0.3, ease: "power2.in" });
    };

    const build = () => {
      if (!window.gsap) return null;
      const t = gsap.timeline({ repeat: -1, paused: true });
      tabs.forEach((tab, n) => {
        const method = tab.dataset.method;
        const pane = panes[n];
        t.call(() => { hideDone(); select(n); })
         .fromTo(pane, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" })
         .to(pane.querySelector("[data-press]") || pane, { scale: 0.97, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" }, "+=1.5")
         .call(() => showDone(method, false))
         .to({}, { duration: 1.8 });
      });
      return t;
    };

    const setPlaying = (on) => {
      playing = on;
      if (toggle) { toggle.setAttribute("aria-pressed", String(!on)); toggle.querySelector("span").textContent = on ? "Pause demo" : "Play demo"; }
      if (!tl) tl = build();
      if (!tl) return;
      if (on) tl.play(); else { tl.pause(); gsap.set(panes[i], { autoAlpha: 1, y: 0 }); }
    };

    tabs.forEach((tab, n) => {
      tab.addEventListener("click", () => {
        setPlaying(false); hideDone(); select(n);
        if (window.gsap) gsap.set(panes[n], { autoAlpha: 1, y: 0 });
      });
      tab.addEventListener("keydown", (e) => {
        const k = e.key; let to = null;
        if (k === "ArrowRight") to = (n + 1) % tabs.length;
        if (k === "ArrowLeft") to = (n - 1 + tabs.length) % tabs.length;
        if (k === "Home") to = 0; if (k === "End") to = tabs.length - 1;
        if (to !== null) { e.preventDefault(); setPlaying(false); hideDone(); select(to, true); if (window.gsap) gsap.set(panes[to], { autoAlpha: 1, y: 0 }); }
      });
    });
    root.querySelectorAll("[data-press]").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault(); setPlaying(false); showDone(tabs[i].dataset.method, true);
      setTimeout(hideDone, 2600);
    }));
    toggle?.addEventListener("click", () => setPlaying(!playing));

    select(0);
    // start when on screen; stop when off
    new IntersectionObserver(([e]) => { if (!tl && playing) tl = build(); if (tl) (e.isIntersecting && playing) ? tl.play() : tl.pause(); }, { threshold: 0.35 }).observe(root);
    if (!playing) setPlaying(false);
  }

  const boot = () => {
    document.querySelectorAll("[data-glow]").forEach(mountGlow);
    document.querySelectorAll("[data-checkout]").forEach(mountCheckout);
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
  window.PG = Object.assign({ pulseNear }, window.PG || {});
})();
