// pages/irc.js — página del IRC (reemplaza app/irc/page.tsx).
(function (S) {
  let s = { I1_afectos_pasivos: 5, I2_causalidad_interna: 5, I3_discernimiento: 5, I4_coherencia: 5 };
  let a = null;
  let saved = false;
  let savingAndRouting = false;

  const $ = (id) => document.getElementById(id);
  const itemsEl = $("items");
  const resultEl = $("result");

  itemsEl.innerHTML = S.IRC_ITEMS
    .map((it) => `<div class="card b-irc-soft">
        <label style="display:block">
          <span class="range-head"><span>${it.title}</span><span class="c-irc" data-out="${it.key}">${s[it.key]}</span></span>
          <input type="range" min="1" max="10" step="1" value="${s[it.key]}" data-key="${it.key}" />
          <span class="range-ends"><span>1: ${it.low}</span><span>10: ${it.high}</span></span>
        </label>
      </div>`)
    .join("");

  function renderResult() {
    resultEl.classList.toggle("hidden", !a);
    if (!a) return;
    $("gauge").innerHTML = S.gaugeSemi({
      value: a.results.irc_score, min: 1, max: 10,
      leftLabel: "Superación de la servidumbre", rightLabel: "Hacia la libertad",
    });
    $("stateBox").style.borderColor = a.results.color_code;
    $("stateName").style.color = a.results.color_code;
    $("stateName").textContent = a.results.state;
    $("stateMsg").textContent = S.classifyIrc(a.results.irc_score).message;
  }

  itemsEl.addEventListener("input", (e) => {
    const key = e.target.dataset.key;
    if (!key) return;
    s = { ...s, [key]: Number(e.target.value) };
    itemsEl.querySelector(`[data-out="${key}"]`).textContent = s[key];
    a = null;
    saved = false;
    savingAndRouting = false;
    renderResult();
  });

  $("calcBtn").addEventListener("click", () => {
    a = S.buildIrcAssessment(s, S.getUserId());
    savingAndRouting = false;
    renderResult();
  });

  $("saveBtn").addEventListener("click", () => {
    if (!a || savingAndRouting) return;
    savingAndRouting = true;
    const ok = saved || S.saveIrc(a);
    saved = ok;
    if (ok) window.location.href = "./pag.html";
    else savingAndRouting = false;
  });

  $("pdfBtn").addEventListener("click", () => S.descargarPdfIrc(a));
})(globalThis.Spino);
