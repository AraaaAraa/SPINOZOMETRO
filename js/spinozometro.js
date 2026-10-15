// spinozometro.js — reemplaza spinozometro/lib/spinozometro.ts.
/**
 * SPINOZÓMETRO — cálculo PROVISORIO (v0.1).
 * Todo el criterio de puntaje vive en este archivo para poder corregirlo sin tocar la UI.
 * - Sin IA: diccionario de raíces + negación + condicionales. Todo ocurre en el navegador.
 * - Función pura: el resultado se recalcula SIEMPRE desde las entradas actuales
 *   (palabras y personas cuentan por igual).
 * - Lo que no se puede clasificar NO se esconde: queda como "sin_clasificar" y se informa.
 *
 * Polaridad: -1 | 0 | 1.
 * Estado: "positivo" | "negativo" | "ambivalente" | "neutro" | "sin_clasificar".
 */
(function (S) {
  S.SCORING_VERSION = "0.1-provisional";

  S.METRICS = ["alegria", "autonomia", "comprension", "cooperacion"];
  S.METRIC_LABELS = {
    alegria: "Alegría", autonomia: "Autonomía", comprension: "Comprensión", cooperacion: "Cooperación",
  };

  const P = (stem, metrics) => ({ stem, polarity: 1, metrics });
  const N = (stem, metrics) => ({ stem, polarity: -1, metrics });

  // Raíces SIN tildes ni ñ (el texto se normaliza antes de comparar).
  S.PERSON_LEXICON = [
    P("escuch", ["comprension"]), P("impuls", ["alegria", "autonomia"]), P("apoy", ["cooperacion", "alegria"]),
    P("ayud", ["cooperacion"]), P("cooper", ["cooperacion"]), P("acompan", ["cooperacion"]),
    P("respet", ["autonomia"]), P("ensen", ["comprension"]), P("motiv", ["alegria"]),
    P("comprend", ["comprension"]), P("confi", ["autonomia", "cooperacion"]), P("valor", ["autonomia"]),
    P("anim", ["alegria"]), P("inspir", ["alegria", "autonomia"]), P("aconsej", ["comprension"]),
    P("alegr", ["alegria"]), P("dialog", ["comprension", "cooperacion"]), P("suma", ["cooperacion"]),
    P("mentor", ["comprension", "autonomia"]), P("colabor", ["cooperacion"]), P("respald", ["autonomia", "cooperacion"]),
    P("cuida", ["cooperacion", "alegria"]), P("acept", ["autonomia", "comprension"]), P("entiend", ["comprension"]),
    P("abraz", ["alegria", "cooperacion"]), P("carino", ["alegria"]), P("generos", ["cooperacion"]),
    P("pacien", ["comprension"]), P("honest", ["autonomia"]), P("leal", ["cooperacion"]),
    P("sincer", ["autonomia"]), P("divert", ["alegria"]), P("contien", ["cooperacion", "alegria"]),
    P("proteg", ["cooperacion"]), P("guia", ["comprension", "autonomia"]), P("empat", ["comprension"]),
    P("reconoc", ["autonomia"]), P("felicit", ["alegria"]), P("compart", ["cooperacion"]),
    P("alient", ["alegria", "autonomia"]), P("estimul", ["alegria", "autonomia"]), P("potenci", ["autonomia", "alegria"]),
    P("disponib", ["cooperacion"]), P("amabl", ["alegria", "cooperacion"]), P("tiern", ["alegria"]),
    P("atent", ["comprension"]), P("sosten", ["cooperacion"]), P("sostien", ["cooperacion"]),
    P("orient", ["comprension"]), P("admir", ["alegria"]),
    N("critic", ["autonomia"]), N("juzg", ["comprension"]), N("control", ["autonomia"]),
    N("manipul", ["autonomia"]), N("culp", ["alegria", "autonomia"]), N("agred", ["alegria"]),
    N("grit", ["alegria"]), N("humill", ["alegria", "autonomia"]), N("ignor", ["comprension", "cooperacion"]),
    N("bloque", ["autonomia"]), N("exig", ["autonomia"]), N("castig", ["alegria"]),
    N("descalific", ["autonomia"]), N("presion", ["autonomia"]), N("chantaj", ["autonomia"]),
    N("celos", ["alegria", "cooperacion"]), N("desvalor", ["autonomia"]), N("menospreci", ["autonomia"]),
    N("miedo", ["alegria"]), N("quej", ["alegria"]), N("rechaz", ["cooperacion"]),
    N("enoj", ["alegria"]), N("enojad", ["alegria"]), N("insult", ["alegria", "autonomia"]),
    N("miente", ["cooperacion", "autonomia"]), N("mentir", ["cooperacion", "autonomia"]), N("egois", ["cooperacion"]),
    N("envidi", ["alegria"]), N("maltrat", ["alegria", "autonomia"]), N("abus", ["autonomia"]),
    N("abusiv", ["autonomia"]), N("despreci", ["autonomia"]), N("minimiz", ["autonomia"]),
    N("invalid", ["comprension", "autonomia"]), N("aisla", ["cooperacion"]), N("ausent", ["cooperacion", "alegria"]),
    N("distan", ["cooperacion"]), N("frio", ["alegria", "cooperacion"]), N("fria", ["alegria", "cooperacion"]),
    N("agresiv", ["alegria"]), N("impon", ["autonomia"]), N("invad", ["autonomia"]),
    N("dramat", ["alegria"]), N("negativ", ["alegria"]), N("pesimis", ["alegria"]),
    N("toxic", ["alegria", "autonomia"]), N("ridiculiz", ["autonomia"]), N("burla", ["alegria", "autonomia"]),
    N("desconf", ["cooperacion", "autonomia"]), N("traicion", ["cooperacion"]), N("abandon", ["cooperacion", "alegria"]),
    N("agot", ["alegria", "autonomia"]), N("estres", ["alegria"]), N("frustr", ["alegria"]),
  ];

  // Palabras: sólo las de carga afectiva clara. "Casa", "Comida" o "Familia" dependen de cada
  // persona, por eso quedan "sin_clasificar" salvo que la persona las marque (campo `valor`).
  S.WORD_LEXICON = [
    P("libert", ["autonomia", "alegria"]), P("amor", ["alegria", "cooperacion"]), P("alegr", ["alegria"]),
    P("arte", ["alegria", "autonomia"]), P("music", ["alegria"]), P("juego", ["alegria"]),
    P("crea", ["autonomia"]), P("paz", ["alegria"]), P("confian", ["cooperacion", "autonomia"]),
    P("apoy", ["cooperacion"]), P("aprend", ["comprension"]), P("crec", ["comprension", "autonomia"]),
    P("amig", ["cooperacion", "alegria"]), P("dialog", ["comprension", "cooperacion"]),
    P("respet", ["autonomia", "cooperacion"]), P("gratitud", ["alegria"]), P("curiosid", ["comprension"]),
    P("trabajo", ["autonomia", "comprension"]), P("proyecto", ["autonomia", "cooperacion"]), P("ejercicio", ["alegria"]),
    P("felic", ["alegria"]), P("feliz", ["alegria"]), P("esperanz", ["alegria"]),
    P("sueno", ["alegria", "autonomia"]), P("viaje", ["alegria", "autonomia"]), P("natural", ["alegria"]),
    P("deport", ["alegria", "autonomia"]), P("lectur", ["comprension"]), P("libro", ["comprension"]),
    P("estudi", ["comprension"]), P("conocim", ["comprension"]), P("sabidur", ["comprension"]),
    P("salud", ["alegria"]), P("energ", ["alegria"]), P("fuerz", ["autonomia"]),
    P("coraj", ["autonomia"]), P("valent", ["autonomia"]), P("independ", ["autonomia"]),
    P("logro", ["autonomia", "alegria"]), P("exito", ["autonomia", "alegria"]), P("abraz", ["alegria", "cooperacion"]),
    P("risa", ["alegria"]), P("sonris", ["alegria"]), P("fiesta", ["alegria"]),
    P("bail", ["alegria"]), P("danza", ["alegria"]), P("pintur", ["alegria", "autonomia"]),
    P("escrib", ["autonomia"]), P("escritur", ["autonomia"]), P("equipo", ["cooperacion"]),
    P("comunid", ["cooperacion"]), P("solidar", ["cooperacion"]), P("union", ["cooperacion"]),
    P("calma", ["alegria"]), P("tranquil", ["alegria"]), P("armon", ["alegria", "cooperacion"]),
    P("equilibr", ["autonomia"]), P("bienestar", ["alegria"]), P("plenitud", ["alegria"]),
    P("proposit", ["autonomia"]), P("meta", ["autonomia"]), P("vocaci", ["autonomia"]),
    P("descans", ["alegria"]), P("cultur", ["comprension"]), P("cienc", ["comprension"]),
    P("empat", ["comprension", "cooperacion"]), P("ternur", ["alegria"]),
    N("miedo", ["alegria"]), N("culp", ["alegria", "autonomia"]), N("celos", ["alegria", "cooperacion"]),
    N("control", ["autonomia"]), N("bloque", ["autonomia"]), N("envidia", ["alegria"]),
    N("rencor", ["alegria"]), N("odio", ["alegria"]), N("ansied", ["alegria"]),
    N("obligaci", ["autonomia"]), N("mandato", ["autonomia"]), N("presion", ["autonomia"]),
    N("critic", ["autonomia"]), N("castig", ["alegria"]), N("verguenza", ["alegria"]),
    N("soledad", ["alegria", "cooperacion"]), N("impotenc", ["autonomia"]), N("angusti", ["alegria"]),
    N("agot", ["alegria", "autonomia"]), N("trist", ["alegria"]), N("dolor", ["alegria"]),
    N("enferm", ["alegria"]), N("deuda", ["autonomia"]), N("estres", ["alegria"]),
    N("rutin", ["alegria", "autonomia"]), N("aburr", ["alegria"]), N("cansa", ["alegria"]),
    N("frustr", ["alegria"]), N("fracas", ["autonomia", "alegria"]), N("violenc", ["alegria", "cooperacion"]),
    N("guerr", ["cooperacion"]), N("conflict", ["cooperacion"]), N("pelea", ["cooperacion"]),
    N("discusi", ["cooperacion"]), N("mentir", ["cooperacion"]), N("traicion", ["cooperacion"]),
    N("abandon", ["cooperacion", "alegria"]), N("rechaz", ["cooperacion"]), N("despreci", ["autonomia"]),
    N("injustic", ["autonomia"]), N("enoj", ["alegria"]), N("furia", ["alegria"]),
    N("rabia", ["alegria"]), N("temor", ["alegria"]), N("panico", ["alegria"]),
    N("inseguri", ["autonomia"]), N("depend", ["autonomia"]), N("estanc", ["autonomia"]),
    N("encierr", ["autonomia"]), N("carcel", ["autonomia"]), N("prision", ["autonomia"]),
    N("pobrez", ["autonomia"]), N("caos", ["alegria"]), N("duel", ["alegria"]),
    N("perdid", ["alegria"]), N("muert", ["alegria"]), N("vacio", ["alegria"]),
    N("aisla", ["cooperacion"]), N("desemple", ["autonomia"]), N("toxic", ["alegria"]),
    N("exigenc", ["autonomia"]),
  ];

  const NEGATORS = new Set(["no", "nunca", "jamas", "tampoco", "sin"]);
  const HEDGE =
    /\b(cuando (quiere|quiero|conviene|le conviene|se le (canta|antoja)|le parece|tiene ganas)|a veces|algunas veces|de vez en cuando|depende)\b/;

  function stemMatches(token, stem) {
    if (token === stem) return true;
    if (stem.length >= 5) return token.startsWith(stem);
    return token.startsWith(stem) && token.length <= stem.length + 1; // raíces cortas: "arte"/"artes"
  }

  /** Devuelve { polarity, status, metrics }. */
  S.classifyText = function (text, lexicon) {
    const t = S.norm(text);
    const tokens = t.split(/[^a-z]+/).filter(Boolean);
    const hits = [];

    tokens.forEach((tok, i) => {
      const e = lexicon.find((x) => stemMatches(tok, x.stem));
      if (!e) return;
      const negated = tokens.slice(Math.max(0, i - 2), i).some((w) => NEGATORS.has(w));
      hits.push({ pol: negated ? -e.polarity : e.polarity, metrics: e.metrics });
    });

    const metrics = [...new Set(hits.flatMap((h) => h.metrics))];
    const hasPos = hits.some((h) => h.pol > 0);
    const hasNeg = hits.some((h) => h.pol < 0);

    if (HEDGE.test(t) || (hasPos && hasNeg)) return { polarity: 0, status: "ambivalente", metrics };
    if (hasPos) return { polarity: 1, status: "positivo", metrics };
    if (hasNeg) return { polarity: -1, status: "negativo", metrics };
    return { polarity: 0, status: "sin_clasificar", metrics: [] };
  };

  // ---- Entrada / salida ----
  // palabras: [{ texto, valor? }]            (valor = selector de la persona: -1 | 0 | 1)
  // personas: [{ nombre, frase, valor? }]

  S.RANKING = [
    { level: 1, name: "Pasiones tristes dominantes", desc: "Entorno que principalmente disminuye tu potencia." },
    { level: 2, name: "Potencia disminuida", desc: "Predominan factores que limitan tu poder de obrar." },
    { level: 3, name: "Potencia ambivalente", desc: "Conviven factores que suman y restan." },
    { level: 4, name: "Potencia activa", desc: "Predominan factores que aumentan tu potencia." },
    { level: 5, name: "Potencia expansiva", desc: "El entorno favorece ampliamente tu capacidad de actuar." },
  ];

  S.rankingLevel = (score100) => Math.min(5, Math.floor(S.clamp(score100, 0, 100) / 20) + 1);

  S.validateSpinozometroInput = function (palabras, personas) {
    if (palabras.length !== 5 || palabras.some((p) => !p.texto.trim()))
      return "Completá las 5 palabras.";
    if (personas.length !== 5 || personas.some((p) => !p.nombre.trim() || !p.frase.trim()))
      return "Completá las 5 personas (nombre y frase).";
    return null;
  };

  const pct = (m) => Math.round(S.clamp(50 + 50 * m, 0, 100));

  function classifyItem(tipo, etiqueta, texto, valor, lexicon) {
    const auto = S.classifyText(texto, lexicon);
    if (valor === undefined) return { tipo, etiqueta, texto, ...auto, manual: false };
    const status = valor > 0 ? "positivo" : valor < 0 ? "negativo" : "neutro";
    return { tipo, etiqueta, texto, polarity: valor, status, metrics: auto.metrics, manual: true };
  }

  S.scoreSpinozometro = function (palabras, personas) {
    const err = S.validateSpinozometroInput(palabras, personas);
    if (err) throw new Error(err);

    const items = [
      ...palabras.map((p) => classifyItem("palabra", p.texto.trim(), p.texto, p.valor, S.WORD_LEXICON)),
      ...personas.map((p) => classifyItem("persona", p.nombre.trim(), p.frase, p.valor, S.PERSON_LEXICON)),
    ];

    const total = pct(S.mean(items.map((i) => i.polarity)));
    const metrics = Object.fromEntries(
      S.METRICS.map((m) => {
        const vals = items.filter((i) => i.metrics.includes(m)).map((i) => i.polarity);
        return [m, vals.length ? pct(S.mean(vals)) : null]; // null = sin datos
      })
    );

    const level = S.rankingLevel(total);
    const labels = (f) => items.filter(f).map((i) => i.etiqueta);
    const aumenta = labels((i) => i.polarity > 0);
    const disminuye = labels((i) => i.polarity < 0);
    const ambivalentes = labels((i) => i.status === "ambivalente");
    const sinClasificar = labels((i) => i.status === "sin_clasificar");
    const personasAtencion = items.filter((i) => i.tipo === "persona" && i.polarity < 0).map((i) => i.etiqueta);

    return {
      scoringVersion: S.SCORING_VERSION,
      total, metrics, level, levelName: S.RANKING[level - 1].name, ier: S.ierFromScore100(total),
      items, aumenta, disminuye, ambivalentes, sinClasificar,
      recomendacion: buildRecomendacion(level, personasAtencion),
      invitacion: INVITACIONES[level - 1],
      comoSeCalculo:
        "Cada palabra y cada persona suma (+1), resta (−1) o queda neutra (0). El índice es 50 + 50 × el promedio de esos 10 valores. " +
        "Cada métrica usa solo los elementos que la tocan; si ninguno la toca, figura como «sin datos».",
    };
  };

  const INVITACIONES = [
    "Elegí una sola cosa para cuidar esta semana: un límite, una conversación pendiente o un rato propio. Con una alcanza.",
    "Identificá un vínculo o una palabra que pesa y pensá una pequeña acción para resignificarla o ponerle límites.",
    "Elegí un factor que suma y dale más lugar esta semana: una charla, una actividad o un proyecto que te haga bien.",
    "Convertí una fuente actual de potencia en hábito: coordiná una actividad, conversación o proyecto semanal que sostenga aprendizaje, cooperación o creación.",
    "Compartí lo que te hace bien: invitá a alguien a una actividad o proyecto en común y cuidá tus espacios de reflexión.",
  ];

  function buildRecomendacion(level, atencion) {
    const base = [
      "Hoy tu entorno parece disminuir tu potencia más de lo que la aumenta. Mirá qué vínculos y palabras pesan más y pensá cuáles podés cuidar, limitar o resignificar.",
      "Predominan factores que limitan tu capacidad de actuar. Ubicar qué los provoca es el primer paso para recuperar margen de decisión.",
      "Conviven factores que suman y restan. Reforzar lo que te impulsa y poner atención a lo que te agota puede inclinar la balanza.",
      "Tu entorno muestra varios factores de apoyo, autonomía y cooperación. El desafío es consolidarlos sin depender de un único vínculo y mantener espacios propios de reflexión y acción.",
      "Tu entorno favorece ampliamente tu capacidad de actuar. El desafío es sostenerlo en el tiempo y compartirlo con otros.",
    ][level - 1];
    return atencion.length
      ? `${base} Prestá especial atención a tu vínculo con ${S.joinEs(atencion)}.`
      : base;
  }
})(globalThis.Spino = globalThis.Spino || {});
