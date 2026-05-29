const state = {
  mode: "equation",
  stream: "math",
  lastData: null,
  history: [],
  cursor: null,
  cursorIndex: 0,
  prefs: {
    theme: "light",
    themeColor: "#13a89e",
    cursorColor: "#172033",
    valueColor: "#172033",
  },
};

const palette = ["#1f9bd1", "#f97316", "#16a34a", "#a855f7", "#ef4444", "#0f766e"];
const historyKey = "graphlab-history-v1";
const prefsKey = "graphlab-prefs-v1";
const historyLimit = 12;
const themeAccent = {
  light: "#13a89e",
  dark: "#38bdf8",
  pink: "#d9468f",
  mint: "#0d9488",
};

const examples = {
  math: [
    {
      title: "Trigonometric wave",
      mode: "equation",
      request: "plot y = sin(x) + 0.35*x from -10 to 10",
      fields: { equation: "sin(x) + 0.35*x", xMin: "-10", xMax: "10" },
    },
    {
      title: "Parabola",
      mode: "equation",
      request: "plot y = x^2 - 4*x + 3 from -2 to 6",
      fields: { equation: "x^2 - 4*x + 3", xMin: "-2", xMax: "6" },
    },
    {
      title: "Ellipse",
      mode: "parametric",
      request: "parametric x(t)=4*cos(t), y(t)=2*sin(t)",
      fields: { paramX: "4*cos(t)", paramY: "2*sin(t)", tMin: "0", tMax: "6.28" },
    },
  ],
  physics: [
    {
      title: "Resultant force",
      mode: "vector",
      request: "vector Force A 4,3 and Force B -2,5",
      fields: { vector: "Force A,4,3,#1f9bd1\nForce B,-2,5,#f97316\nFriction,-1,-1,#16a34a" },
    },
    {
      title: "Projectile height",
      mode: "equation",
      request: "plot y = -0.5*x^2 + 5*x from 0 to 10",
      fields: { equation: "-0.5*x^2 + 5*x", xMin: "0", xMax: "10" },
    },
    {
      title: "Experiment points",
      mode: "scatter",
      request: "scatter data with a trend line",
      fields: { scatter: "0,0.5\n1,2.2\n2,4.1\n3,6.2\n4,7.9\n5,10.3" },
    },
  ],
  electrical: [
    {
      title: "Voltage and current phasor",
      mode: "phasor",
      request: "phasor Voltage 230 at 0 degrees, Current 8 at -35 degrees",
      fields: { phasor: "Voltage,230,0,#ef4444\nCurrent,8,-35,#2563eb\nFlux,120,70,#16a34a" },
    },
    {
      title: "AC sine wave",
      mode: "equation",
      request: "plot y = 5*sin(x) from -6.28 to 6.28",
      fields: { equation: "5*sin(x)", xMin: "-6.28", xMax: "6.28" },
    },
    {
      title: "Impedance vector",
      mode: "vector",
      request: "vector Resistance 6,0 and Reactance 0,8",
      fields: { vector: "Resistance,6,0,#f97316\nReactance,0,8,#1f9bd1" },
    },
  ],
  science: [
    {
      title: "Growth curve",
      mode: "equation",
      request: "plot y = exp(0.25*x) from -4 to 4",
      fields: { equation: "exp(0.25*x)", xMin: "-4", xMax: "4" },
    },
    {
      title: "Lab comparison",
      mode: "bar",
      request: "bar chart for Chemistry, Physics, Biology marks",
      fields: { bar: "Chemistry,82,#16a34a\nPhysics,76,#1f9bd1\nBiology,89,#f97316" },
    },
    {
      title: "Measured values",
      mode: "scatter",
      request: "scatter data for measured values",
      fields: { scatter: "1,1.2\n2,2.9\n3,3.7\n4,5.1\n5,5.9\n6,7.4" },
    },
  ],
  data: [
    {
      title: "Scatter trend",
      mode: "scatter",
      request: "scatter data and linear trend line",
      fields: { scatter: "0,1\n1,2.1\n2,2.8\n3,4.4\n4,5.2\n5,7.1" },
    },
    {
      title: "Subject scores",
      mode: "bar",
      request: "bar chart of stream subject scores",
      fields: { bar: "Maths,91,#1f9bd1\nPhysics,84,#16a34a\nChemistry,79,#f97316\nEnglish,88,#8b5cf6" },
    },
    {
      title: "Log curve",
      mode: "equation",
      request: "plot y = log(x) from 0.2 to 10",
      fields: { equation: "log(x)", xMin: "0.2", xMax: "10" },
    },
  ],
};

const els = {
  canvas: document.getElementById("plotCanvas"),
  canvasError: document.getElementById("canvasError"),
  streamSelect: document.getElementById("streamSelect"),
  promptInput: document.getElementById("promptInput"),
  interpretButton: document.getElementById("interpretButton"),
  plotButton: document.getElementById("plotButton"),
  resetButton: document.getElementById("resetButton"),
  equationInput: document.getElementById("equationInput"),
  xMin: document.getElementById("xMin"),
  xMax: document.getElementById("xMax"),
  paramXInput: document.getElementById("paramXInput"),
  paramYInput: document.getElementById("paramYInput"),
  tMin: document.getElementById("tMin"),
  tMax: document.getElementById("tMax"),
  vectorInput: document.getElementById("vectorInput"),
  phasorInput: document.getElementById("phasorInput"),
  scatterInput: document.getElementById("scatterInput"),
  barInput: document.getElementById("barInput"),
  graphTitle: document.getElementById("graphTitle"),
  modeEyebrow: document.getElementById("modeEyebrow"),
  statusStrip: document.getElementById("statusStrip"),
  legend: document.getElementById("legend"),
  termList: document.getElementById("termList"),
  termCount: document.getElementById("termCount"),
  indicatorList: document.getElementById("indicatorList"),
  exampleList: document.getElementById("exampleList"),
  exampleStream: document.getElementById("exampleStream"),
  historyList: document.getElementById("historyList"),
  clearHistoryButton: document.getElementById("clearHistoryButton"),
  themeColor: document.getElementById("themeColor"),
  cursorColor: document.getElementById("cursorColor"),
  valueColor: document.getElementById("valueColor"),
  cursorSlider: document.getElementById("cursorSlider"),
  cursorValue: document.getElementById("cursorValue"),
};

