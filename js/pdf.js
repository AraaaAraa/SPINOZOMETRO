// pdf.js — reemplaza spinozometro/lib/pdf.ts.
/**
 * Descarga de PDF, generado 100 % en el navegador con jsPDF (no se envía nada a ningún servidor).
 * jsPDF se carga recién al descargar (se inyecta el <script>), así no pesa en el resto de la web.
 * Las fuentes estándar de PDF solo cubren Latin-1 (tildes y ñ sí): `clean` reemplaza lo que no.
 */
(function (S) {
  const JSPDF_URL = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

  const M = 18, W = 210, CW = W - 2 * M, BOTTOM = 276;
  const NAVY = [11, 61, 99], GRAY = [100, 116, 139];

  const clean = (s) =>
    s.replace(/[−–—]/g, "-").replace(/→/g, "->").replace(/≈/g, "~").replace(/…/g, "...").replace(/[^\x00-\xFF]/g, "");
  const fmt = (n) => n.toFixed(2).replace(".", ",");
  const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const hsl = (h, s = 0.75, l = 0.45) => {
    const a = s * Math.min(l, 1 - l);
    const f = (n) => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return [f(0), f(8), f(4)].map((x) => Math.round(x * 255));
  };

  class Pdf {
    constructor(d) { this.d = d; this.y = 24; }

    need(h) { if (this.y + h > BOTTOM) { this.d.addPage(); this.y = 24; } }

    title(t, sub) {
      this.d.setFont("helvetica", "bold"); this.d.setFontSize(18); this.d.setTextColor(...NAVY);
      this.d.text(clean(t), M, this.y); this.y += 7;
      this.d.setFont("helvetica", "normal"); this.d.setFontSize(9); this.d.setTextColor(...GRAY);
      this.d.text(clean(sub), M, this.y); this.y += 10;
    }

    h2(t) {
      this.need(14); this.y += 3;
      this.d.setFont("helvetica", "bold"); this.d.setFontSize(12); this.d.setTextColor(...NAVY);
      this.d.text(clean(t), M, this.y); this.y += 6;
    }

    p(t, o = {}) {
      const size = o.size ?? 10, lh = size * 0.42 + 1.2;
      this.d.setFont("helvetica", o.bold ? "bold" : "normal"); this.d.setFontSize(size);
      this.d.setTextColor(...(o.color ?? [30, 41, 59]));
      for (const line of this.d.splitTextToSize(clean(t), CW)) {
        this.need(lh); this.d.text(line, M, this.y); this.y += lh;
      }
      this.y += 1.5;
    }

    bar(label, pct) {
      this.need(9);
      this.d.setFont("helvetica", "bold"); this.d.setFontSize(10); this.d.setTextColor(30, 41, 59);
      this.d.text(clean(label), M, this.y);
      this.d.setFillColor(229, 238, 240); this.d.rect(M + 40, this.y - 3.5, 90, 4, "F");
      if (pct !== null) { this.d.setFillColor(72, 187, 120); this.d.rect(M + 40, this.y - 3.5, (90 * pct) / 100, 4, "F"); }
      this.d.setFont("helvetica", "normal"); this.d.text(pct === null ? "sin datos" : `${pct}%`, M + 134, this.y);
      this.y += 8;
    }

    /** Velocímetro semicircular rojo -> verde con aguja. */
    gauge(value, min, max) {
      this.need(56);
      const d = this.d, cx = W / 2, r = 38, cy = this.y + r + 4, N = 60;
      d.setLineWidth(6); d.setLineCap("butt");
      for (let i = 0; i < N; i++) {
        const a0 = Math.PI * (1 - i / N), a1 = Math.max(0, Math.PI * (1 - (i + 1.3) / N));
        d.setDrawColor(...hsl((i / (N - 1)) * 130));
        d.line(cx + r * Math.cos(a0), cy - r * Math.sin(a0), cx + r * Math.cos(a1), cy - r * Math.sin(a1));
      }
      const t = Math.min(1, Math.max(0, (value - min) / (max - min))), ang = Math.PI * (1 - t);
      d.setDrawColor(...NAVY); d.setLineWidth(1);
      d.line(cx, cy, cx + (r - 8) * Math.cos(ang), cy - (r - 8) * Math.sin(ang));
      d.setFillColor(...NAVY); d.circle(cx, cy, 2.4, "F");
      d.setFont("helvetica", "bold"); d.setFontSize(20); d.setTextColor(...NAVY);
      d.text(fmt(value), cx, cy - 12, { align: "center" });
      d.setFont("helvetica", "normal"); d.setFontSize(8); d.setTextColor(...GRAY);
      d.text("Inicio", cx - r - 3, cy + 7); d.text("Máximo impacto", cx + r + 3, cy + 7, { align: "right" });
      d.text("Superación de la servidumbre", cx - r - 3, cy + 11); d.text("Hacia la libertad", cx + r + 3, cy + 11, { align: "right" });
      this.y = cy + 18;
    }

    finish(file) {
      const d = this.d, n = d.getNumberOfPages();
      for (let i = 1; i <= n; i++) {
        d.setPage(i); d.setFont("helvetica", "normal"); d.setFontSize(8); d.setTextColor(...GRAY);
        d.text(clean(S.DISCLAIMER), M, 289); d.text(`Página ${i} de ${n}`, W - M, 289, { align: "right" });
      }
      d.save(file);
    }
  }

  let loading = null;
  function loadJsPdf() {
    if (window.jspdf) return Promise.resolve(window.jspdf);
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = JSPDF_URL;
        s.onload = () => resolve(window.jspdf);
        s.onerror = () => { loading = null; reject(new Error("No se pudo cargar jsPDF.")); };
        document.head.appendChild(s);
      });
    }
    return loading;
  }

  async function crear() {
    const { jsPDF } = await loadJsPdf();
    return new Pdf(new jsPDF({ unit: "mm", format: "a4" }));
  }
  const fecha = () => new Date().toLocaleString("es-AR", { dateStyle: "long", timeStyle: "short" });
  const stamp = () => new Date().toISOString().slice(0, 10);
  async function run(fn) {
    try { await fn(); } catch (e) { console.error(e); alert("No se pudo generar el PDF."); }
  }

  const ESTADO = {
    positivo: "suma", negativo: "resta", ambivalente: "ambivalente", neutro: "neutro", sin_clasificar: "sin clasificar",
  };

  S.descargarPdfSpinozometro = (r) => run(async () => {
    const p = await crear();
    p.title("Spinozómetro: Índice de Potencia del Entorno", fecha());
    p.p(`${r.total}/100  ·  Nivel ${r.level}: ${r.levelName}`, { size: 16, bold: true });
    S.METRICS.forEach((m) => p.bar(S.METRIC_LABELS[m], r.metrics[m]));
    p.h2("Lo que aumenta tu potencia");
    p.p(r.aumenta.length ? `${S.joinEs(r.aumenta)}.` : "Nada claro por ahora.");
    p.h2("Lo que la disminuye");
    p.p(r.disminuye.length ? `${S.joinEs(r.disminuye)}.` : "Nada claro por ahora.");
    if (r.ambivalentes.length) p.p(`Ambivalente (suma y resta): ${S.joinEs(r.ambivalentes)}.`);
    if (r.sinClasificar.length) p.p(`Sin clasificar: ${S.joinEs(r.sinClasificar)}.`, { color: GRAY });
    p.h2("Recomendación de mejora"); p.p(r.recomendacion);
    p.h2("Invitación a la acción"); p.p(r.invitacion);
    p.h2("Detalle de la clasificación");
    r.items.forEach((it) =>
      p.p(`${it.etiqueta}${it.tipo === "persona" ? ` ("${it.texto}")` : ""}: ${ESTADO[it.status]}${it.manual ? " (marcado manualmente)" : ""}`, { size: 9 }));
    p.h2("Cómo se calculó"); p.p(r.comoSeCalculo, { size: 9 });
    p.p(`IER derivado para el PAG: ${fmt(r.ier)} de 10. Versión del cálculo: ${r.scoringVersion}.`, { size: 9, color: GRAY });
    p.finish(`spinozometro-${stamp()}.pdf`);
  });

  S.descargarPdfIrc = (a) => run(async () => {
    const p = await crear();
    p.title("Índice de Razón y Causalidad (IRC)", fecha());
    p.gauge(a.results.irc_score, 1, 10);
    p.p(a.results.state, { size: 15, bold: true, color: hexRgb(a.results.color_code) });
    p.p(S.classifyIrc(a.results.irc_score).message);
    p.h2("Tus respuestas (1 a 10)");
    S.IRC_ITEMS.forEach((it) => p.p(`${it.title}: ${a.scores[it.key]} / 10`));
    p.p("IRC = (I1 + I2 + I3 + I4) / 4", { size: 9, color: GRAY });
    p.p(`Identificador: ${a.assessment_id}  ·  ${a.timestamp}`, { size: 8, color: GRAY });
    p.finish(`irc-${stamp()}.pdf`);
  });

  S.descargarPdfPag = (a) => run(async () => {
    const p = await crear();
    const lvl = S.pagLevel(a.results.pag_score);
    p.title("Potencia Activa Global (PAG)", fecha());
    p.p(S.PAG_FORMULA_TEXT, { bold: true }); p.p(S.PAG_IMPACT_TEXT, { size: 9, color: GRAY });
    p.gauge(a.results.pag_score, 0, 10);
    p.p(lvl.name, { size: 15, bold: true }); p.p(lvl.message);
    p.p(`Equivale a un perfil parejo de ${fmt(S.balancedEquivalent(a.results.pag_score))} en los tres índices.`, { size: 9, color: GRAY });
    p.h2("Tus índices");
    ["iev", "ier", "irc"].forEach((k) => p.p(`${S.INDEX_LABELS[k.toUpperCase()]}: ${fmt(a.components[k])} / 10`));
    p.h2("Eje prioritario de intervención");
    p.p(a.results.limiting_factor.map((f) => S.INDEX_LABELS[f]).join(" y ") + (a.results.limiting_factor.length === 3 ? " (los tres ejes empatan)" : ""));
    p.p(`Identificador: ${a.pag_assessment_id}  ·  ${a.timestamp}`, { size: 8, color: GRAY });
    p.finish(`pag-${stamp()}.pdf`);
  });
})(globalThis.Spino = globalThis.Spino || {});
