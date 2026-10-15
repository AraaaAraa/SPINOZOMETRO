// validation.js — reemplaza spinozometro/lib/validation.ts.
(function (S) {
  /**
   * Valida un índice entre 1.00 y 10.00 con hasta 2 decimales.
   * Acepta coma o punto ("7,5" y "7.5"), como se escribe en Argentina.
   * Devuelve { ok: true, value } o { ok: false, error }.
   */
  S.parseIndex = function (input) {
    const raw = typeof input === "number" ? String(input) : input.trim().replace(",", ".");
    if (!/^\d{1,2}(\.\d{1,2})?$/.test(raw)) {
      return { ok: false, error: "Ingresá un número entre 1,00 y 10,00 con hasta 2 decimales." };
    }
    const value = Number(raw);
    if (value < 1 || value > 10) {
      return { ok: false, error: "El valor debe estar entre 1,00 y 10,00." };
    }
    return { ok: true, value: S.round2(value) };
  };
})(globalThis.Spino = globalThis.Spino || {});