function compileExpression(expression, variableName = "x") {
  let source = expression.trim();
  source = source.replace(/^y\s*=/i, "");
  source = source.replace(/^x\s*\(\s*t\s*\)\s*=/i, "");
  source = source.replace(/^y\s*\(\s*t\s*\)\s*=/i, "");
  source = source.toLowerCase();
  source = source.replace(/\s+/g, "");
  source = source.replace(/(\d)([xt])/g, "$1*$2");
  source = source.replace(/([xt])(\d)/g, "$1*$2");
  source = source.replace(/\^/g, "**");

  if (!/^[0-9xt+\-*/().,a-z]*$/.test(source)) {
    throw new Error("Use numbers, x or t, operators, and supported functions.");
  }

  source = source.replace(
    /\b(sin|cos|tan|asin|acos|atan|sqrt|abs|log|ln|exp|floor|ceil|round|min|max|pow)\b/g,
    (fn) => (fn === "ln" ? "Math.log" : `Math.${fn}`)
  );
  source = source.replace(/\bpi\b/g, "Math.PI").replace(/\be\b/g, "Math.E");

  if (/[a-z_]/i.test(source.replace(/Math\.[a-z]+/g, "").replace(/[xt]/g, ""))) {
    throw new Error("Unknown term found in the expression.");
  }

  const runner = new Function(variableName, `return ${source};`);
  return (value) => {
    const result = Number(runner(value));
    if (!Number.isFinite(result)) return null;
    return result;
  };
}

function setupCanvas() {
  const rect = els.canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(360, Math.floor(rect.width));
  const height = Math.max(300, Math.floor(rect.height));
  els.canvas.width = width * dpr;
  els.canvas.height = height * dpr;
  const ctx = els.canvas.getContext("2d", { willReadFrequently: true });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height, pad: 46, dpr };
}

function cssVar(name, fallback) {
  return getComputedStyle(document.body).getPropertyValue(name).trim() || fallback;
}

function canvasTheme() {
  return {
    plotBg: cssVar("--plot-bg", "#ffffff"),
    grid: cssVar("--grid", "#e7ecf4"),
    axis: cssVar("--axis", "#172033"),
    tick: cssVar("--tick", "#667085"),
  };
}

function niceRange(min, max) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [-5, 5];
  if (Math.abs(max - min) < 0.0001) {
    return [min - 1, max + 1];
  }
  const padding = (max - min) * 0.12;
  return [min - padding, max + padding];
}

function createMapper(width, height, pad, xMin, xMax, yMin, yMax) {
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;
  return {
    xMin,
    xMax,
    yMin,
    yMax,
    toX: (x) => pad + ((x - xMin) / (xMax - xMin)) * plotW,
    toY: (y) => height - pad - ((y - yMin) / (yMax - yMin)) * plotH,
  };
}

function drawGrid(ctx, width, height, pad, mapper, options = {}) {
  const { xMin, xMax, yMin, yMax } = mapper;
  const theme = canvasTheme();
  ctx.save();
  ctx.fillStyle = theme.plotBg;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  ctx.font = "12px Segoe UI, sans-serif";
  ctx.fillStyle = theme.tick;

  const xStep = chooseStep(xMin, xMax);
  const yStep = chooseStep(yMin, yMax);
  const startX = Math.ceil(xMin / xStep) * xStep;
  const startY = Math.ceil(yMin / yStep) * yStep;

  for (let x = startX; x <= xMax + xStep * 0.5; x += xStep) {
    const px = mapper.toX(x);
    ctx.beginPath();
    ctx.moveTo(px, pad);
    ctx.lineTo(px, height - pad);
    ctx.stroke();
    ctx.fillText(formatNumber(x), px + 3, height - pad + 18);
  }

  for (let y = startY; y <= yMax + yStep * 0.5; y += yStep) {
    const py = mapper.toY(y);
    ctx.beginPath();
    ctx.moveTo(pad, py);
    ctx.lineTo(width - pad, py);
    ctx.stroke();
    if (Math.abs(y) > yStep / 1000) ctx.fillText(formatNumber(y), 10, py - 4);
  }

  ctx.strokeStyle = theme.axis;
  ctx.lineWidth = 1.4;
  if (xMin <= 0 && xMax >= 0) {
    const x0 = mapper.toX(0);
    ctx.beginPath();
    ctx.moveTo(x0, pad);
    ctx.lineTo(x0, height - pad);
    ctx.stroke();
  }
  if (yMin <= 0 && yMax >= 0) {
    const y0 = mapper.toY(0);
    ctx.beginPath();
    ctx.moveTo(pad, y0);
    ctx.lineTo(width - pad, y0);
    ctx.stroke();
  }

  ctx.fillStyle = theme.axis;
  ctx.font = "700 12px Segoe UI, sans-serif";
  ctx.fillText(options.xLabel || "x", width - pad + 14, height - pad + 4);
  ctx.fillText(options.yLabel || "y", pad - 18, pad - 16);
  ctx.restore();
}

function chooseStep(min, max) {
  const raw = Math.abs(max - min) / 8;
  const power = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const scaled = raw / power;
  const nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return nice * power;
}

function formatNumber(value) {
  if (Math.abs(value) >= 1000 || Math.abs(value) < 0.01 && value !== 0) {
    return value.toExponential(1);
  }
  return Number(value.toFixed(2)).toString();
}

