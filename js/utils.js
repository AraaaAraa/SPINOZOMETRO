// utils.js — helpers compartidos (reemplaza spinozometro/lib/utils.ts).
// Todos los módulos cuelgan de un único objeto global `Spino`, así la web funciona
// abriendo los .html directamente (file://) sin servidor ni bundler.
(function (S) {
  S.round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

  S.clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  S.mean = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

  /** Minúsculas, sin tildes ni ñ (la ñ pasa a n). Para comparar texto libre. */
  S.norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  S.newId = function () {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  };

  /** ["Ana"] -> "Ana"; ["Ana","Beto"] -> "Ana y Beto"; 3+ -> "A, B y C" */
  S.joinEs = function (items) {
    if (items.length <= 1) return items.join("");
    return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
  };

  S.DISCLAIMER =
    "Herramienta reflexiva inspirada en la Ética de Spinoza. No es un diagnóstico psicológico.";
})(globalThis.Spino = globalThis.Spino || {});
