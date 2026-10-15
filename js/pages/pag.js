// pages/pag.js — calculadora PAG (reemplaza app/pag/page.tsx).
(function (S) {
  const FIELDS = [
    { k: "iev", key: "IEV", href: "./iev.html" },
    { k: "ier", key: "IER", href: "./index.html" },
    { k: "irc", key: "IRC", href: "./irc.html" },
  ];

  const fmtIn = (n) => (n === undefined ? "" : n.toString().replace(".", ","));

  const latest = S.getLatestIndices();
  const v = { iev: fmtIn(latest.iev), ier: fmtIn(latest.ier), irc: fmtIn(latest.irc) };
  const auto = Boolean(latest.iev || latest.ier || latest.irc);
  let a = null;
  let saved = false;

  const $ = (id) => document.getElementById(id);
  const fieldsEl = $("fields");
  const resultEl = $("result");
  const saveBtn = $("saveBtn");

  $("formula").textContent = S.PAG_FORMULA_TEXT;
  $("impact").textContent = S.PAG_IMPACT_TEXT;
  $("autoNote").classList.toggle("hidden", !auto);

  fieldsEl.innerHTML = FIELDS
    .map(({ k, key, href }) => `<div class="card b2 ${k}">
        <label for="pag-${k}" class="field-label">${key} · ${S.INDEX_LABELS[key]}</label>
        <input id="pag-${k}" data-k="${k}" inputmode="decimal" class="inp mt-2" placeholder="1,00 a 10,00" value="${S.esc(v[k])}" />
        <p id="pag-${k}-error" role="alert" class="mt-1 text-xs error hidden"></p>
        <a href="${href}" id="pag-${k}-link" class="mt-1 text-xs underline${v[k] ? " hidden" : ""}" style="display:inline-block">No lo tengo: medirlo</a>
      </div>`)
    .join("");

  function setFieldError(k, msg) {
    const input = $(`pag-${k}`), err = $(`pag-${k}-error`);
    err.textContent = msg;
    err.classList.toggle("hidden", !msg);
    if (msg) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", `pag-${k}-error`);
    } else {
      input.setAttribute("aria-invalid", "false");
      input.removeAttribute("aria-describedby");
    }
  }

  function renderSaveBtn() {
    saveBtn.disabled = saved;
    saveBtn.textContent = saved ? "Guardado" : "Guardar medición";
  }

  function renderResult() {
    resultEl.classList.toggle("hidden", !a);
    if (!a) return;
    const level = S.pagLevel(a.results.pag_score);
    $("gauge").innerHTML = S.gaugeSemi({
      value: a.results.pag_score, min: 0, max: 10,
      leftLabel: "Superación de la servidumbre", rightLabel: "Hacia la libertad",
    });
    $("levelName").textContent = level.name;
    $("levelMsg").textContent = level.message;
    $("balanced").textContent = S.fmt(S.balancedEquivalent(a.results.pag_score));
    $("limiting").textContent =
      a.results.limiting_factor.map((f) => S.INDEX_LABELS[f]).join(" y ") +
      (a.results.limiting_factor.length === 3 ? " (los tres ejes empatan)" : "");
    renderSaveBtn();
  }

  fieldsEl.addEventListener("input", (e) => {
    const k = e.target.dataset.k;
    if (!k) return;
    v[k] = e.target.value;
    $(`pag-${k}-link`).classList.toggle("hidden", Boolean(v[k]));
    a = null;
    saved = false;
    setFieldError(k, "");
    renderResult();
  });

  $("calcBtn").addEventListener("click", () => {
    let hasErrors = false;
    FIELDS.forEach(({ k }) => {
      const r = S.parseIndex(v[k]);
      setFieldError(k, r.ok ? "" : r.error);
      if (!r.ok) hasErrors = true;
    });
    saved = false;
    a = hasErrors ? null : S.buildPagAssessment(v, S.getUserId());
    renderResult();
  });

  saveBtn.addEventListener("click", () => {
    saved = S.savePag(a);
    renderSaveBtn();
  });
  $("pdfBtn").addEventListener("click", () => S.descargarPdfPag(a));
  $("printBtn").addEventListener("click", () => window.print());
})(globalThis.Spino);