function plotEquation() {
  const expr = els.equationInput.value.trim();
  const xMin = Number(els.xMin.value);
  const xMax = Number(els.xMax.value);
  if (!(xMin < xMax)) throw new Error("x min must be smaller than x max.");

  const fn = compileExpression(expr, "x");
  const samples = [];
  const count = 720;
  for (let i = 0; i <= count; i++) {
    const x = xMin + ((xMax - xMin) * i) / count;
    const y = fn(x);
    if (y === null || Math.abs(y) > 1e6) {
      samples.push({ x, y: null });
    } else {
      samples.push({ x, y });
    }
  }

  const finite = samples.filter((point) => point.y !== null);
  if (finite.length < 2) throw new Error("The equation has too few plottable values.");
  const [yMin, yMax] = niceRange(
    Math.min(...finite.map((point) => point.y)),
    Math.max(...finite.map((point) => point.y))
  );

  const canvas = setupCanvas();
  const mapper = createMapper(canvas.width, canvas.height, canvas.pad, xMin, xMax, yMin, yMax);
  drawGrid(canvas.ctx, canvas.width, canvas.height, canvas.pad, mapper);
  drawCurve(canvas.ctx, mapper, samples, "#1f9bd1", 3);
  drawSampleDots(canvas.ctx, mapper, finite, "#f97316");

  const minPoint = finite.reduce((best, point) => (point.y < best.y ? point : best), finite[0]);
  const maxPoint = finite.reduce((best, point) => (point.y > best.y ? point : best), finite[0]);
  const intercepts = estimateXIntercepts(finite);

  return {
    title: `y = ${expr.replace(/^y\s*=/i, "")}`,
    legend: [{ label: "Function curve", color: "#1f9bd1" }, { label: "Sample points", color: "#f97316" }],
    indicators: [
      { label: "x domain", value: `${formatNumber(xMin)} to ${formatNumber(xMax)}` },
      { label: "y minimum", value: `${formatNumber(minPoint.y)} at x=${formatNumber(minPoint.x)}` },
      { label: "y maximum", value: `${formatNumber(maxPoint.y)} at x=${formatNumber(maxPoint.x)}` },
      { label: "x intercepts", value: intercepts.length ? intercepts.map(formatNumber).join(", ") : "none visible" },
    ],
    terms: explainEquation(expr, xMin, xMax),
    cursor: {
      color: "#1f9bd1",
      points: buildCursorPoints(finite, mapper, (point) => `x=${formatNumber(point.x)}, y=${formatNumber(point.y)}`),
    },
  };
}

function drawCurve(ctx, mapper, points, color, width) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  let active = false;
  let previous = null;

  points.forEach((point) => {
    if (point.y === null) {
      active = false;
      previous = null;
      return;
    }
    const px = mapper.toX(point.x);
    const py = mapper.toY(point.y);
    const jump = previous && Math.abs(py - previous.py) > 240;
    if (!active || jump) {
      ctx.moveTo(px, py);
      active = true;
    } else {
      ctx.lineTo(px, py);
    }
    previous = { px, py };
  });

  ctx.stroke();
  ctx.restore();
}

function drawSampleDots(ctx, mapper, finite, color) {
  ctx.save();
  ctx.fillStyle = color;
  const step = Math.max(1, Math.floor(finite.length / 18));
  finite.filter((_, index) => index % step === 0).forEach((point) => {
    ctx.beginPath();
    ctx.arc(mapper.toX(point.x), mapper.toY(point.y), 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function buildCursorPoints(points, mapper, formatter) {
  return points
    .filter((point) => point.x !== null && point.y !== null)
    .map((point, index) => ({
      sx: mapper.toX(point.x),
      sy: mapper.toY(point.y),
      label: formatter(point, index),
    }));
}

function estimateXIntercepts(points) {
  const hits = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const next = points[i];
    if (prev.y === 0) hits.push(prev.x);
    if (prev.y * next.y < 0) {
      const ratio = Math.abs(prev.y) / (Math.abs(prev.y) + Math.abs(next.y));
      hits.push(prev.x + (next.x - prev.x) * ratio);
    }
  }
  return hits.slice(0, 6);
}

function explainEquation(expr, xMin, xMax) {
  const normalized = expr.toLowerCase();
  const terms = [
    {
      name: "x",
      text: `Independent variable. The graph calculates y for x values from ${formatNumber(xMin)} to ${formatNumber(xMax)}.`,
    },
    {
      name: "y",
      text: "Dependent value. Its height changes according to the equation.",
    },
  ];

  if (normalized.includes("sin") || normalized.includes("cos") || normalized.includes("tan")) {
    terms.push({
      name: "trigonometric term",
      text: "Creates periodic wave behavior, useful for oscillation, AC signals, light, and circular motion.",
    });
  }
  if (normalized.includes("x^2") || normalized.includes("x**2")) {
    terms.push({
      name: "quadratic term",
      text: "The squared variable bends the graph into a parabola and changes curvature.",
    });
  }
  if (normalized.includes("exp")) {
    terms.push({
      name: "exponential term",
      text: "Models fast growth or decay, such as charging, population growth, or radioactive change.",
    });
  }
  if (normalized.includes("log") || normalized.includes("ln")) {
    terms.push({
      name: "logarithmic term",
      text: "Grows slowly and is commonly used for scales, gain, pH, and data compression.",
    });
  }
  if (/[+\-]\s*\d/.test(normalized)) {
    terms.push({
      name: "constant shift",
      text: "A number added or subtracted moves the curve up, down, or changes its intercepts.",
    });
  }
  if (/\d\s*\*\s*x|\d\s*x/.test(normalized)) {
    terms.push({
      name: "coefficient",
      text: "A number multiplying x changes steepness and stretches or compresses the curve.",
    });
  }
  return terms;
}

function plotParametric() {
  const xExpr = els.paramXInput.value.trim();
  const yExpr = els.paramYInput.value.trim();
  const tMin = Number(els.tMin.value);
  const tMax = Number(els.tMax.value);
  if (!(tMin < tMax)) throw new Error("t min must be smaller than t max.");

  const xFn = compileExpression(xExpr, "t");
  const yFn = compileExpression(yExpr, "t");
  const points = [];
  const count = 720;
  for (let i = 0; i <= count; i++) {
    const t = tMin + ((tMax - tMin) * i) / count;
    const x = xFn(t);
    const y = yFn(t);
    if (x === null || y === null || Math.abs(x) > 1e6 || Math.abs(y) > 1e6) {
      points.push({ t, x: null, y: null });
    } else {
      points.push({ t, x, y });
    }
  }

  const finite = points.filter((point) => point.x !== null && point.y !== null);
  if (finite.length < 2) throw new Error("The parametric equations have too few plottable values.");

  const [xMin, xMax] = niceRange(Math.min(...finite.map((point) => point.x)), Math.max(...finite.map((point) => point.x)));
  const [yMin, yMax] = niceRange(Math.min(...finite.map((point) => point.y)), Math.max(...finite.map((point) => point.y)));
  const canvas = setupCanvas();
  const mapper = createMapper(canvas.width, canvas.height, canvas.pad, xMin, xMax, yMin, yMax);
  drawGrid(canvas.ctx, canvas.width, canvas.height, canvas.pad, mapper);
  drawCurve(canvas.ctx, mapper, finite, "#8b5cf6", 3);
  drawDirectionMarkers(canvas.ctx, mapper, finite, "#f97316");

  return {
    title: `x(t) = ${xExpr}, y(t) = ${yExpr}`,
    legend: [{ label: "Trajectory", color: "#8b5cf6" }, { label: "Direction", color: "#f97316" }],
    indicators: [
      { label: "t interval", value: `${formatNumber(tMin)} to ${formatNumber(tMax)}` },
      { label: "x span", value: `${formatNumber(xMin)} to ${formatNumber(xMax)}` },
      { label: "y span", value: `${formatNumber(yMin)} to ${formatNumber(yMax)}` },
    ],
    terms: [
      { name: "t", text: "Parameter that moves the point along the curve step by step." },
      { name: "x(t)", text: "Horizontal position controlled by the parameter." },
      { name: "y(t)", text: "Vertical position controlled by the same parameter." },
      { name: "trajectory", text: "The path formed when all parameter positions are joined." },
    ],
    cursor: {
      color: "#8b5cf6",
      points: buildCursorPoints(finite, mapper, (point) => `t=${formatNumber(point.t)}, x=${formatNumber(point.x)}, y=${formatNumber(point.y)}`),
    },
  };
}

function drawDirectionMarkers(ctx, mapper, points, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  const slots = [0.25, 0.5, 0.75];
  slots.forEach((slot) => {
    const index = Math.max(1, Math.min(points.length - 2, Math.floor(points.length * slot)));
    const a = points[index - 1];
    const b = points[index + 1];
    const x1 = mapper.toX(a.x);
    const y1 = mapper.toY(a.y);
    const x2 = mapper.toX(b.x);
    const y2 = mapper.toY(b.y);
    drawArrowHead(ctx, x1, y1, x2, y2, 8);
  });
  ctx.restore();
}

function parseRows(text, minParts) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(",").map((part) => part.trim());
      if (parts.length < minParts) throw new Error(`Row ${index + 1} needs at least ${minParts} values.`);
      return parts;
    });
}

