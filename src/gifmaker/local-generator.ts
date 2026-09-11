export type GeneratedFrame = { id: string; name: string; dataUrl: string };
export type FrameCount = 4 | 6 | 8;
export type ExerciseKey = "leg-raise" | "squat" | "push-up" | "crunch" | "plank" | "jumping-jack";

type Point = { x: number; y: number };
type Pose = {
  head: Point;
  shoulder: Point;
  elbow: Point;
  wrist: Point;
  hip: Point;
  knee: Point;
  ankle: Point;
  otherElbow?: Point;
  otherWrist?: Point;
  otherKnee?: Point;
  otherAnkle?: Point;
};

type ExerciseTemplate = {
  key: ExerciseKey;
  name: string;
  category: "chest" | "back" | "legs" | "shoulders" | "core" | "cardio";
  target: "abs" | "quads" | "chest" | "core" | "full";
  view: "side" | "front";
  start: Pose;
  end: Pose;
  equipment: "bench" | "floor" | "none" | "mat";
};

const pt = (x: number, y: number): Point => ({ x, y });

export const LOCAL_EXERCISES: ExerciseTemplate[] = [
  {
    key: "leg-raise",
    name: "Elevação de pernas",
    category: "core",
    target: "abs",
    view: "side",
    equipment: "bench",
    start: {
      head: pt(0.22, 0.49), shoulder: pt(0.31, 0.52), elbow: pt(0.39, 0.58), wrist: pt(0.47, 0.59),
      hip: pt(0.53, 0.56), knee: pt(0.70, 0.57), ankle: pt(0.86, 0.57)
    },
    end: {
      head: pt(0.22, 0.49), shoulder: pt(0.31, 0.52), elbow: pt(0.39, 0.58), wrist: pt(0.47, 0.59),
      hip: pt(0.53, 0.56), knee: pt(0.58, 0.39), ankle: pt(0.61, 0.21)
    }
  },
  {
    key: "squat",
    name: "Agachamento",
    category: "legs",
    target: "quads",
    view: "side",
    equipment: "none",
    start: {
      head: pt(0.49, 0.19), shoulder: pt(0.49, 0.31), elbow: pt(0.59, 0.38), wrist: pt(0.50, 0.43),
      hip: pt(0.49, 0.51), knee: pt(0.50, 0.70), ankle: pt(0.50, 0.88)
    },
    end: {
      head: pt(0.43, 0.28), shoulder: pt(0.45, 0.40), elbow: pt(0.59, 0.45), wrist: pt(0.50, 0.48),
      hip: pt(0.41, 0.60), knee: pt(0.59, 0.70), ankle: pt(0.51, 0.88)
    }
  },
  {
    key: "push-up",
    name: "Flexão",
    category: "chest",
    target: "chest",
    view: "side",
    equipment: "floor",
    start: {
      head: pt(0.24, 0.44), shoulder: pt(0.32, 0.49), elbow: pt(0.34, 0.63), wrist: pt(0.33, 0.79),
      hip: pt(0.55, 0.56), knee: pt(0.70, 0.62), ankle: pt(0.84, 0.74)
    },
    end: {
      head: pt(0.23, 0.61), shoulder: pt(0.32, 0.64), elbow: pt(0.25, 0.72), wrist: pt(0.33, 0.79),
      hip: pt(0.55, 0.67), knee: pt(0.70, 0.69), ankle: pt(0.84, 0.75)
    }
  },
  {
    key: "crunch",
    name: "Abdominal crunch",
    category: "core",
    target: "abs",
    view: "side",
    equipment: "mat",
    start: {
      head: pt(0.27, 0.61), shoulder: pt(0.36, 0.63), elbow: pt(0.30, 0.52), wrist: pt(0.22, 0.48),
      hip: pt(0.52, 0.70), knee: pt(0.68, 0.59), ankle: pt(0.78, 0.76)
    },
    end: {
      head: pt(0.34, 0.44), shoulder: pt(0.42, 0.49), elbow: pt(0.36, 0.40), wrist: pt(0.29, 0.39),
      hip: pt(0.52, 0.70), knee: pt(0.68, 0.59), ankle: pt(0.78, 0.76)
    }
  },
  {
    key: "plank",
    name: "Prancha",
    category: "core",
    target: "core",
    view: "side",
    equipment: "mat",
    start: {
      head: pt(0.25, 0.50), shoulder: pt(0.33, 0.53), elbow: pt(0.35, 0.69), wrist: pt(0.27, 0.71),
      hip: pt(0.55, 0.59), knee: pt(0.70, 0.64), ankle: pt(0.84, 0.73)
    },
    end: {
      head: pt(0.25, 0.49), shoulder: pt(0.33, 0.52), elbow: pt(0.35, 0.69), wrist: pt(0.27, 0.71),
      hip: pt(0.55, 0.58), knee: pt(0.70, 0.63), ankle: pt(0.84, 0.73)
    }
  },
  {
    key: "jumping-jack",
    name: "Polichinelo",
    category: "cardio",
    target: "full",
    view: "front",
    equipment: "none",
    start: {
      head: pt(0.50, 0.18), shoulder: pt(0.50, 0.32), elbow: pt(0.42, 0.47), wrist: pt(0.40, 0.64),
      otherElbow: pt(0.58, 0.47), otherWrist: pt(0.60, 0.64),
      hip: pt(0.50, 0.56), knee: pt(0.46, 0.72), ankle: pt(0.46, 0.90),
      otherKnee: pt(0.54, 0.72), otherAnkle: pt(0.54, 0.90)
    },
    end: {
      head: pt(0.50, 0.18), shoulder: pt(0.50, 0.32), elbow: pt(0.35, 0.24), wrist: pt(0.27, 0.10),
      otherElbow: pt(0.65, 0.24), otherWrist: pt(0.73, 0.10),
      hip: pt(0.50, 0.56), knee: pt(0.40, 0.72), ankle: pt(0.30, 0.89),
      otherKnee: pt(0.60, 0.72), otherAnkle: pt(0.70, 0.89)
    }
  }
];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function mixPoint(a: Point, b: Point, t: number): Point { return pt(lerp(a.x, b.x, t), lerp(a.y, b.y, t)); }

