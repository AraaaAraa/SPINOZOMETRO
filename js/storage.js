// storage.js — reemplaza spinozometro/lib/storage.ts.
/**
 * Persistencia en localStorage, versionada y a prueba de errores (modo privado, JSON roto).
 * La interfaz pública es chica a propósito: cuando haya base de datos se reemplaza este archivo
 * por uno que hable con la API y el resto de la app no cambia.
 * Privacidad: del Spinozómetro NO se guardan nombres ni frases, solo el resumen.
 *
 * Estructura guardada:
 * { v: 1, userId, consentDb, latest: { iev?, ier?, irc? },
 *   history: { spinozometro: [], iev: [], irc: [], pag: [] } }
 */
(function (S) {
  const KEY = "limaku:spinozometro:store";
  const MAX_HISTORY = 100;

  const emptyStore = () => ({
    v: 1, userId: S.newId(), consentDb: false, latest: {},
    history: { spinozometro: [], iev: [], irc: [], pag: [] },
  });

  S.loadStore = function () {
    if (typeof window === "undefined") return emptyStore();
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return emptyStore();
      const data = JSON.parse(raw);
      if (data?.v === 1 && data.history) return data; // futuras migraciones: acá
    } catch { /* JSON roto o acceso bloqueado */ }
    return emptyStore();
  };

  function persist(s) {
    if (typeof window === "undefined") return false;
    try { window.localStorage.setItem(KEY, JSON.stringify(s)); return true; }
    catch { return false; } // cuota llena o modo privado
  }

  const push = (list, item) => [item, ...list].slice(0, MAX_HISTORY);

  S.getUserId = function () {
    const s = S.loadStore();
    persist(s); // fija el userId anónimo la primera vez
    return s.userId;
  };

  S.saveSpinozometro = function (r) {
    const s = S.loadStore();
    const last = s.history.spinozometro[0];
    if (
      last &&
      last.total === r.total &&
      last.level === r.level &&
      last.levelName === r.levelName &&
      last.ier === r.ier &&
      last.scoringVersion === r.scoringVersion &&
      JSON.stringify(last.metrics) === JSON.stringify(r.metrics)
    ) {
      return true;
    }
    const rec = {
      id: S.newId(), timestamp: new Date().toISOString(), total: r.total, level: r.level,
      levelName: r.levelName, metrics: r.metrics, ier: r.ier, scoringVersion: r.scoringVersion,
    };
    s.history.spinozometro = push(s.history.spinozometro, rec);
    s.latest.ier = r.ier;
    return persist(s);
  };

  S.saveIev = function (r) {
    const s = S.loadStore();
    const last = s.history.iev[0];
    if (last && last.iev === r.iev && JSON.stringify(last.answers) === JSON.stringify(r.answers)) {
      return true;
    }
    s.history.iev = push(s.history.iev, { ...r, id: S.newId(), timestamp: new Date().toISOString() });
    s.latest.iev = r.iev;
    return persist(s);
  };

  S.saveIrc = function (a) {
    const s = S.loadStore();
    if (s.history.irc.some((x) => x.assessment_id === a.assessment_id)) return true;
    s.history.irc = push(s.history.irc, a);
    s.latest.irc = a.results.irc_score;
    return persist(s);
  };

  S.savePag = function (a) {
    const s = S.loadStore();
    if (s.history.pag.some((x) => x.pag_assessment_id === a.pag_assessment_id)) return true;
    s.history.pag = push(s.history.pag, a);
    return persist(s);
  };

  /** Para autocompletar la calculadora PAG. */
  S.getLatestIndices = () => S.loadStore().latest;
  S.getHistory = () => S.loadStore().history;

  /** kind: "spinozometro" | "iev" | "irc" | "pag". */
  S.deleteHistoryItem = function (kind, id) {
    const s = S.loadStore();
    const key = kind === "irc" ? "assessment_id" : kind === "pag" ? "pag_assessment_id" : "id";
    s.history[kind] = s.history[kind].filter((x) => x[key] !== id);
    return persist(s);
  };

  S.setConsentDb = function (consent) {
    const s = S.loadStore();
    s.consentDb = consent;
    return persist(s);
  };

  S.exportStoreJson = () => JSON.stringify(S.loadStore(), null, 2);

  S.clearStore = function () {
    try { window.localStorage.removeItem(KEY); } catch { /* nada */ }
  };
})(globalThis.Spino = globalThis.Spino || {});