function plotVector() {
  const vectors = parseRows(els.vectorInput.value, 3).map((parts, index) => ({
    label: parts[0] || `Vector ${index + 1}`,
    x: Number(parts[1]),
    y: Number(parts[2]),
    color: parts[3] || palette[index % palette.length],
  }));
  vectors.forEach((vector) => {
    if (!Number.isFinite(vector.x) || !Number.isFinite(vector.y)) {
      throw new Error("Vector x and y components must be numbers.");
    }
  });

  const result = vectors.reduce(
    (sum, vector) => ({ label: "Resultant", x: sum.x + vector.x, y: sum.y + vector.y, color: "#172033" }),
    { x: 0, y: 0 }
  );
  const all = [...vectors, result];
  const maxAbs = Math.max(1, ...all.flatMap((vector) => [Math.abs(vector.x), Math.abs(vector.y)]));
  const span = maxAbs * 1.35;
  const canvas = setupCanvas();
  const mapper = createMapper(canvas.width, canvas.height, canvas.pad, -span, span, -span, span);
  drawGrid(canvas.ctx, canvas.width, canvas.height, canvas.pad, mapper);

  vectors.forEach((vector) => drawVectorArrow(canvas.ctx, mapper, vector, 3));
  drawVectorArrow(canvas.ctx, mapper, result, 4, true);

  const indicators = vectors.map((vector) => ({
    label: vector.label,
    value: `${formatNumber(vectorMagnitude(vector))} at ${formatNumber(vectorAngle(vector))} deg`,
  }));
  indicators.push({
    label: "Resultant",
    value: `${formatNumber(vectorMagnitude(result))} at ${formatNumber(vectorAngle(result))} deg`,
  });

  return {
    title: "Vector representation",
    legend: [...vectors, result].map((vector) => ({ label: vector.label, color: vector.color })),
    indicators,
    terms: [
      { name: "x component", text: "Horizontal part of a vector. Positive values point right and negative values point left." },
      { name: "y component", text: "Vertical part of a vector. Positive values point upward and negative values point downward." },
      { name: "magnitude", text: "Length of the arrow, calculated from the x and y components." },
      { name: "direction angle", text: "Angle measured from the positive x-axis using the vector direction." },
      { name: "resultant", text: "Single vector formed by adding all x components and all y components." },
    ],
    cursor: {
      color: "#172033",
      points: buildVectorCursorPoints([...vectors, result], mapper),
    },
  };
}

function buildVectorCursorPoints(vectors, mapper) {
  const points = [];
  vectors.forEach((vector) => {
    for (let i = 0; i <= 70; i++) {
      const ratio = i / 70;
      const x = vector.x * ratio;
      const y = vector.y * ratio;
      points.push({
        sx: mapper.toX(x),
        sy: mapper.toY(y),
        label: `${vector.label}: x=${formatNumber(x)}, y=${formatNumber(y)}`,
      });
    }
  });
  return points;
}

function drawVectorArrow(ctx, mapper, vector, width = 3, dashed = false) {
  const x1 = mapper.toX(0);
  const y1 = mapper.toY(0);
  const x2 = mapper.toX(vector.x);
  const y2 = mapper.toY(vector.y);
  ctx.save();
  ctx.strokeStyle = vector.color;
  ctx.fillStyle = vector.color;
  ctx.lineWidth = width;
  ctx.setLineDash(dashed ? [8, 5] : []);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  drawArrowHead(ctx, x1, y1, x2, y2, 12);
  ctx.font = "700 13px Segoe UI, sans-serif";
  ctx.fillText(vector.label, x2 + 8, y2 - 8);
  ctx.restore();
}

function drawArrowHead(ctx, x1, y1, x2, y2, size) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function vectorMagnitude(vector) {
  return Math.hypot(vector.x, vector.y);
}

function vectorAngle(vector) {
  return (Math.atan2(vector.y, vector.x) * 180) / Math.PI;
}

