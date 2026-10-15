// ier.js — reemplaza spinozometro/lib/ier.ts.
(function (S) {
  /** Conversión propuesta (a confirmar): Spinozómetro 0-100 -> IER 1.00-10.00. */
  S.ierFromScore100 = (score100) => S.round2(1 + (9 * S.clamp(score100, 0, 100)) / 100);
})(globalThis.Spino = globalThis.Spino || {});