function mixPose(a: Pose, b: Pose, t: number): Pose {
  const optional = (x?: Point, y?: Point) => x && y ? mixPoint(x, y, t) : undefined;
  return {
    head: mixPoint(a.head, b.head, t), shoulder: mixPoint(a.shoulder, b.shoulder, t),
    elbow: mixPoint(a.elbow, b.elbow, t), wrist: mixPoint(a.wrist, b.wrist, t),
    hip: mixPoint(a.hip, b.hip, t), knee: mixPoint(a.knee, b.knee, t), ankle: mixPoint(a.ankle, b.ankle, t),
    otherElbow: optional(a.otherElbow, b.otherElbow), otherWrist: optional(a.otherWrist, b.otherWrist),
    otherKnee: optional(a.otherKnee, b.otherKnee), otherAnkle: optional(a.otherAnkle, b.otherAnkle)
  };
}

function px(p: Point, size: number): Point { return pt(p.x * size, p.y * size); }
function distance(a: Point, b: Point) { return Math.hypot(b.x - a.x, b.y - a.y); }
function angle(a: Point, b: Point) { return Math.atan2(b.y - a.y, b.x - a.x); }

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawCapsule(
  ctx: CanvasRenderingContext2D,
  a: Point,
  b: Point,
  ra: number,
  rb: number,
  light: string,
  dark: string,
  alpha = 1
) {
  const len = distance(a, b);
  const rot = angle(a, b);
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  const grad = ctx.createLinearGradient(0, -Math.max(ra, rb), 0, Math.max(ra, rb));
  grad.addColorStop(0, light);
  grad.addColorStop(0.52, "#8d949b");
  grad.addColorStop(1, dark);
  ctx.fillStyle = grad;
  ctx.strokeStyle = "rgba(36,43,50,.22)";
  ctx.lineWidth = Math.max(1.5, ra * 0.10);
  ctx.beginPath();
  ctx.moveTo(0, -ra);
  ctx.lineTo(len, -rb);
  ctx.quadraticCurveTo(len + rb, 0, len, rb);
  ctx.lineTo(0, ra);
  ctx.quadraticCurveTo(-ra, 0, 0, -ra);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawJoint(ctx: CanvasRenderingContext2D, p: Point, r: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const grad = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.35, r * 0.15, p.x, p.y, r);
  grad.addColorStop(0, "#b5bbc1");
  grad.addColorStop(1, "#686f76");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(45,51,57,.18)";
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.stroke();
  ctx.restore();
}

