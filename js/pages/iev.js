// pages/iev.js — página del IEV (reemplaza app/iev/page.tsx).
(function (S) {
  let a = Array(5).fill(0);
  let res = null;
  let saved = false;
  let savingAndRouting = false;

  const $ = (id) => document.getElementById(id);
  const questionsEl = $("questions");
  const calcBtn = $("calcBtn");
  const resultEl = $("result");

  function renderQuestions() {
    questionsEl.innerHTML = S.IEV_QUESTIONS
      .map((q, i) => `<div class="card b-iev-soft">
          <p class="semibold">${i + 1}. ${q.text}</p>
          <div class="scale" role="radiogroup" aria-label="${S.esc(q.text)}">
            ${S.IEV_SCALE_LABELS.map((l, v) => `<button type="button" role="radio" aria-checked="${a[i] === v + 1}" data-q="${i}" data-v="${v + 1}">${v + 1}<br />${l}</button>`).join("")}
          </div>
        </div>`)
      .join("");
    calcBtn.disabled = !a.every(Boolean);
  }

  function renderResult() {
    resultEl.classList.toggle("hidden", !res);
    if (!res) return;
    $("ievValue").textContent = S.fmt(res.iev);
    $("ievBar").style.width = `${((res.iev - 1) / 9) * 100}%`;
  }

  questionsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-q]");
    if (!b) return;
    const i = Number(b.dataset.q);
    a = a.map((x, j) => (j === i ? Number(b.dataset.v) : x));
    res = null;
    saved = false;
    savingAndRouting = false;
    renderQuestions();
    renderResult();
  });

  calcBtn.addEventListener("click", () => {
    res = S.buildIevResult(a);
    savingAndRouting = false;
    renderResult();
  });

  $("saveBtn").addEventListener("click", () => {
    if (!res || savingAndRouting) return;
    savingAndRouting = true;
    const ok = saved || S.saveIev(res);
    saved = ok;
    if (ok) window.location.href = "./pag.html";
    else savingAndRouting = false;
  });

  renderQuestions();
})(globalThis.Spino);
