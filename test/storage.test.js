// storage.test.js — reemplaza spinozometro/test/storage.test.ts. Correr con: node --test test/
const test = require("node:test");
const assert = require("node:assert/strict");

const mem = new Map();
const localStorageMock = {
  get length() { return mem.size; },
  clear: () => void mem.clear(),
  getItem: (k) => mem.get(k) ?? null,
  key: (index) => Array.from(mem.keys())[index] ?? null,
  removeItem: (k) => void mem.delete(k),
  setItem: (k, v) => void mem.set(k, v),
};
Object.defineProperty(globalThis, "window", { value: { localStorage: localStorageMock }, writable: true, configurable: true });

["utils", "validation", "ier", "iev", "irc", "pag", "spinozometro", "storage"].forEach((f) => require(`../js/${f}.js`));
const {
  loadStore, saveIev, saveIrc, savePag, saveSpinozometro, getLatestIndices, getUserId, clearStore,
  deleteHistoryItem, getHistory, buildIevResult, buildIrcAssessment, buildPagAssessment, scoreSpinozometro,
} = globalThis.Spino;

test("storage: guarda, autocompleta y borra", () => {
  clearStore();
  const uid = getUserId();
  assert.equal(getUserId(), uid); // estable
  const iev = buildIevResult([4, 4, 4, 4, 4]);
  saveIev(iev);
  saveIev(iev);
  assert.equal(getHistory().iev.length, 1);
  const mk = (n) => ({ I1_afectos_pasivos: n, I2_causalidad_interna: n, I3_discernimiento: n, I4_coherencia: n });
  const irc = buildIrcAssessment(mk(7), uid);
  saveIrc(irc);
  saveIrc(irc);
  assert.equal(getHistory().irc.length, 1);
  const sp = scoreSpinozometro(
    ["a", "b", "c", "d", "e"].map((texto) => ({ texto, valor: 1 })),
    ["a", "b", "c", "d", "e"].map((n) => ({ nombre: n, frase: "x", valor: 1 }))
  );
  saveSpinozometro(sp);
  saveSpinozometro(sp);
  assert.equal(getHistory().spinozometro.length, 1);
  assert.deepEqual(getLatestIndices(), { iev: 7.75, irc: 7, ier: sp.ier });
  const pag = buildPagAssessment({ iev: 7.75, ier: sp.ier, irc: 7 }, uid);
  savePag(pag);
  savePag(pag);
  assert.equal(getHistory().pag.length, 1);
  // privacidad: no se guardan nombres ni frases del Spinozómetro
  assert.ok(!JSON.stringify(loadStore().history.spinozometro).includes('"frase"'));
  deleteHistoryItem("pag", pag.pag_assessment_id);
  assert.equal(getHistory().pag.length, 0);
  clearStore();
  assert.deepEqual(getLatestIndices(), {});
});

test("storage: JSON corrupto no rompe", () => {
  mem.set("limaku:spinozometro:store", "{no es json");
  assert.equal(loadStore().v, 1);
  assert.deepEqual(loadStore().latest, {});
});
