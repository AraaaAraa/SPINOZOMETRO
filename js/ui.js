// ui.js — piezas visuales compartidas (reemplaza components/ui.tsx y components/gaugeSemi.tsx).
(function (S) {
  S.fmt = (n) => n.toFixed(2).replace(".", ",");

  /** Escapa texto del usuario antes de meterlo en innerHTML. */
  S.esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /** Velocímetro semicircular rojo→verde con aguja (infografía PAG). Devuelve HTML. */
  S.gaugeSemi = function ({ value, min = 0, max = 10, leftLabel, rightLabel }) {
    const CX = 100, CY = 100, R = 80, SEGS = 30;
    const pt = (a, r = R) => [CX + r * Math.cos(a), CY - r * Math.sin(a)];
    const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
    const needle = pt(Math.PI * (1 - t), R - 12);
    let arcs = "";
    for (let i = 0; i < SEGS; i++) {
      const [x0, y0] = pt(Math.PI * (1 - i / SEGS));
      const [x1, y1] = pt(Math.PI * (1 - (i + 1) / SEGS));
      arcs += `<path d="M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}" stroke="hsl(${(i / (SEGS - 1)) * 130} 75% 45%)" stroke-width="14" fill="none"/>`;
    }
    const caption = leftLabel || rightLabel
      ? `<figcaption class="gauge-caption"><span>↗ ${S.esc(leftLabel || "")}</span><span>${S.esc(rightLabel || "")} 🕊️</span></figcaption>`
      : "";
    return `<figure class="gauge">
      <svg viewBox="0 0 200 125" role="img" aria-label="Valor ${value.toFixed(2)} de ${max}">
        ${arcs}
        <line x1="${CX}" y1="${CY}" x2="${needle[0]}" y2="${needle[1]}" stroke="#0b3d63" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${CX}" cy="${CY}" r="6" fill="#0b3d63"/>
        <text x="${CX - R}" y="118" font-size="8" text-anchor="start" fill="#0b3d63">Inicio</text>
        <text x="${CX + R}" y="118" font-size="8" text-anchor="end" fill="#0b3d63">Máximo impacto</text>
        <text x="${CX}" y="84" font-size="20" font-weight="700" text-anchor="middle" fill="#0b3d63">${S.fmt(value)}</text>
      </svg>
      ${caption}
    </figure>`;
  };

  /** Anillo de progreso (resultado del Spinozómetro). Devuelve HTML. */
  S.ring = function ({ value, max = 100, color = "#6bb34a" }) {
    const r = 42, c = 2 * Math.PI * r;
    return `<div class="ring">
      <svg viewBox="0 0 100 100" role="img" aria-label="${value} de ${max}">
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="#e5eef0" stroke-width="10"/>
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"
          stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, value / max))}"/>
      </svg>
      <span>${value}/${max}</span>
    </div>`;
  };
})(globalThis.Spino = globalThis.Spino || {});