function drawHead(ctx: CanvasRenderingContext2D, head: Point, shoulder: Point, size: number, front = false) {
  const rot = front ? 0 : angle(head, shoulder) - Math.PI / 2;
  ctx.save();
  ctx.translate(head.x, head.y);
  ctx.rotate(rot);
  const rx = size * 0.046;
  const ry = size * 0.057;
  const grad = ctx.createLinearGradient(-rx, -ry, rx, ry);
  grad.addColorStop(0, "#c1c6cb");
  grad.addColorStop(0.45, "#979ea5");
  grad.addColorStop(1, "#666d74");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(40,46,52,.23)";
  ctx.lineWidth = size * 0.004;
  ctx.stroke();
  if (!front) {
    ctx.fillStyle = "rgba(58,64,70,.45)";
    ctx.beginPath();
    ctx.ellipse(rx * 0.72, -ry * 0.04, rx * 0.13, ry * 0.19, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTorsoSide(ctx: CanvasRenderingContext2D, shoulder: Point, hip: Point, size: number, alpha = 1) {
  const len = distance(shoulder, hip);
  const rot = angle(shoulder, hip);
  ctx.save();
  ctx.translate(shoulder.x, shoulder.y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  const top = size * 0.075;
  const bottom = size * 0.058;
  const grad = ctx.createLinearGradient(0, -top, 0, top);
  grad.addColorStop(0, "#b2b8be");
  grad.addColorStop(0.5, "#8c939a");
  grad.addColorStop(1, "#666d74");
  ctx.fillStyle = grad;
  ctx.strokeStyle = "rgba(37,43,49,.23)";
  ctx.lineWidth = size * 0.004;
  ctx.beginPath();
  ctx.moveTo(0, -top);
  ctx.bezierCurveTo(len * 0.28, -top * 1.12, len * 0.66, -bottom * 1.06, len, -bottom);
  ctx.quadraticCurveTo(len + bottom * 0.45, 0, len, bottom);
  ctx.bezierCurveTo(len * 0.66, bottom * 1.06, len * 0.28, top * 1.05, 0, top);
  ctx.quadraticCurveTo(-top * 0.42, 0, 0, -top);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.25)";
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  ctx.moveTo(len * 0.08, -top * 0.50);
  ctx.bezierCurveTo(len * 0.40, -top * 0.72, len * 0.72, -bottom * 0.55, len * 0.92, -bottom * 0.38);
  ctx.stroke();
  ctx.restore();
}

function drawTorsoFront(ctx: CanvasRenderingContext2D, shoulder: Point, hip: Point, size: number) {
  const y1 = shoulder.y - size * 0.028;
  const y2 = hip.y + size * 0.035;
  const sw = size * 0.090;
  const hw = size * 0.056;
  const grad = ctx.createLinearGradient(shoulder.x - sw, shoulder.y, shoulder.x + sw, hip.y);
  grad.addColorStop(0, "#aeb4ba");
  grad.addColorStop(0.5, "#888f96");
  grad.addColorStop(1, "#626970");
  ctx.fillStyle = grad;
  ctx.strokeStyle = "rgba(37,43,49,.22)";
  ctx.lineWidth = size * 0.004;
  ctx.beginPath();
  ctx.moveTo(shoulder.x - sw, y1);
  ctx.quadraticCurveTo(shoulder.x - sw * 1.05, lerp(y1, y2, 0.34), hip.x - hw, y2);
  ctx.quadraticCurveTo(hip.x, y2 + size * 0.012, hip.x + hw, y2);
  ctx.quadraticCurveTo(shoulder.x + sw * 1.05, lerp(y1, y2, 0.34), shoulder.x + sw, y1);
  ctx.quadraticCurveTo(shoulder.x, y1 - size * 0.022, shoulder.x - sw, y1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.23)";
  ctx.beginPath();
  ctx.moveTo(shoulder.x, y1 + size * 0.015);
  ctx.lineTo(hip.x, y2 - size * 0.015);
  ctx.stroke();
}

function drawEquipment(ctx: CanvasRenderingContext2D, template: ExerciseTemplate, size: number) {
  ctx.save();
  if (template.equipment === "bench") {
    ctx.fillStyle = "rgba(18,24,29,.10)";
    roundedRect(ctx, size * 0.155, size * 0.635, size * 0.52, size * 0.052, size * 0.018);
    ctx.fill();
    const pad = ctx.createLinearGradient(0, size * 0.60, 0, size * 0.67);
    pad.addColorStop(0, "#565e66");
    pad.addColorStop(1, "#2e353b");
    ctx.fillStyle = pad;
    roundedRect(ctx, size * 0.165, size * 0.605, size * 0.50, size * 0.050, size * 0.018);
    ctx.fill();
    ctx.strokeStyle = "rgba(20,26,31,.30)";
    ctx.lineWidth = size * 0.005;
    ctx.stroke();
    const metal = ctx.createLinearGradient(size * 0.20, 0, size * 0.28, 0);
    metal.addColorStop(0, "#d6dadd");
    metal.addColorStop(0.5, "#9ea5ab");
    metal.addColorStop(1, "#70777e");
    ctx.fillStyle = metal;
    roundedRect(ctx, size * 0.22, size * 0.655, size * 0.028, size * 0.17, size * 0.010);
    ctx.fill();
    roundedRect(ctx, size * 0.58, size * 0.655, size * 0.028, size * 0.17, size * 0.010);
    ctx.fill();
    roundedRect(ctx, size * 0.19, size * 0.815, size * 0.09, size * 0.022, size * 0.010);
    ctx.fill();
    roundedRect(ctx, size * 0.55, size * 0.815, size * 0.09, size * 0.022, size * 0.010);
    ctx.fill();
  }
  if (template.equipment === "mat") {
    const mat = ctx.createLinearGradient(size * 0.14, 0, size * 0.86, 0);
    mat.addColorStop(0, "#d8dde1");
    mat.addColorStop(0.5, "#f0f2f3");
    mat.addColorStop(1, "#c9cfd4");
    ctx.fillStyle = mat;
    roundedRect(ctx, size * 0.14, size * 0.79, size * 0.72, size * 0.024, size * 0.012);
    ctx.fill();
  }
  if (template.equipment === "floor" || template.equipment === "none") {
    ctx.strokeStyle = "#d7dce0";
    ctx.lineWidth = size * 0.006;
    ctx.beginPath();
    ctx.moveTo(size * 0.12, size * 0.91);
    ctx.lineTo(size * 0.88, size * 0.91);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTarget(ctx: CanvasRenderingContext2D, target: ExerciseTemplate["target"], shoulder: Point, hip: Point, knee: Point, size: number, front = false) {
  ctx.save();
  ctx.globalAlpha = 0.96;
  const red = ctx.createLinearGradient(shoulder.x, shoulder.y, hip.x, hip.y);
  red.addColorStop(0, "#ff645d");
  red.addColorStop(0.45, "#ef3934");
  red.addColorStop(1, "#bf1e1a");
  ctx.fillStyle = red;
  ctx.strokeStyle = "rgba(125,18,15,.38)";
  ctx.lineWidth = size * 0.003;

  if (target === "abs" || target === "core") {
    const cx = lerp(shoulder.x, hip.x, 0.60);
    const cy = lerp(shoulder.y, hip.y, 0.60);
    const rot = front ? 0 : angle(shoulder, hip) - Math.PI / 2;
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    const rx = size * (front ? 0.041 : 0.033);
    const ry = size * 0.070;
    for (const offset of [-0.42, 0.03, 0.47]) {
      ctx.beginPath();
      ctx.ellipse(0, ry * offset, rx, ry * 0.27, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (target === "core") {
      ctx.globalAlpha = 0.32;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * 1.55, ry * 1.12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (target === "chest") {
    const cx = lerp(shoulder.x, hip.x, 0.22);
    const cy = lerp(shoulder.y, hip.y, 0.22);
    const rot = front ? 0 : angle(shoulder, hip) - Math.PI / 2;
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(front ? -size * 0.032 : 0, 0, size * 0.052, size * 0.040, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (front) {
      ctx.beginPath();
      ctx.ellipse(size * 0.032, 0, size * 0.052, size * 0.040, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  if (target === "quads") {
    drawCapsule(ctx, hip, knee, size * 0.042, size * 0.034, "#ff6a62", "#c4211d", 0.96);
  }

  if (target === "full") {
    ctx.globalAlpha = 0.24;
    ctx.beginPath();
    ctx.ellipse(lerp(shoulder.x, hip.x, 0.52), lerp(shoulder.y, hip.y, 0.52), size * 0.060, size * 0.115, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSideFigure(ctx: CanvasRenderingContext2D, pose: Pose, template: ExerciseTemplate, size: number) {
  const head = px(pose.head, size), shoulder = px(pose.shoulder, size), elbow = px(pose.elbow, size), wrist = px(pose.wrist, size);
  const hip = px(pose.hip, size), knee = px(pose.knee, size), ankle = px(pose.ankle, size);
  const off = size * 0.012;
  const farShoulder = pt(shoulder.x, shoulder.y + off), farElbow = pt(elbow.x, elbow.y + off), farWrist = pt(wrist.x, wrist.y + off);
  const farHip = pt(hip.x, hip.y + off), farKnee = pt(knee.x, knee.y + off), farAnkle = pt(ankle.x, ankle.y + off);

  drawCapsule(ctx, farHip, farKnee, size * 0.047, size * 0.039, "#a2a8ae", "#666d74", 0.52);
  drawCapsule(ctx, farKnee, farAnkle, size * 0.037, size * 0.026, "#aeb4ba", "#6c737a", 0.52);
  drawCapsule(ctx, farShoulder, farElbow, size * 0.033, size * 0.026, "#b0b6bc", "#727980", 0.50);
  drawCapsule(ctx, farElbow, farWrist, size * 0.027, size * 0.020, "#b5bbc1", "#757c83", 0.50);

  drawTorsoSide(ctx, shoulder, hip, size);
  drawJoint(ctx, hip, size * 0.040);
  drawCapsule(ctx, hip, knee, size * 0.052, size * 0.043, "#aeb4ba", "#636a71");
  drawJoint(ctx, knee, size * 0.032);
  drawCapsule(ctx, knee, ankle, size * 0.041, size * 0.029, "#b6bcc2", "#6c737a");
  drawCapsule(ctx, ankle, pt(ankle.x + size * 0.060, ankle.y + size * 0.006), size * 0.025, size * 0.016, "#858c93", "#4f565c");

  drawJoint(ctx, shoulder, size * 0.031);
  drawCapsule(ctx, shoulder, elbow, size * 0.038, size * 0.029, "#b8bec4", "#70777e");
  drawJoint(ctx, elbow, size * 0.024);
  drawCapsule(ctx, elbow, wrist, size * 0.030, size * 0.021, "#bec3c8", "#777e85");
  drawCapsule(ctx, wrist, pt(wrist.x + size * 0.034, wrist.y), size * 0.019, size * 0.011, "#a4abb2", "#60676e");

  drawTarget(ctx, template.target, shoulder, hip, knee, size, false);
  drawHead(ctx, head, shoulder, size, false);

  ctx.save();
  ctx.strokeStyle = "rgba(48,55,61,.22)";
  ctx.lineWidth = size * 0.003;
  ctx.beginPath();
  ctx.moveTo(lerp(hip.x, knee.x, 0.18), lerp(hip.y, knee.y, 0.18));
  ctx.lineTo(lerp(hip.x, knee.x, 0.82), lerp(hip.y, knee.y, 0.82));
  ctx.stroke();
  ctx.restore();
}

function drawFrontFigure(ctx: CanvasRenderingContext2D, pose: Pose, template: ExerciseTemplate, size: number) {
  const head = px(pose.head, size), shoulder = px(pose.shoulder, size), hip = px(pose.hip, size);
  const e1 = px(pose.elbow, size), w1 = px(pose.wrist, size), e2 = px(pose.otherElbow ?? pose.elbow, size), w2 = px(pose.otherWrist ?? pose.wrist, size);
  const k1 = px(pose.knee, size), a1 = px(pose.ankle, size), k2 = px(pose.otherKnee ?? pose.knee, size), a2 = px(pose.otherAnkle ?? pose.ankle, size);
  const ls = pt(shoulder.x - size * 0.074, shoulder.y), rs = pt(shoulder.x + size * 0.074, shoulder.y);
  const lh = pt(hip.x - size * 0.046, hip.y), rh = pt(hip.x + size * 0.046, hip.y);

  drawCapsule(ctx, lh, k1, size * 0.046, size * 0.038, "#aab0b6", "#636a71");
  drawCapsule(ctx, k1, a1, size * 0.036, size * 0.027, "#b4bac0", "#6b7279");
  drawCapsule(ctx, rh, k2, size * 0.046, size * 0.038, "#aab0b6", "#636a71");
  drawCapsule(ctx, k2, a2, size * 0.036, size * 0.027, "#b4bac0", "#6b7279");
  drawTorsoFront(ctx, shoulder, hip, size);
  drawCapsule(ctx, ls, e1, size * 0.034, size * 0.027, "#b8bec4", "#70777e");
  drawCapsule(ctx, e1, w1, size * 0.028, size * 0.019, "#bfc4c9", "#767d84");
  drawCapsule(ctx, rs, e2, size * 0.034, size * 0.027, "#b8bec4", "#70777e");
  drawCapsule(ctx, e2, w2, size * 0.028, size * 0.019, "#bfc4c9", "#767d84");
  drawTarget(ctx, template.target, shoulder, hip, k1, size, true);
  drawHead(ctx, head, shoulder, size, true);
}

function renderFrame(template: ExerciseTemplate, progress: number, size = 720): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const bg = ctx.createRadialGradient(size * 0.48, size * 0.36, size * 0.05, size * 0.50, size * 0.50, size * 0.78);
  bg.addColorStop(0, "#ffffff");
  bg.addColorStop(0.72, "#fafbfc");
  bg.addColorStop(1, "#f0f2f4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "rgba(20,26,32,.08)";
  ctx.beginPath();
  ctx.ellipse(size * 0.50, size * 0.91, size * 0.27, size * 0.028, 0, 0, Math.PI * 2);
  ctx.fill();

  drawEquipment(ctx, template, size);
  const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
  const pose = mixPose(template.start, template.end, eased);
  if (template.view === "front") drawFrontFigure(ctx, pose, template, size);
  else drawSideFigure(ctx, pose, template, size);

  ctx.strokeStyle = "rgba(255,255,255,.60)";
  ctx.lineWidth = size * 0.004;
  roundedRect(ctx, size * 0.025, size * 0.025, size * 0.95, size * 0.95, size * 0.035);
  ctx.stroke();

  return canvas.toDataURL("image/png");
}

export function getExerciseTemplate(key: ExerciseKey) {
  return LOCAL_EXERCISES.find(item => item.key === key) ?? LOCAL_EXERCISES[0];
}

export async function generateLocalExerciseFrames(key: ExerciseKey, count: FrameCount): Promise<GeneratedFrame[]> {
  const template = getExerciseTemplate(key);
  const frames: GeneratedFrame[] = [];
  for (let i = 0; i < count; i++) {
    const progress = count <= 1 ? 0 : i / (count - 1);
    frames.push({ id: crypto.randomUUID(), name: `frame-${i + 1}`, dataUrl: renderFrame(template, progress) });
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  }
  return frames;
}