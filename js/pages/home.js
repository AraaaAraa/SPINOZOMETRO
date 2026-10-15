// pages/home.js — página del Spinozómetro (reemplaza app/page.tsx).
(function (S) {
  // Ejemplos que se muestran en la frase de cada persona (mezclan casos que suman, restan y ambivalentes).
  const FRASE_EJEMPLOS = [
    "Ej.: Me apoya",
    "Ej.: Me impulsa",
    "Ej.: Me critica",
    "Ej.: Ayuda a veces",
    "Ej.: No me escucha",
  ];

  const blankP = () => Array(5).fill("");
  const blankQ = () => Array.from({ length: 5 }, () => ({ nombre: "", frase: "" }));

  let palabras = blankP();
  let personas = blankQ();
  let snap = null; // copia de las entradas al momento de "Evaluar"
  let ov = {}; // overrides manuales por índice de ítem (0-4 palabras, 5-9 personas)
  let saved = false;
  let savingAndRouting = false;
  let result = null;

  const $ = (id) => document.getElementById(id);
  const wordsEl = $("words");
  const peopleEl = $("people");
  const errorEl = $("error");
  const resultEl = $("resultado");
  const rankingEl = $("ranking");

  const setError = (msg) => {
    errorEl.textContent = msg;
    errorEl.classList.toggle("hidden", !msg);
  };

  function renderInputs() {
    wordsEl.innerHTML = palabras
      .map((w, i) => `<label class="field-row">
          <span class="num red">${i + 1}</span>
          <input class="inp" aria-label="Palabra ${i + 1}" data-i="${i}" value="${S.esc(w)}" />
        </label>`)
      .join("");
    peopleEl.innerHTML = personas
      .map((p, i) => `<div class="field-row top">
          <span class="num green">${i + 1}</span>
          <input class="inp w-third" placeholder="Nombre" aria-label="Nombre ${i + 1}" data-i="${i}" data-k="nombre" value="${S.esc(p.nombre)}" />
          <input class="inp" placeholder="${FRASE_EJEMPLOS[i]}" aria-label="Frase ${i + 1}" data-i="${i}" data-k="frase" value="${S.esc(p.frase)}" />
        </div>`)
      .join("");
  }

  wordsEl.addEventListener("input", (e) => { palabras[Number(e.target.dataset.i)] = e.target.value; });
  peopleEl.addEventListener("input", (e) => { personas[Number(e.target.dataset.i)][e.target.dataset.k] = e.target.value; });

  function computeResult() {
    result = snap && S.scoreSpinozometro(
      snap.p.map((texto, i) => ({ texto, valor: ov[i] })),
      snap.q.map((x, i) => ({ ...x, valor: ov[5 + i] }))
    );
  }

  function renderRanking() {
    rankingEl.innerHTML = S.RANKING
      .map((r) => `<div class="rank l${r.level}${result?.level === r.level ? " current" : ""}">
          <p class="text-xs">${r.level}</p>
          <p class="bold">${r.name}</p>
          <p class="mt-1 text-xs">${r.desc}</p>
        </div>`)
      .join("");
  }

  function renderHistory() {
    const hist = S.getHistory().spinozometro;
    if (hist.length === 0) return `<p class="text-sm muted">Todavía no guardaste mediciones.</p>`;
    return `<div class="table-wrap"><table class="hist">
        <thead><tr><th>Fecha</th><th>Índice</th><th>Nivel</th></tr></thead>
        <tbody>${hist.map((h) => `<tr>
            <td>${new Date(h.timestamp).toLocaleDateString("es-AR")}</td>
            <td>${h.total}/100</td>
            <td>${S.esc(h.levelName)}</td>
          </tr>`).join("")}</tbody>
      </table></div>`;
  }

  function renderResult() {
    renderRanking();
    if (!result) {
      resultEl.classList.add("hidden");
      resultEl.innerHTML = "";
      return;
    }
    const r = result;
    const toRate = r.items.map((it, i) => [it, i]).filter(([it]) => it.status === "sin_clasificar" || it.manual);

    resultEl.innerHTML = `<div class="card">
      <span class="badge">Nivel ${r.level} · ${r.levelName}</span>

      <div class="result-head">
        <div>
          <h2 class="text-2xl bold">Índice de Potencia del Entorno: ${r.total}/100</h2>
          <p class="mt-1 text-sm muted">Lectura reflexiva inspirada en Spinoza: observa si el entorno que describís tiende a aumentar o disminuir tu capacidad de actuar.</p>
        </div>
        ${S.ring({ value: r.total })}
      </div>

      <div class="grid cols-2-4 mt-4">
        ${S.METRICS.map((m) => `<div class="metric">
            <p class="text-sm bold">${S.METRIC_LABELS[m]}</p>
            <div class="bar"><div style="width:${r.metrics[m] ?? 0}%"></div></div>
            <p class="text-xs">${r.metrics[m] === null ? "sin datos" : `${r.metrics[m]}%`}</p>
          </div>`).join("")}
      </div>

      <div class="grid cols-2-md mt-4">
        <div class="card">
          <h3 class="bold">Lo que aumenta tu potencia</h3>
          <p class="mt-2 text-sm">${r.aumenta.length ? `Aparece como constructivo: ${S.esc(S.joinEs(r.aumenta))}.` : "Nada claro por ahora."}</p>
        </div>
        <div class="card">
          <h3 class="bold">Lo que la disminuye</h3>
          <p class="mt-2 text-sm">${r.disminuye.length ? `Requiere atención: ${S.esc(S.joinEs(r.disminuye))}.` : "Nada claro por ahora."}</p>
        </div>
        <div class="card">
          <h3 class="bold">Recomendación de mejora</h3>
          <p class="mt-2 text-sm">${S.esc(r.recomendacion)}</p>
        </div>
        <div class="card">
          <h3 class="bold">Invitación a la acción</h3>
          <p class="mt-2 text-sm">${S.esc(r.invitacion)}</p>
        </div>
      </div>

      ${toRate.length ? `<div class="card mt-4">
          <h3 class="bold">No pude clasificar algunos elementos</h3>
          <p class="mb-2 text-sm muted">Marcá cómo los sentís vos y el índice se recalcula.</p>
          ${toRate.map(([it, i]) => `<label class="rate-row">
              <span>${S.esc(it.etiqueta)}${it.tipo === "persona" ? ` («${S.esc(it.texto)}»)` : ""}</span>
              <select class="select" data-ov="${i}">
                <option value="" disabled${ov[i] === undefined ? " selected" : ""}>Elegí…</option>
                <option value="1"${ov[i] === 1 ? " selected" : ""}>Me suma</option>
                <option value="0"${ov[i] === 0 ? " selected" : ""}>Neutro</option>
                <option value="-1"${ov[i] === -1 ? " selected" : ""}>Me resta</option>
              </select>
            </label>`).join("")}
        </div>` : ""}

      <details class="mt-4 text-sm">
        <summary class="bold">Cómo se calculó</summary>
        <p class="mt-1 muted">${S.esc(r.comoSeCalculo)}</p>
      </details>

      <p class="mt-3 text-sm">Tu IER derivado: <b>${S.fmt(r.ier)}</b> de 10. <a href="./pag.html" class="link">Usarlo en el PAG</a></p>

      <div class="row-actions">
        <button class="btn primary" data-action="pag">Guardar y calcular mi PAG</button>
        <button class="btn" data-action="pdf">Descargar PDF</button>
        <button class="btn" data-action="print">Imprimir</button>
        <button class="btn" data-action="repeat">Repetir test</button>
      </div>

      <h3 class="mt-6 bold">Historial de evolución</h3>
      ${renderHistory()}
    </div>`;
    resultEl.classList.remove("hidden");
  }

  function evaluar() {
    const err = S.validateSpinozometroInput(palabras.map((texto) => ({ texto })), personas);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    ov = {};
    saved = false;
    savingAndRouting = false;
    snap = { p: [...palabras], q: personas.map((x) => ({ ...x })) };
    computeResult();
    renderResult();
    setTimeout(() => resultEl.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function repetir() {
    if (!confirm("¿Seguro? Se borran los datos cargados (el historial guardado no se toca).")) return;
    palabras = blankP();
    personas = blankQ();
    snap = null;
    ov = {};
    setError("");
    saved = false;
    savingAndRouting = false;
    computeResult();
    renderInputs();
    renderResult();
  }

  function guardarYCalcularPag() {
    if (!result || savingAndRouting) return;
    savingAndRouting = true;
    const ok = saved || S.saveSpinozometro(result);
    if (ok) {
      saved = true;
      window.location.href = "./pag.html";
    } else {
      savingAndRouting = false;
      setError("No se pudo guardar en este navegador.");
    }
  }

  $("evalBtn").addEventListener("click", evaluar);

  resultEl.addEventListener("change", (e) => {
    const i = e.target.dataset.ov;
    if (i === undefined) return;
    ov = { ...ov, [i]: Number(e.target.value) };
    computeResult();
    renderResult();
  });

  resultEl.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "pag") guardarYCalcularPag();
    else if (action === "pdf") S.descargarPdfSpinozometro(result);
    else if (action === "print") window.print();
    else if (action === "repeat") repetir();
  });

  renderInputs();
  renderRanking();
})(globalThis.Spino);