function plotPhasor() {
  const phasors = parseRows(els.phasorInput.value, 3).map((parts, index) => ({
    label: parts[0] || `Phasor ${index + 1}`,
    magnitude: Number(parts[1]),
    angle: Number(parts[2]),
    color: parts[3] || palette[index % palette.length],
  }));
  phasors.forEach((phasor) => {
    if (!Number.isFinite(phasor.magnitude) || !Number.isFinite(phasor.angle)) {
      throw new Error("Phasor magnitude and angle must be numbers.");
    }
  });

  const rectangular = phasors.map((phasor) => {
    const rad = (phasor.angle * Math.PI) / 180;
    return { ...phasor, x: phasor.magnitude * Math.cos(rad), y: phasor.magnitude * Math.sin(rad) };
  });
  const result = rectangular.reduce(
    (sum, phasor) => ({ x: sum.x + phasor.x, y: sum.y + phasor.y }),
    { x: 0, y: 0 }
  );
  const resultant = {
    label: "Resultant",
    magnitude: Math.hypot(result.x, result.y),
    angle: (Math.atan2(result.y, result.x) * 180) / Math.PI,
    x: result.x,
    y: result.y,
    color: "#172033",
  };

  const maxMag = Math.max(1, ...rectangular.map((phasor) => phasor.magnitude), resultant.magnitude);
  const canvas = setupCanvas();
  const center = { x: canvas.width / 2, y: canvas.height / 2 };
  const radius = Math.min(canvas.width, canvas.height) * 0.38;
  const scale = radius / maxMag;
  drawPolarGrid(canvas.ctx, center, radius);
  rectangular.forEach((phasor) => drawPolarArrow(canvas.ctx, center, phasor, scale, 3));
  drawPolarArrow(canvas.ctx, center, resultant, scale, 4, true);

  return {
    title: "Phasor diagram",
    legend: [...rectangular, resultant].map((phasor) => ({ label: phasor.label, color: phasor.color })),
    indicators: [
      ...phasors.map((phasor) => ({
        label: phasor.label,
        value: `${formatNumber(phasor.magnitude)} at ${formatNumber(phasor.angle)} deg`,
      })),
      {
        label: "Resultant",
        value: `${formatNumber(resultant.magnitude)} at ${formatNumber(resultant.angle)} deg`,
      },
    ],
    terms: [
      { name: "magnitude", text: "Length of the phasor. In AC circuits this can represent voltage, current, or flux size." },
      { name: "phase angle", text: "Angular position measured from the reference axis. Positive leads, negative lags." },
      { name: "real axis", text: "Horizontal reference component of the rotating quantity." },
      { name: "imaginary axis", text: "Vertical quadrature component, 90 degrees away from the real axis." },
      { name: "resultant", text: "Vector sum of all phasors after converting each magnitude and angle to components." },
    ],
    cursor: {
      color: "#172033",
      points: buildPhasorCursorPoints([...rectangular, resultant], center, scale),
    },
  };
}

function buildPhasorCursorPoints(phasors, center, scale) {
  const points = [];
  phasors.forEach((phasor) => {
    for (let i = 0; i <= 70; i++) {
      const ratio = i / 70;
      points.push({
        sx: center.x + phasor.x * scale * ratio,
        sy: center.y - phasor.y * scale * ratio,
        label: `${phasor.label}: ${formatNumber(phasor.magnitude)} at ${formatNumber(phasor.angle)} deg`,
      });
    }
  });
  return points;
}

function drawPolarGrid(ctx, center, radius) {
  const theme = canvasTheme();
  ctx.save();
  ctx.fillStyle = theme.plotBg;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, (radius * i) / 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let deg = 0; deg < 360; deg += 30) {
    const rad = (deg * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + radius * Math.cos(rad), center.y - radius * Math.sin(rad));
    ctx.stroke();
  }
  ctx.strokeStyle = theme.axis;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(center.x - radius - 18, center.y);
  ctx.lineTo(center.x + radius + 18, center.y);
  ctx.moveTo(center.x, center.y + radius + 18);
  ctx.lineTo(center.x, center.y - radius - 18);
  ctx.stroke();
  ctx.fillStyle = theme.tick;
  ctx.font = "12px Segoe UI, sans-serif";
  ctx.fillText("0 deg", center.x + radius + 22, center.y + 4);
  ctx.fillText("90 deg", center.x + 8, center.y - radius - 12);
  ctx.restore();
}

function drawPolarArrow(ctx, center, phasor, scale, width = 3, dashed = false) {
  const x2 = center.x + phasor.x * scale;
  const y2 = center.y - phasor.y * scale;
  ctx.save();
  ctx.strokeStyle = phasor.color;
  ctx.fillStyle = phasor.color;
  ctx.lineWidth = width;
  ctx.setLineDash(dashed ? [8, 5] : []);
  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  drawArrowHead(ctx, center.x, center.y, x2, y2, 12);
  ctx.font = "700 13px Segoe UI, sans-serif";
  ctx.fillText(phasor.label, x2 + 8, y2 - 8);
  ctx.restore();
}

function plotScatter() {
  const points = parseRows(els.scatterInput.value, 2).map((parts) => ({
    x: Number(parts[0]),
    y: Number(parts[1]),
  }));
  points.forEach((point) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      throw new Error("Scatter x and y values must be numbers.");
    }
  });
  if (points.length < 2) throw new Error("Scatter graph needs at least two points.");

  const [xMin, xMax] = niceRange(Math.min(...points.map((p) => p.x)), Math.max(...points.map((p) => p.x)));
  const [yMin, yMax] = niceRange(Math.min(...points.map((p) => p.y)), Math.max(...points.map((p) => p.y)));
  const canvas = setupCanvas();
  const mapper = createMapper(canvas.width, canvas.height, canvas.pad, xMin, xMax, yMin, yMax);
  drawGrid(canvas.ctx, canvas.width, canvas.height, canvas.pad, mapper);

  canvas.ctx.save();
  canvas.ctx.fillStyle = "#1f9bd1";
  points.forEach((point) => {
    canvas.ctx.beginPath();
    canvas.ctx.arc(mapper.toX(point.x), mapper.toY(point.y), 6, 0, Math.PI * 2);
    canvas.ctx.fill();
  });
  canvas.ctx.restore();

  const regression = linearRegression(points);
  const trendPoints = [
    { x: xMin, y: regression.slope * xMin + regression.intercept },
    { x: xMax, y: regression.slope * xMax + regression.intercept },
  ];
  drawCurve(canvas.ctx, mapper, trendPoints, "#f97316", 3);

  return {
    title: "Scatter graph with trend",
    legend: [{ label: "Data point", color: "#1f9bd1" }, { label: "Trend line", color: "#f97316" }],
    indicators: [
      { label: "points", value: String(points.length) },
      { label: "slope", value: formatNumber(regression.slope) },
      { label: "intercept", value: formatNumber(regression.intercept) },
      { label: "correlation", value: formatNumber(regression.r) },
    ],
    terms: [
      { name: "data point", text: "One measured pair of x and y values." },
      { name: "trend line", text: "Best straight-line estimate showing the overall direction of the data." },
      { name: "slope", text: "Change in y for each one-unit increase in x." },
      { name: "correlation", text: "Number from -1 to 1 showing how strongly the points follow a line." },
    ],
    cursor: {
      color: "#1f9bd1",
      points: buildCursorPoints(points, mapper, (point) => `x=${formatNumber(point.x)}, y=${formatNumber(point.y)}`),
    },
  };
}

