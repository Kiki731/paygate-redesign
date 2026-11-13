/* Mock-up review bar (site build only): pick the hero option, jump to any page.
   The hero choice is remembered for this browser, and every "home" link follows it. */
(() => {
  const PAGES = [
    ["index.html", "Home · hero A (stacked)"], ["home-b.html", "Home · hero B (side by side)"], ["home-c.html", "Home · hero B, alive (new)"],
    ["about.html", "Why PayGate / About"], ["developers.html", "Developers"], ["docs.html", "Docs"],
    ["support.html", "Contact and support"], ["signup.html", "Sign up"], ["login.html", "Log in"],
    ["legal.html", "Legal"], ["404.html", "404 page"], ["brand-patterns.html", "Brand patterns"],
  ];
  const here = location.pathname.split("/").pop() || "index.html";
  let hero = "a";
  try { hero = localStorage.getItem("pg-hero") || "a"; } catch (e) {}
  // being on a homepage sets the choice; every other page follows the last choice
  if (here === "home-b.html") hero = "b";
  if (here === "home-c.html") hero = "c";
  if (here === "index.html") hero = "a";
  const save = (v) => { try { localStorage.setItem("pg-hero", v); } catch (e) {} };
  save(hero);

  // every link to the homepage goes to the chosen hero option
  document.querySelectorAll('a[href^="index.html"]').forEach((a) => { if (hero !== "a") a.setAttribute("href", a.getAttribute("href").replace(/^index\.html/, hero === "c" ? "home-c.html" : "home-b.html")); });

  const css = `
  .rv{position:relative;z-index:70;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px 14px;padding:6px 16px;background:#06082e;color:rgba(240,242,255,.78);font:500 .8125rem/1.2 "DM Sans",system-ui,sans-serif}
  .rv b{color:#fff;font-weight:600}
  .rv__seg{display:inline-flex;gap:2px;padding:3px;border-radius:9px;background:rgba(255,255,255,.08)}
  .rv__seg a{padding:5px 10px;border-radius:7px;color:rgba(240,242,255,.78);text-decoration:none;white-space:nowrap}
  .rv__seg a:hover{color:#fff;background:rgba(255,255,255,.08)}
  .rv__seg a[aria-current="true"]{background:#4b55ff;color:#fff}
  .rv select{font:inherit;color:#fff;background:rgba(255,255,255,.08);border:0;border-radius:8px;padding:6px 28px 6px 10px;appearance:none;background-image:linear-gradient(45deg,transparent 50%,#fff 50%),linear-gradient(135deg,#fff 50%,transparent 50%);background-position:calc(100% - 14px) 50%,calc(100% - 9px) 50%;background-size:5px 5px;background-repeat:no-repeat;cursor:pointer}
  .rv select option{color:#06082e}
  .rv a:focus-visible,.rv select:focus-visible{outline:2px solid #9ea4ff;outline-offset:2px}
  @media (max-width:560px){.rv__note{display:none}}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const bar = document.createElement("div");
  bar.className = "rv"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Mock-up review");
  bar.innerHTML = `<span class="rv__note"><b>PayGate mock-up</b> · for internal review, not a live service</span>
    <span class="rv__seg" role="group" aria-label="Hero option">
      <a href="index.html" aria-current="${hero === "a"}" data-hero="a">Hero A</a><a href="home-b.html" aria-current="${hero === "b"}" data-hero="b">Hero B</a><a href="home-c.html" aria-current="${hero === "c"}" data-hero="c">B · alive</a>
    </span>
    <label><span class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Go to page</span>
      <select aria-label="Go to page">${PAGES.map(([f, t]) => `<option value="${f}"${f === here ? " selected" : ""}>${t}</option>`).join("")}</select></label>`;
  // after the skip link, so "Skip to content" stays the first thing a keyboard reaches
  const skip = document.querySelector('body > a[href="#main"], body > a[href="#doc"]');
  skip ? skip.after(bar) : document.body.prepend(bar);
  bar.querySelectorAll("[data-hero]").forEach((a) => a.addEventListener("click", () => save(a.dataset.hero)));
  bar.querySelector("select").addEventListener("change", (e) => {
    const f = e.target.value;
    if (f === "home-b.html") save("b"); if (f === "home-c.html") save("c"); if (f === "index.html") save("a");
    location.href = f;
  });
})();
