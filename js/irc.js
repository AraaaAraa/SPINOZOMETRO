// irc.js — reemplaza spinozometro/lib/irc.ts.
(function (S) {
  S.IRC_ITEMS = [
    { key: "I1_afectos_pasivos", title: "Transformación de afectos pasivos", low: "Reacción impulsiva", high: "Pausa consciente y reencuadre" },
    { key: "I2_causalidad_interna", title: "Causalidad interna", low: "Arrastre por mandato externo", high: "Convicción propia" },
    { key: "I3_discernimiento", title: "Discernimiento de límites", low: "Energía en lo incontrolable", high: "Foco en lo modificable" },
    { key: "I4_coherencia", title: "Coherencia y autonomía", low: "Brecha entre saber y hacer", high: "Ejecución consistente" },
  ];

  // Estados posibles: "Servidumbre Emocional" | "Transición Racional" | "Libertad Spinoziana".
  S.IRC_LEVELS = [
    {
      min: 8.0,
      state: "Libertad Spinoziana",
      color: "#38A169",
      message:
        "Tu autoevaluación muestra buena capacidad de pausa, convicción propia y coherencia entre lo que sabés y lo que hacés. Es una lectura personal y reflexiva, no un diagnóstico ni una evaluación de desempeño. Seguí cuidando tus espacios de reflexión.",
    },
    {
      min: 5.0,
      state: "Transición Racional",
      color: "#DD6B20",
      message:
        "Ya hay momentos de pausa y criterio propio, y otros en los que la reacción gana. Elegí un hábito concreto (por ejemplo, nombrar la emoción antes de actuar) y repetilo durante esta semana.",
    },
    {
      min: 0,
      state: "Servidumbre Emocional",
      color: "#E53E3E",
      message:
        "Hoy tus afectos parecen llevar el timón más que tu criterio. No es un defecto: es un punto de partida muy común. Probá hacer una pausa antes de responder y anotá qué parte de la situación depende de vos.",
    },
  ];

  /** Devuelve un mensaje de error o null si los 4 puntajes son enteros 1-10. */
  S.validateIrcScores = function (scores) {
    for (const item of S.IRC_ITEMS) {
      const v = scores[item.key];
      if (!Number.isInteger(v) || v < 1 || v > 10) {
        return `"${item.title}" debe ser un número entero entre 1 y 10.`;
      }
    }
    return null;
  };

  S.calcIrc = function (scores) {
    const err = S.validateIrcScores(scores);
    if (err) throw new Error(err);
    const v = Object.values(scores);
    return S.round2(v.reduce((s, x) => s + x, 0) / v.length);
  };

  S.classifyIrc = (irc) => S.IRC_LEVELS.find((l) => irc >= l.min);

  /** Arma el registro de una medición IRC (timestamp ISO UTC). */
  S.buildIrcAssessment = function (scores, userId, now = new Date()) {
    const irc = S.calcIrc(scores);
    const level = S.classifyIrc(irc);
    return {
      assessment_id: S.newId(),
      user_id: userId,
      timestamp: now.toISOString(),
      scores: { ...scores },
      results: { irc_score: irc, state: level.state, color_code: level.color },
    };
  };
})(globalThis.Spino = globalThis.Spino || {});
