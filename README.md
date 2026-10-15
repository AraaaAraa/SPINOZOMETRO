# Spinozómetro · Sistema PAG

Herramienta reflexiva inspirada en la Ética de Spinoza. Web estática hecha con **HTML, CSS y JavaScript**.

## Dependencias

| Dependencia | Para qué | Cómo se obtiene |
|---|---|---|
| Navegador moderno | Correr la web | — |
| [jsPDF 2.5.1](https://github.com/parallax/jsPDF) | Generar los PDF | Se carga automáticamente desde cdnjs al apretar "Descargar PDF" (requiere internet solo en ese momento) |
| Node.js 18+ *(opcional)* | Correr los tests | https://nodejs.org |

No hay `npm install`, build ni servidor.

## Cómo usarla

Abrí `index.html` en el navegador (doble clic). Para publicarla, subí la carpeta tal cual a cualquier
hosting estático (GitHub Pages, Netlify, etc.).

Tests:

```bash
node --test test/
```

## Cómo funciona

La web tiene cuatro páginas que se pueden completar en cualquier orden:

| Página | Índice | Qué pide | Resultado |
|---|---|---|---|
| `iev.html` | **IEV** · Energía Vital | 5 preguntas, escala 1 a 5 | IEV de 1,00 a 10,00 |
| `index.html` | **IER** · Entorno (Spinozómetro) | 5 palabras y 5 personas con una frase que las describa | Índice 0-100, nivel 1-5 e IER de 1,00 a 10,00 |
| `irc.html` | **IRC** · Razón y Causalidad | 4 controles del 1 al 10 | IRC de 1,00 a 10,00 y estado |
| `pag.html` | **PAG** · Potencia Activa Global | Los tres índices (se autocompletan con los últimos guardados) | PAG = (IEV × IER × IRC) / 100, nivel y eje prioritario |

### Spinozómetro

- Cada palabra y cada frase se clasifica con un diccionario de raíces (`js/spinozometro.js`), sin IA:
  **suma** (+1), **resta** (−1), **ambivalente** (0) o **sin clasificar** (0).
- Detecta negaciones ("no escucha" resta) y condicionales ("ayuda a veces", "cuando le conviene" → ambivalente).
- Índice = 50 + 50 × promedio de los 10 valores. Métricas: Alegría, Autonomía, Comprensión y Cooperación.
- Lo que no se puede clasificar se muestra para que la persona marque si le suma, resta o es neutro, y el índice se recalcula.
- IER = 1 + 9 × índice / 100.

### Guardado

- Todo se guarda en el `localStorage` del navegador (clave `limaku:spinozometro:store`). No hay base de datos ni se envía nada a ningún servidor.
- Del Spinozómetro solo se guarda el resumen, nunca nombres ni frases.
- Se conservan hasta 100 mediciones por índice.

### PDF

Spinozómetro, IRC y PAG se pueden descargar en PDF, generado completamente en el navegador.

## Estructura

```
index.html  iev.html  irc.html  pag.html
css/style.css
js/
  utils.js         helpers (redondeo, normalización de texto, ids)
  validation.js    validación de índices 1,00-10,00
  theme.js         colores y nombres de los índices
  ier.js           conversión Spinozómetro → IER
  iev.js           cuestionario y cálculo IEV
  irc.js           ítems, niveles y cálculo IRC
  pag.js           niveles, cálculo PAG y eje prioritario
  spinozometro.js  diccionarios y cálculo del Spinozómetro
  storage.js       guardado en localStorage
  pdf.js           generación de PDF
  ui.js            velocímetro y anillo (SVG)
  pages/           comportamiento de cada página
test/              tests de la lógica (node:test)
```

---

*Herramienta reflexiva inspirada en la Ética de Spinoza. No es un diagnóstico psicológico.*
