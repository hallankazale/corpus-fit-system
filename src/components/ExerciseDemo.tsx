import { useEffect, useMemo, useState } from "react";
import type { WorkoutExercise } from "../services/workoutService";
import { ExerciseMedia } from "./ExerciseMedia";

type Props = {
  exercise: WorkoutExercise;
};

export function ExerciseDemo({ exercise }: Props) {
  const frames = useMemo(() => publicDomainFrames(exercise), [exercise.media_url, exercise.media_type]);
  const [frame, setFrame] = useState(0);
  const [secondFrameBroken, setSecondFrameBroken] = useState(false);

  useEffect(() => {
    setFrame(0);
    setSecondFrameBroken(false);
  }, [exercise.id]);

  useEffect(() => {
    if (frames.length < 2 || secondFrameBroken) return;
    const timer = window.setInterval(() => setFrame((current) => current === 0 ? 1 : 0), 650);
    return () => window.clearInterval(timer);
  }, [frames, secondFrameBroken]);

  if (exercise.media_type === "gif" || exercise.media_type === "video") {
    return <ExerciseMedia exercise={exercise} />;
  }

  if (frames.length > 0) {
    const active = secondFrameBroken ? frames[0] : frames[frame] ?? frames[0];
    return (
      <div className="exercise-demo-frame">
        <img
          src={active}
          alt={`Demonstração do movimento ${exercise.name}`}
          onError={() => { if (frame === 1) setSecondFrameBroken(true); }}
          referrerPolicy="no-referrer"
        />
        {frames.length > 1 && !secondFrameBroken && <span className="exercise-demo-badge">Demonstração animada</span>}
      </div>
    );
  }

  return <ExerciseMedia exercise={exercise} />;
}

function publicDomainFrames(exercise: WorkoutExercise) {
  const url = exercise.media_url?.trim() ?? "";
  if (!url || exercise.media_type !== "image") return [];
  const frames = [url];
  if (url.includes("/free-exercise-db@") && /\/0\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(url)) {
    frames.push(url.replace(/\/0\.(jpg|jpeg|png|webp)(\?.*)?$/i, "/1.$1$2"));
  }
  return frames;
}
