"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export interface ProgressStage {
  label: string;
  // Target percentage (0-100) this stage eases toward. The last stage's
  // value is a hard ceiling — this hook never reports past it, since the
  // real completion (100%, "done") only happens when the caller's own
  // request resolves and swaps this UI out for the real result.
  progress: number;
}

// Self-paced stepper for a long-running request: advances through `stages`
// on a timer, holding on the final stage indefinitely if the real work takes
// longer than expected. Used by both the photo-analysis wait and the
// plan-generation wait so the "ease toward ~90% then let the real result
// complete it" behavior only has to be written once.
export function useStagedProgress(stages: ProgressStage[], stepMs: number) {
  const reduceMotion = !!useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= stages.length - 1) return;
    const timer = setTimeout(
      () => setIndex((i) => Math.min(stages.length - 1, i + 1)),
      stepMs
    );
    return () => clearTimeout(timer);
  }, [index, stages.length, stepMs]);

  return {
    stage: stages[index],
    stageIndex: index,
    stageCount: stages.length,
    reduceMotion,
  };
}
