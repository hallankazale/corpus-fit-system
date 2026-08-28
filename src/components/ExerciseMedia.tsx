import { Dumbbell, Film } from "lucide-react";
import { useEffect, useState } from "react";
import type { WorkoutExercise } from "../services/workoutService";

type ExerciseMediaProps = {
  exercise: Pick<WorkoutExercise, "name" | "media_url" | "media_type" | "media_attribution">;
  compact?: boolean;
};

export function ExerciseMedia({ exercise, compact = false }: ExerciseMediaProps) {
  const [broken, setBroken] = useState(false);

  useEffect(() => setBroken(false), [exercise.media_url]);

  const hasMedia = Boolean(exercise.media_url) && exercise.media_type !== "none" && !broken;

  if (!hasMedia) {
    return (
      <div className={`exercise-media exercise-media--placeholder ${compact ? "is-compact" : ""}`}>
        <Dumbbell />
        {!compact && <span>{exercise.name}</span>}
      </div>
    );
  }

  return (
    <div className={`exercise-media ${compact ? "is-compact" : ""}`}>
      {exercise.media_type === "video" ? (
        <video
          src={exercise.media_url ?? undefined}
          autoPlay
          loop
          muted
          playsInline
          controls={!compact}
          preload={compact ? "metadata" : "auto"}
          onError={() => setBroken(true)}
          aria-label={`Demonstração de ${exercise.name}`}
        />
      ) : (
        <img
          src={exercise.media_url ?? undefined}
          alt={`Demonstração de ${exercise.name}`}
          loading={compact ? "lazy" : "eager"}
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
        />
      )}
      {!compact && exercise.media_attribution && (
        <small className="exercise-media__credit"><Film size={13} /> {exercise.media_attribution}</small>
      )}
    </div>
  );
}