function linearRegression(points) {
  const n = points.length;
  const sx = points.reduce((sum, p) => sum + p.x, 0);
  const sy = points.reduce((sum, p) => sum + p.y, 0);
  const sxy = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sx2 = points.reduce((sum, p) => sum + p.x * p.x, 0);
  const sy2 = points.reduce((sum, p) => sum + p.y * p.y, 0);
  const denominator = n * sx2 - sx * sx || 1;
  const slope = (n * sxy - sx * sy) / denominator;
  const intercept = (sy - slope * sx) / n;
  const rDen = Math.sqrt((n * sx2 - sx * sx) * (n * sy2 - sy * sy)) || 1;
  const r = (n * sxy - sx * sy) / rDen;
  return { slope, intercept, r };
}

function plotBar() {
  const bars = parseRows(els.barInput.value, 2).map((parts, index) => ({
    label: parts[0] || `Item ${index + 1}`,
    value: Number(parts[1]),
    color: parts[2] || palette[index % palette.length],
  }));
  bars.forEach((bar) => {
    if (!Number.isFinite(bar.value)) throw new Error("Bar values must be numbers.");
  });
  const canvas = setupCanvas();
  const ctx = canvas.ctx;
  const maxValue = Math.max(1, ...bars.map((bar) => bar.value));
  const minValue = Math.min(0, ...bars.map((bar) => bar.value));
  const mapper = createMapper(canvas.width, canvas.height, canvas.pad, -0.5, bars.length - 0.5, minValue, maxValue * 1.16);
  drawGrid(ctx, canvas.width, canvas.height, canvas.pad, mapper, { xLabel: "category", yLabel: "value" });

  const theme = canvasTheme();
  const barWidth = Math.max(18, ((canvas.width - canvas.pad * 2) / bars.length) * 0.56);
  bars.forEach((bar, index) => {
    const x = mapper.toX(index) - barWidth / 2;
    const y = mapper.toY(Math.max(0, bar.value));
    const base = mapper.toY(0);
    const h = base - y;
    ctx.fillStyle = bar.color;
    ctx.fillRect(x, y, barWidth, h);
    ctx.fillStyle = theme.axis;
    ctx.font = "700 12px Segoe UI, sans-serif";
    ctx.fillText(formatNumber(bar.value), x, y - 8);
    ctx.save();
    ctx.translate(mapper.toX(index), canvas.height - canvas.pad + 34);
    ctx.rotate(-Math.PI / 8);
    ctx.textAlign = "center";
    ctx.fillText(bar.label, 0, 0);
    ctx.restore();
  });

  const average = bars.reduce((sum, bar) => sum + bar.value, 0) / bars.length;
  return {
    title: "Bar chart",
    legend: bars.map((bar) => ({ label: bar.label, color: bar.color })),
    indicators: [
      { label: "bars", value: String(bars.length) },
      { label: "highest", value: `${bars.reduce((best, bar) => (bar.value > best.value ? bar : best), bars[0]).label}` },
      { label: "average", value: formatNumber(average) },
    ],
    terms: [
      { name: "category", text: "Label for each group being compared." },
      { name: "value", text: "Numerical height of each bar." },
      { name: "scale", text: "Axis numbering that keeps all bar heights comparable." },
      { name: "average", text: "Mean value across all bars, useful for quick comparison." },
    ],
    cursor: {
      color: "#172033",
      points: buildBarCursorPoints(bars, mapper),
    },
  };
}

function buildBarCursorPoints(bars, mapper) {
  const points = [];
  bars.forEach((bar, index) => {
    for (let i = 0; i < 45; i++) {
      points.push({
        sx: mapper.toX(index),
        sy: mapper.toY(bar.value),
        label: `${bar.label}: ${formatNumber(bar.value)}`,
      });
    }
  });
  return points;
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".segment").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  document.querySelectorAll(".mode-fields").forEach((section) => {
    section.classList.toggle("active", section.dataset.fields === mode);
  });
  render();
}

function setStream(stream) {
  state.stream = stream;
  renderExamples();
  render();
}

function render() {
  try {
    els.canvasError.hidden = true;
    let result;
    if (state.mode === "equation") result = plotEquation();
    if (state.mode === "parametric") result = plotParametric();
    if (state.mode === "vector") result = plotVector();
    if (state.mode === "phasor") result = plotPhasor();
    if (state.mode === "scatter") result = plotScatter();
    if (state.mode === "bar") result = plotBar();
    state.lastData = result;
    updateUI(result);
    setupCursorInspector(result.cursor);
  } catch (error) {
    const canvas = setupCanvas();
    canvas.ctx.fillStyle = canvasTheme().plotBg;
    canvas.ctx.fillRect(0, 0, canvas.width, canvas.height);
    setupCursorInspector(null);
    els.canvasError.textContent = error.message;
    els.canvasError.hidden = false;
  }
}

function updateUI(result) {
  const streamName = els.streamSelect.options[els.streamSelect.selectedIndex].text;
  const modeName = state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
  els.graphTitle.textContent = result.title;
  els.modeEyebrow.textContent = `${streamName} / ${modeName}`;
  els.statusStrip.innerHTML = result.indicators
    .slice(0, 3)
    .map((item, index) => {
      const color = palette[index % palette.length];
      return `<span class="status-pill"><span class="dot" style="background:${color}"></span>${escapeHTML(item.label)}: ${escapeHTML(item.value)}</span>`;
    })
    .join("");
  els.legend.innerHTML = result.legend
    .map((item) => `<span class="term-chip"><span class="dot" style="background:${escapeHTML(item.color)}"></span>${escapeHTML(item.label)}</span>`)
    .join("");
  els.termCount.textContent = `${result.terms.length} terms`;
  els.termList.innerHTML = result.terms
    .map((term) => `<article class="term-card"><strong>${escapeHTML(term.name)}</strong><p>${escapeHTML(term.text)}</p></article>`)
    .join("");
  els.indicatorList.innerHTML = result.indicators
    .map((item, index) => {
      const color = palette[index % palette.length];
      return `<div class="indicator"><span><span class="dot" style="background:${color}"></span> ${escapeHTML(item.label)}</span><b>${escapeHTML(item.value)}</b></div>`;
    })
    .join("");
}

