// pag.js — reemplaza spinozometro/lib/pag.ts.
(function (S) {
  S.PAG_FORMULA_TEXT = "PAG = (Energía Vital × Entorno × Razón) / 100";
  S.PAG_IMPACT_TEXT =
    "Una alta PAG permite aumentar tu poder de actuar, vivir con Alegría spinoziana y potenciar a otros.";

  /** Cortes definidos por el empleador. Único lugar donde se tocan. */
  S.PAG_LEVELS = [
    { min: 8.0, name: "Potencia Activa Soberana", message: "Tus tres ejes se sostienen entre sí: hay energía, un entorno que suma y criterio propio. El desafío es cuidar ese equilibrio y compartirlo." },
    { min: 5.0, name: "Potencia Sostenible", message: "Tenés una base firme. Mejorar el eje más bajo es lo que más puede elevar el conjunto." },
    { min: 2.5, name: "Potencia Reactiva", message: "Tu potencia responde a lo que pasa más de lo que lo orienta. Trabajar el eje prioritario puede cambiar bastante el resultado." },
    { min: 0, name: "Potencia Crítica", message: "Es un punto de partida, no un veredicto. Como el modelo es multiplicativo, un solo eje bajo pesa mucho en el total: empezá por ese." },
  ];

  S.calcPag = ({ iev, ier, irc }) => S.round2((iev * ier * irc) / 100);

  /** Se clasifica sobre el valor redondeado, el mismo que ve la persona. */
  S.pagLevel = (pag) => S.PAG_LEVELS.find((l) => pag >= l.min);

  /** Eje(s) más bajo(s). Si hay empate, devuelve todos los empatados. */
  S.limitingFactors = function (c) {
    const entries = [
      ["IEV", S.round2(c.iev)],
      ["IER", S.round2(c.ier)],
      ["IRC", S.round2(c.irc)],
    ];
    const min = Math.min(...entries.map(([, v]) => v));
    return entries.filter(([, v]) => v === min).map(([k]) => k);
  };

  /** Informativo: perfil parejo equivalente (media geométrica). Ej.: PAG 3.43 ≈ 7.00 en cada eje. */
  S.balancedEquivalent = (pag) => S.round2(Math.cbrt(pag * 100));

  /** input: { iev, ier, irc } como número o texto ("7,5"). Lanza error si alguno es inválido. */
  S.buildPagAssessment = function (input, userId, now = new Date()) {
    const parsed = ["iev", "ier", "irc"].map((k) => {
      const r = S.parseIndex(input[k]);
      if (!r.ok) throw new Error(`${k.toUpperCase()}: ${r.error}`);
      return r.value;
    });
    const components = { iev: parsed[0], ier: parsed[1], irc: parsed[2] };
    const pag = S.calcPag(components);
    return {
      pag_assessment_id: S.newId(),
      user_id: userId,
      timestamp: now.toISOString(),
      components,
      results: {
        pag_score: pag,
        diagnostic_level: S.pagLevel(pag).name,
        limiting_factor: S.limitingFactors(components),
      },
    };
  };
})(globalThis.Spino = globalThis.Spino || {});
