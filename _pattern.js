/* PayGate "Arrow lines" pattern (approved option A).
   45° hairlines, the angle of the Upperlink arrow, with a slow band of haze colour travelling through.
   Kept deliberately faint: <canvas class="pat" data-pat="arrow" data-strength=".5" data-glow=".35" [data-dark]>. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]still\b/.test(location.search);
  const STOPS = [[255, 59, 0], [246, 0, 157], [151, 62, 198], [0, 142, 255]];
  const mix = (t) => { t = Math.max(0, Math.min(1, t)) * 3; const i = Math.min(2, Math.floor(t)), f = t - i, a = STOPS[i], b = STOPS[i + 1]; return a.map((v, k) => Math.round(v + (b[k] - v) * f)); };
  const pageDark = () => { const t = document.documentElement.dataset.theme; return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; };

  function arrow(ctx, w, h, t, s, glow, dark) {
    const gap = 14;
    const sweep = (t * 0.07) % 1.6 - 0.3;
    for (let x = -h; x < w + h; x += gap) {
      const d = (x + h) / (w + 2 * h);
      const near = Math.max(0, 1 - Math.abs(d - sweep) / 0.3);
      ctx.lineWidth = 1;
      ctx.strokeStyle = dark ? `rgba(220,224,255,${0.06 * s})` : `rgba(6,8,46,${0.055 * s})`;
      ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke();
      const a1 = glow * s * near;
      if (a1 > 0.01) {
        const [r, g, b] = mix(d);
        ctx.strokeStyle = `rgba(${r},${g},${b},${a1})`; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke();
      }
    }
  }

  const items = [];
  document.querySelectorAll("canvas.pat[data-pat='arrow']").forEach((cv) => {
    const ctx = cv.getContext("2d");
    const st = { cv, ctx, s: +(cv.dataset.strength || 0.5), glow: +(cv.dataset.glow || 0.4), visible: true, t0: performance.now(), w: 0, h: 0 };
    st.size = () => { const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2); cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); st.w = r.width; st.h = r.height; };
    st.draw = (now) => { ctx.clearRect(0, 0, st.w, st.h); arrow(ctx, st.w, st.h, reduce ? 7 : (now - st.t0) / 1000, st.s, st.glow, cv.hasAttribute("data-dark") || pageDark()); };
    st.size(); st.draw(performance.now());
    new ResizeObserver(() => requestAnimationFrame(() => { st.size(); st.draw(performance.now()); })).observe(cv);
    new IntersectionObserver(([e]) => (st.visible = e.isIntersecting)).observe(cv);
    items.push(st);
  });
  if (!items.length) return;
  new MutationObserver(() => items.forEach((st) => st.draw(performance.now()))).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (reduce) return;
  // ~30fps is plenty for a texture this slow
  let last = 0;
  const loop = (now) => { if (now - last > 33 && !document.hidden) { last = now; items.forEach((st) => st.visible && st.draw(now)); } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
})();