function setupCursorInspector(cursor) {
  const hasCursor = Boolean(cursor?.points?.length);
  if (!hasCursor) {
    state.cursor = null;
    els.cursorSlider.disabled = true;
    els.cursorSlider.max = "0";
    els.cursorSlider.value = "0";
    els.cursorValue.textContent = "No graph point selected";
    return;
  }

  const ctx = els.canvas.getContext("2d", { willReadFrequently: true });
  state.cursor = {
    points: cursor.points,
    baseImage: ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
    dpr: window.devicePixelRatio || 1,
  };
  els.cursorSlider.disabled = false;
  els.cursorSlider.max = String(cursor.points.length - 1);
  state.cursorIndex = Math.min(Number(els.cursorSlider.value) || 0, cursor.points.length - 1);
  els.cursorSlider.value = String(state.cursorIndex);
  drawCursorAtIndex(state.cursorIndex);
}

function drawCursorAtIndex(index) {
  if (!state.cursor?.points?.length) return;
  const boundedIndex = Math.max(0, Math.min(index, state.cursor.points.length - 1));
  state.cursorIndex = boundedIndex;
  const point = state.cursor.points[boundedIndex];
  const ctx = els.canvas.getContext("2d", { willReadFrequently: true });
  ctx.putImageData(state.cursor.baseImage, 0, 0);
  ctx.setTransform(state.cursor.dpr, 0, 0, state.cursor.dpr, 0, 0);
  drawGraphCursor(ctx, point, state.prefs.cursorColor, state.prefs.valueColor);
  els.cursorValue.textContent = point.label;
}

function redrawCursorOnly() {
  if (!state.cursor) return;
  drawCursorAtIndex(state.cursorIndex);
}

function drawGraphCursor(ctx, point, cursorColor, valueColor) {
  ctx.save();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = cursorColor;
  ctx.fillStyle = cursorColor;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(point.sx - 18, point.sy);
  ctx.lineTo(point.sx + 18, point.sy);
  ctx.moveTo(point.sx, point.sy - 18);
  ctx.lineTo(point.sx, point.sy + 18);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = canvasTheme().plotBg;
  ctx.strokeStyle = cursorColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(point.sx, point.sy, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = cursorColor;
  ctx.beginPath();
  ctx.arc(point.sx, point.sy, 3, 0, Math.PI * 2);
  ctx.fill();
  drawCursorLabel(ctx, point, cursorColor, valueColor);
  ctx.restore();
}

function drawCursorLabel(ctx, point, cursorColor, valueColor) {
  const text = point.label;
  const dpr = window.devicePixelRatio || 1;
  const canvasWidth = ctx.canvas.width / dpr;
  const canvasHeight = ctx.canvas.height / dpr;
  ctx.font = "700 12px Segoe UI, sans-serif";
  const boxWidth = Math.min(ctx.measureText(text).width + 18, canvasWidth - 24);
  const boxHeight = 30;
  let x = point.sx + 12;
  let y = point.sy - 42;
  if (x + boxWidth > canvasWidth - 10) x = point.sx - boxWidth - 12;
  if (y < 10) y = point.sy + 16;
  if (y + boxHeight > canvasHeight - 10) y = canvasHeight - boxHeight - 10;

  roundedRect(ctx, x, y, boxWidth, boxHeight, 8);
  ctx.fillStyle = valueColor;
  ctx.fill();
  ctx.strokeStyle = cursorColor;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = readableTextColor(valueColor);
  ctx.fillText(text, x + 9, y + 19, boxWidth - 18);
}

function readableTextColor(hexColor) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  if (!match) return "#ffffff";
  const r = parseInt(match[1], 16);
  const g = parseInt(match[2], 16);
  const b = parseInt(match[3], 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#172033" : "#ffffff";
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function renderExamples() {
  const set = examples[state.stream] || examples.math;
  els.exampleStream.textContent = state.stream;
  els.exampleList.innerHTML = set
    .map(
      (example, index) => `<article class="example-card"><button type="button" data-example="${index}"><strong>${escapeHTML(example.title)}</strong><p>${escapeHTML(example.request)}</p></button></article>`
    )
    .join("");
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(prefsKey) || "{}");
    state.prefs = { ...state.prefs, ...stored };
  } catch {
    state.prefs = { ...state.prefs };
  }
}

function savePreferences() {
  try {
    localStorage.setItem(prefsKey, JSON.stringify(state.prefs));
  } catch {
    // Theme preferences are optional and should never interrupt plotting.
  }
}

function applyPreferences() {
  document.body.dataset.theme = state.prefs.theme;
  document.body.style.setProperty("--teal", state.prefs.themeColor);
  els.themeColor.value = state.prefs.themeColor;
  els.cursorColor.value = state.prefs.cursorColor;
  els.valueColor.value = state.prefs.valueColor;
  document.querySelectorAll(".theme-swatch").forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === state.prefs.theme);
  });
}

function setTheme(theme) {
  state.prefs.theme = theme;
  state.prefs.themeColor = themeAccent[theme] || state.prefs.themeColor;
  applyPreferences();
  savePreferences();
  render();
}

function setPreferenceColor(key, value) {
  state.prefs[key] = value;
  applyPreferences();
  savePreferences();
  if (key === "themeColor") {
    render();
  } else {
    redrawCursorOnly();
  }
}

function loadHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(historyKey) || "[]");
    state.history = Array.isArray(stored) ? stored.slice(0, historyLimit) : [];
  } catch {
    state.history = [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(historyKey, JSON.stringify(state.history));
  } catch {
    // History is a convenience feature, so private-mode storage failures are ignored.
  }
}

function renderHistory() {
  if (!state.history.length) {
    els.historyList.innerHTML = `<p class="empty-history">Your plotted graphs will appear here for quick access.</p>`;
    return;
  }
  els.historyList.innerHTML = state.history
    .map(
      (item) => `<article class="history-card"><button type="button" data-history-id="${escapeHTML(item.id)}"><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.prompt || item.mode)}</p><small>${escapeHTML(item.stream)} / ${escapeHTML(item.mode)} / ${escapeHTML(item.createdAt)}</small></button></article>`
    )
    .join("");
}

function collectFields() {
  return {
    equation: els.equationInput.value,
    xMin: els.xMin.value,
    xMax: els.xMax.value,
    paramX: els.paramXInput.value,
    paramY: els.paramYInput.value,
    tMin: els.tMin.value,
    tMax: els.tMax.value,
    vector: els.vectorInput.value,
    phasor: els.phasorInput.value,
    scatter: els.scatterInput.value,
    bar: els.barInput.value,
  };
}

