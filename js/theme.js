// theme.js — reemplaza spinozometro/lib/theme.ts.
(function (S) {
  /** Un color por índice, según la infografía del PAG. */
  S.INDEX_COLORS = {
    IEV: "#2B6CB0", // azul
    IER: "#DD6B20", // naranja
    IRC: "#38A169", // verde
    PAG: "#0e6a8f", // celeste
  };

  S.INDEX_LABELS = {
    IEV: "Energía Vital (Conatus)",
    IER: "Entorno y Redes (afectos externos)",
    IRC: "Razón y Causalidad (Intellectus)",
  };
})(globalThis.Spino = globalThis.Spino || {});
