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
      head: pt(0.23, 0.50), shoulder: pt(0.31, 0.52), elbow: pt(0.38, 0.59), wrist: pt(0.46, 0.60),
      hip: pt(0.53, 0.57), knee: pt(0.70, 0.58), ankle: pt(0.86, 0.58)
    },
    end: {
      head: pt(0.23, 0.50), shoulder: pt(0.31, 0.52), elbow: pt(0.38, 0.59), wrist: pt(0.46, 0.60),
      hip: pt(0.53, 0.57), knee: pt(0.58, 0.39), ankle: pt(0.61, 0.22)
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
      head: pt(0.48, 0.20), shoulder: pt(0.49, 0.32), elbow: pt(0.57, 0.38), wrist: pt(0.48, 0.43),
      hip: pt(0.49, 0.51), knee: pt(0.50, 0.70), ankle: pt(0.50, 0.88)
    },
    end: {
      head: pt(0.43, 0.29), shoulder: pt(0.45, 0.40), elbow: pt(0.57, 0.45), wrist: pt(0.49, 0.48),
      hip: pt(0.41, 0.60), knee: pt(0.58, 0.70), ankle: pt(0.51, 0.88)
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
      head: pt(0.24, 0.45), shoulder: pt(0.32, 0.49), elbow: pt(0.34, 0.63), wrist: pt(0.33, 0.79),
      hip: pt(0.55, 0.56), knee: pt(0.70, 0.62), ankle: pt(0.84, 0.74)
    },
    end: {
      head: pt(0.23, 0.62), shoulder: pt(0.32, 0.64), elbow: pt(0.25, 0.72), wrist: pt(0.33, 0.79),
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

function limb(ctx: CanvasRenderingContext2D, a: Point, b: Point, width: number, color = "#858b92") {
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
  ctx.lineWidth = width; ctx.lineCap = "round"; ctx.strokeStyle = color; ctx.stroke();
}

function joint(ctx: CanvasRenderingContext2D, p: Point, r: number, color = "#92979d") {
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
}

function polygon(ctx: CanvasRenderingContext2D, points: Point[], fill: string) {
  ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}

function drawEquipment(ctx: CanvasRenderingContext2D, template: ExerciseTemplate, size: number) {
  ctx.strokeStyle = "#cbd0d5"; ctx.fillStyle = "#e5e8eb"; ctx.lineWidth = size * 0.012;
  if (template.equipment === "bench") {
    ctx.fillRect(size * 0.17, size * 0.62, size * 0.48, size * 0.055);
    ctx.fillRect(size * 0.22, size * 0.675, size * 0.035, size * 0.15);
    ctx.fillRect(size * 0.57, size * 0.675, size * 0.035, size * 0.15);
  }
  if (template.equipment === "mat") {
    ctx.fillStyle = "#eef0f2"; ctx.fillRect(size * 0.14, size * 0.79, size * 0.72, size * 0.025);
  }
  if (template.equipment === "floor" || template.equipment === "none") {
    ctx.beginPath(); ctx.moveTo(size * 0.12, size * 0.91); ctx.lineTo(size * 0.88, size * 0.91); ctx.stroke();
  }
}

function drawTarget(ctx: CanvasRenderingContext2D, target: ExerciseTemplate["target"], shoulder: Point, hip: Point, knee: Point, size: number) {
  ctx.save(); ctx.globalAlpha = 0.88; ctx.fillStyle = "#e53935"; ctx.strokeStyle = "#e53935";
  if (target === "abs" || target === "core") {
    const cx = lerp(shoulder.x, hip.x, 0.62), cy = lerp(shoulder.y, hip.y, 0.62);
    ctx.beginPath(); ctx.ellipse(cx, cy, size * 0.035, size * 0.075, Math.atan2(hip.y - shoulder.y, hip.x - shoulder.x) - Math.PI / 2, 0, Math.PI * 2); ctx.fill();
  }
  if (target === "chest") {
    const cx = lerp(shoulder.x, hip.x, 0.2), cy = lerp(shoulder.y, hip.y, 0.2);
    ctx.beginPath(); ctx.ellipse(cx, cy, size * 0.055, size * 0.048, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (target === "quads") {
    limb(ctx, hip, knee, size * 0.035, "#e53935");
  }
  if (target === "full") {
    ctx.globalAlpha = 0.40; limb(ctx, shoulder, hip, size * 0.05, "#e53935");
  }
  ctx.restore();
}

function drawSideFigure(ctx: CanvasRenderingContext2D, pose: Pose, template: ExerciseTemplate, size: number) {
  const head = px(pose.head, size), shoulder = px(pose.shoulder, size), elbow = px(pose.elbow, size), wrist = px(pose.wrist, size);
  const hip = px(pose.hip, size), knee = px(pose.knee, size), ankle = px(pose.ankle, size);
  const skin = "#777d84", light = "#989da3", dark = "#555b61";

  limb(ctx, shoulder, hip, size * 0.095, light);
  polygon(ctx, [
    pt(shoulder.x - size * 0.035, shoulder.y - size * 0.035),
    pt(shoulder.x + size * 0.045, shoulder.y + size * 0.025),
    pt(hip.x + size * 0.04, hip.y + size * 0.045),
    pt(hip.x - size * 0.045, hip.y - size * 0.02)
  ], "#8e949a");
  limb(ctx, shoulder, elbow, size * 0.045, skin); limb(ctx, elbow, wrist, size * 0.038, skin);
  limb(ctx, hip, knee, size * 0.062, dark); limb(ctx, knee, ankle, size * 0.052, skin);
  joint(ctx, shoulder, size * 0.025, light); joint(ctx, elbow, size * 0.020, light); joint(ctx, hip, size * 0.030, light); joint(ctx, knee, size * 0.026, light);
  ctx.beginPath(); ctx.arc(head.x, head.y, size * 0.050, 0, Math.PI * 2); ctx.fillStyle = "#8d9298"; ctx.fill();
  limb(ctx, ankle, pt(ankle.x + size * 0.055, ankle.y + size * 0.005), size * 0.026, dark);
  drawTarget(ctx, template.target, shoulder, hip, knee, size);
}

function drawFrontFigure(ctx: CanvasRenderingContext2D, pose: Pose, template: ExerciseTemplate, size: number) {
  const head = px(pose.head, size), shoulder = px(pose.shoulder, size), hip = px(pose.hip, size);
  const e1 = px(pose.elbow, size), w1 = px(pose.wrist, size), e2 = px(pose.otherElbow ?? pose.elbow, size), w2 = px(pose.otherWrist ?? pose.wrist, size);
  const k1 = px(pose.knee, size), a1 = px(pose.ankle, size), k2 = px(pose.otherKnee ?? pose.knee, size), a2 = px(pose.otherAnkle ?? pose.ankle, size);
  const leftShoulder = pt(shoulder.x - size * 0.07, shoulder.y), rightShoulder = pt(shoulder.x + size * 0.07, shoulder.y);
  const leftHip = pt(hip.x - size * 0.045, hip.y), rightHip = pt(hip.x + size * 0.045, hip.y);
  polygon(ctx, [leftShoulder, rightShoulder, rightHip, leftHip], "#8f959b");
  limb(ctx, leftShoulder, e1, size * 0.043); limb(ctx, e1, w1, size * 0.036);
  limb(ctx, rightShoulder, e2, size * 0.043); limb(ctx, e2, w2, size * 0.036);
  limb(ctx, leftHip, k1, size * 0.056, "#5c6268"); limb(ctx, k1, a1, size * 0.048);
  limb(ctx, rightHip, k2, size * 0.056, "#5c6268"); limb(ctx, k2, a2, size * 0.048);
  ctx.beginPath(); ctx.arc(head.x, head.y, size * 0.050, 0, Math.PI * 2); ctx.fillStyle = "#8d9298"; ctx.fill();
  drawTarget(ctx, template.target, shoulder, hip, k1, size);
}

function renderFrame(template: ExerciseTemplate, progress: number, size = 640): string {
  const canvas = document.createElement("canvas"); canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, size, size);
  const grad = ctx.createLinearGradient(0, 0, 0, size); grad.addColorStop(0, "#ffffff"); grad.addColorStop(1, "#f5f6f7"); ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
  drawEquipment(ctx, template, size);
  const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
  const pose = mixPose(template.start, template.end, eased);
  if (template.view === "front") drawFrontFigure(ctx, pose, template, size); else drawSideFigure(ctx, pose, template, size);
  ctx.fillStyle = "rgba(16,20,24,.08)"; ctx.beginPath(); ctx.ellipse(size * 0.5, size * 0.92, size * 0.26, size * 0.025, 0, 0, Math.PI * 2); ctx.fill();
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
