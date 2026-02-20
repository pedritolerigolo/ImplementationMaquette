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
const ROW_H = 50;
const COL_W = 78;
const LEFT_PAD = 78;
const TOP_PAD = 32;
const MAX_VAL = 4500;
const MAX_R = 30;

const svgW = LEFT_PAD + COLS * COL_W;
const svgH = TOP_PAD + ROWS * ROW_H;

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

function renderChart(svgId, chartData) {
  const svg = document.getElementById(svgId);
  svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);
  svg.setAttribute("height", svgH);

  // lignes horizontales
  for (let r = 0; r < ROWS; r++) {
    const y = cy(r);
    svg.appendChild(
      el("line", {
        x1: LEFT_PAD,
        y1: y,
        x2: svgW,
        y2: y,
        stroke: "#ebebf0",
        "stroke-width": 1,
      }),
    );
  }

  // lignes verticales
  for (let c = 0; c < COLS; c++) {
    const x = cx(c);
    svg.appendChild(
      el("line", {
        x1: x,
        y1: TOP_PAD,
        x2: x,
        y2: svgH,
        stroke: "#ebebf0",
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
      "font-size": "12.5",
      "font-weight": "600",
      "font-family": "Inter, Segoe UI, sans-serif",
      fill: "#555",
    });
    t.textContent = pluginVersions[c];
    svg.appendChild(t);
  }

  // labels des versions de PHP
  for (let r = 0; r < ROWS; r++) {
    const t = el("text", {
      x: LEFT_PAD - 12,
      y: cy(r),
      "text-anchor": "end",
      "dominant-baseline": "middle",
      "font-size": "12.5",
      "font-weight": "600",
      "font-family": "Inter, Segoe UI, sans-serif",
      fill: "#555",
    });
    t.textContent = phpVersions[r];
    svg.appendChild(t);
  }

  // bulles oranges
  const tooltip = document.getElementById("tooltip");

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = chartData[r][c];
      const x = cx(c),
        y = cy(r);
      if (val === 0) continue;

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

      // tooltip au survol
      circle.addEventListener("mouseenter", () => {
        circle.setAttribute("r", Math.round(radius * 1.1));
        tooltip.textContent = val.toLocaleString("fr-FR") + " installations";
        const pt = svg.createSVGPoint();
        pt.x = x;
        pt.y = y;
        const screen = pt.matrixTransform(svg.getScreenCTM());
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
}

// données aléatoires pour le second graphique
function randomData() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () =>
      Math.random() < 0.45 ? 0 : Math.round(Math.random() * MAX_VAL),
    ),
  );
}

renderChart("chart", data);
renderChart("chart-random", randomData());