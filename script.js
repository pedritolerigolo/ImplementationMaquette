const pluginVersions = [
  "12.1",
  "11.4",
  "11.3",
  "11.2",
  "11.1",
  "10.4",
  "10.3",
  "10.2",
  "10.1",
  "9.2",
  "9.1",
];
const phpVersions = [
  "PHP 8.3",
  "PHP 8.2",
  "PHP 8.1",
  "PHP 8",
  "PHP 7.4",
  "PHP 7.3",
  "PHP 7.2",
];

const data = [
  [0, 1800, 3200, 800, 500, 0, 0, 0, 0, 0, 0], // PHP 8.3
  [4500, 2800, 1500, 3800, 350, 0, 0, 250, 0, 0, 0], // PHP 8.2
  [200, 1200, 2200, 4200, 700, 0, 0, 0, 0, 0, 0], // PHP 8.1
  [0, 2000, 1800, 1100, 550, 350, 0, 0, 0, 0, 0], // PHP 8
  [0, 150, 600, 900, 700, 300, 0, 0, 0, 0, 0], // PHP 7.4
  [0, 50, 80, 50, 50, 0, 0, 0, 0, 0, 0], // PHP 7.3
  [0, 0, 0, 0, 50, 0, 0, 0, 0, 0, 0], // PHP 7.2
];

const COLS = pluginVersions.length; // 11
const ROWS = phpVersions.length; // 7
const ROW_H = 52;
const COL_W = 80;
const LEFT_PAD = 72;
const TOP_PAD = 30;
const MAX_VAL = 4500;
const MAX_R = 34;

const svgW = LEFT_PAD + COLS * COL_W;
const svgH = TOP_PAD + ROWS * ROW_H;

const svg = document.getElementById("chart");
svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);
svg.setAttribute("height", svgH);

const NS = "http://www.w3.org/2000/svg";
function el(tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function cx(col) {
  return LEFT_PAD + col * COL_W + COL_W / 2;
}
function cy(row) {
  return TOP_PAD + row * ROW_H + ROW_H / 2;
}

// lignes horizontales (de gauche à droite)
for (let r = 0; r < ROWS; r++) {
  const y = cy(r);
  svg.appendChild(
    el("line", {
      x1: LEFT_PAD,
      y1: y,
      x2: svgW,
      y2: y,
      stroke: "#e2e2ec",
      "stroke-width": 1,
    }),
  );
}

// lignes verticales (de haut en bas)
for (let c = 0; c < COLS; c++) {
  const x = cx(c);
  svg.appendChild(
    el("line", {
      x1: x,
      y1: TOP_PAD,
      x2: x,
      y2: svgH,
      stroke: "#e2e2ec",
      "stroke-width": 1,
    }),
  );
}

// labels des versions de plugin
for (let c = 0; c < COLS; c++) {
  const t = el("text", {
    x: cx(c),
    y: TOP_PAD / 2,
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    "font-size": "12",
    "font-weight": "600",
    "font-family": "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
    fill: "#444",
  });
  t.textContent = pluginVersions[c];
  svg.appendChild(t);
}

// labels des versions de PHP
for (let r = 0; r < ROWS; r++) {
  const t = el("text", {
    x: LEFT_PAD - 8,
    y: cy(r),
    "text-anchor": "end",
    "dominant-baseline": "middle",
    "font-size": "12",
    "font-weight": "600",
    "font-family": "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
    fill: "#444",
  });
  t.textContent = phpVersions[r];
  svg.appendChild(t);
}

//fonction pour l'opacité et la couleur des bulles
function bubbleColor(ratio) {
  const LAVANDE_THRESHOLD = 0.08; // sous ce seuil = lavande/gris
  const ORANGE_START = 0.15; // au-dessus = orange pur et opacité croissante

  if (ratio < LAVANDE_THRESHOLD) {
    const t = ratio / LAVANDE_THRESHOLD;
    const a = +(0.4 + 0.2 * t).toFixed(2);
    return `rgba(180,180,210,${a})`;
  } else {
    const t = (ratio - ORANGE_START) / (1 - ORANGE_START);
    const clamped = Math.max(0, Math.min(1, t));
    const a = +(0.4 + 0.45 * clamped).toFixed(2);
    return `rgba(255, 152, 0, ${a})`;
  }
}

const tooltip = document.getElementById("tooltip");

const allVals = data.flat().filter((v) => v > 0);
const MIN_VAL = Math.min(...allVals);

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const val = data[r][c];
    const x = cx(c),
      y = cy(r);

    if (val === 0) {
      //pas de points
      continue;
    }

    const ratio = val / MAX_VAL;
    const radius = Math.max(5, Math.round(Math.sqrt(ratio) * MAX_R));

    const circle = el("circle", {
      cx: x,
      cy: y,
      r: radius,
      fill: bubbleColor(ratio),
      opacity: 1,
      style: "cursor:pointer;",
    });

    //tooltip au survol
    circle.addEventListener("mouseenter", () => {
      tooltip.textContent = val.toLocaleString("fr-FR") + " installations";
      const svgEl = document.getElementById("chart");
      const pt = svgEl.createSVGPoint();
      pt.x = x;
      pt.y = y;
      const screen = pt.matrixTransform(svgEl.getScreenCTM());
      tooltip.style.left = screen.x + "px";
      tooltip.style.top = screen.y + radius + 14 + "px";
      tooltip.style.opacity = 1;
    });
    circle.addEventListener("mouseleave", () => {
      circle.setAttribute("r", radius);
      tooltip.style.opacity = 0;
    });

    svg.appendChild(circle);
  }
}