function recordCurrentGraph() {
  if (!state.lastData) return;
  const fields = collectFields();
  const prompt = els.promptInput.value.trim();
  const signature = JSON.stringify({ mode: state.mode, stream: state.stream, fields, prompt });
  state.history = state.history.filter((item) => item.signature !== signature);
  state.history.unshift({
    id: String(Date.now()),
    signature,
    title: state.lastData.title,
    prompt,
    mode: state.mode,
    stream: state.stream,
    fields,
    createdAt: new Date().toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
  state.history = state.history.slice(0, historyLimit);
  saveHistory();
  renderHistory();
}

function applyFields(fields = {}) {
  if (fields.equation !== undefined) els.equationInput.value = fields.equation;
  if (fields.xMin !== undefined) els.xMin.value = fields.xMin;
  if (fields.xMax !== undefined) els.xMax.value = fields.xMax;
  if (fields.paramX !== undefined) els.paramXInput.value = fields.paramX;
  if (fields.paramY !== undefined) els.paramYInput.value = fields.paramY;
  if (fields.tMin !== undefined) els.tMin.value = fields.tMin;
  if (fields.tMax !== undefined) els.tMax.value = fields.tMax;
  if (fields.vector !== undefined) els.vectorInput.value = fields.vector;
  if (fields.phasor !== undefined) els.phasorInput.value = fields.phasor;
  if (fields.scatter !== undefined) els.scatterInput.value = fields.scatter;
  if (fields.bar !== undefined) els.barInput.value = fields.bar;
}

function restoreHistoryItem(id) {
  const item = state.history.find((entry) => entry.id === id);
  if (!item) return;
  els.promptInput.value = item.prompt || "";
  els.streamSelect.value = item.stream;
  state.stream = item.stream;
  renderExamples();
  setMode(item.mode);
  applyFields(item.fields);
  render();
}

function interpretRequest() {
  const text = els.promptInput.value.trim();
  if (!text) return;
  const lower = text.toLowerCase();
  if (lower.includes("phasor") || lower.includes("phase")) {
    setMode("phasor");
    recordCurrentGraph();
    return;
  }
  if (lower.includes("vector") || lower.includes("force") || lower.includes("velocity")) {
    setMode("vector");
    recordCurrentGraph();
    return;
  }
  if (lower.includes("scatter") || lower.includes("trend")) {
    setMode("scatter");
    recordCurrentGraph();
    return;
  }
  if (lower.includes("bar") || lower.includes("chart")) {
    setMode("bar");
    recordCurrentGraph();
    return;
  }
  if (lower.includes("parametric") || lower.includes("x(t)") || lower.includes("y(t)")) {
    setMode("parametric");
    recordCurrentGraph();
    return;
  }

  const equationMatch = text.match(/y\s*=\s*([^,;]+)/i) || text.match(/plot\s+([^,;]+)/i);
  const rangeMatch = text.match(/from\s*(-?\d+(?:\.\d+)?)\s*to\s*(-?\d+(?:\.\d+)?)/i);
  if (equationMatch) els.equationInput.value = equationMatch[1].trim();
  if (rangeMatch) {
    els.xMin.value = rangeMatch[1];
    els.xMax.value = rangeMatch[2];
  }
  setMode("equation");
  recordCurrentGraph();
}

function resetForMode() {
  if (state.mode === "equation") {
    els.equationInput.value = "sin(x) + 0.35*x";
    els.xMin.value = "-10";
    els.xMax.value = "10";
  }
  if (state.mode === "parametric") {
    els.paramXInput.value = "4*cos(t)";
    els.paramYInput.value = "2*sin(t)";
    els.tMin.value = "0";
    els.tMax.value = "6.28";
  }
  if (state.mode === "vector") {
    els.vectorInput.value = "Force A,4,3,#1f9bd1\nForce B,-2,5,#f97316\nVelocity,5,-2,#16a34a";
  }
  if (state.mode === "phasor") {
    els.phasorInput.value = "Voltage,230,0,#ef4444\nCurrent,8,-35,#2563eb\nFlux,120,70,#16a34a";
  }
  if (state.mode === "scatter") {
    els.scatterInput.value = "0,1\n1,2.1\n2,2.8\n3,4.4\n4,5.2\n5,7.1";
  }
  if (state.mode === "bar") {
    els.barInput.value = "Algebra,86,#1f9bd1\nMechanics,74,#f97316\nCircuits,92,#16a34a\nOptics,68,#a855f7";
  }
  render();
}

function applyExample(example) {
  els.promptInput.value = example.request;
  setMode(example.mode);
  applyFields(example.fields || {});
  render();
  recordCurrentGraph();
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.querySelectorAll(".theme-swatch").forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.theme));
});

els.streamSelect.addEventListener("change", (event) => setStream(event.target.value));
els.interpretButton.addEventListener("click", interpretRequest);
els.plotButton.addEventListener("click", () => {
  render();
  recordCurrentGraph();
});
els.resetButton.addEventListener("click", resetForMode);
els.clearHistoryButton.addEventListener("click", () => {
  state.history = [];
  saveHistory();
  renderHistory();
});
els.exampleList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-example]");
  if (!button) return;
  const example = examples[state.stream][Number(button.dataset.example)];
  applyExample(example);
});
els.historyList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-history-id]");
  if (!button) return;
  restoreHistoryItem(button.dataset.historyId);
});
els.cursorSlider.addEventListener("input", (event) => drawCursorAtIndex(Number(event.target.value)));
els.themeColor.addEventListener("input", (event) => setPreferenceColor("themeColor", event.target.value));
els.cursorColor.addEventListener("input", (event) => setPreferenceColor("cursorColor", event.target.value));
els.valueColor.addEventListener("input", (event) => setPreferenceColor("valueColor", event.target.value));

["input", "change"].forEach((eventName) => {
  [
    els.equationInput,
    els.xMin,
    els.xMax,
    els.paramXInput,
    els.paramYInput,
    els.tMin,
    els.tMax,
    els.vectorInput,
    els.phasorInput,
    els.scatterInput,
    els.barInput,
  ].forEach((element) => element.addEventListener(eventName, render));
});

let resizeTimer = null;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(render, 120);
});

loadPreferences();
applyPreferences();
loadHistory();
renderExamples();
renderHistory();
render();
