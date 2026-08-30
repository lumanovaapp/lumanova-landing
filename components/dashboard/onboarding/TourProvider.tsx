"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { TOUR_STEPS, TourStep } from "@/lib/tour-steps";
import WelcomeModal from "./WelcomeModal";
import TourOverlay from "./TourOverlay";

// "resolving" is the pre-decision state for a user whose server-provided
// onboarded flag came through falsy: we show the dashboard (nothing extra)
// and confirm the real value with a fresh read before ever rendering the
// welcome modal. See the mount effect below.
type Phase = "resolving" | "idle" | "welcome" | "touring";

interface TourContextValue {
  // Restarts the guided tour from step one — used by the "Replay the tour"
  // button on the Help page.
  startTour: () => void;
  // The data-tour target of the step currently being shown, or null when
  // the tour isn't active. MobileNav uses this to auto-open its drawer when
  // a step points at a nav item that lives inside it.
  activeTarget: string | null;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return ctx;
}

interface TourProviderProps {
  userId: string;
  initialOnboarded: boolean;
  hasPlan: boolean;
  children: ReactNode;
}

export default function TourProvider({
  userId,
  initialOnboarded,
  hasPlan,
  children,
}: TourProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Never start in "welcome". If the server says the user is already
  // onboarded we're done ("idle"); otherwise we defer the decision to the
  // mount effect ("resolving") instead of optimistically rendering the
  // modal. `initialOnboarded` is read from the dashboard layout's RSC
  // render, which the Router Cache can serve stale-false right after login
  // /refresh for a user who has in fact already dismissed onboarding —
  // rendering WelcomeModal off that stale value, then unmounting it a beat
  // later when fresh data lands, is the flash this guards against.
  const [phase, setPhase] = useState<Phase>(initialOnboarded ? "idle" : "resolving");
  const [stepIndex, setStepIndex] = useState(0);
  const onboardedRef = useRef(initialOnboarded);

  // Confirm the onboarded flag with one authoritative read before the
  // welcome modal can appear. Only runs when the server value was falsy —
  // an already-onboarded user (prop true) never hits the network here.
  // Fail closed: on any error, or a confirmed `onboarded: true`, stay idle
  // rather than risk showing onboarding to someone who's past it (a genuine
  // new user who hit a transient error just doesn't get the auto-prompt
  // that once and can still start the tour from Help).
  useEffect(() => {
    if (initialOnboarded) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("users")
      .select("onboarded")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || data?.onboarded) {
          onboardedRef.current = true;
          setPhase("idle");
        } else {
          setPhase("welcome");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [initialOnboarded, userId]);

  // Steps that need a plan (streak/habits/calendar/milestones) simply don't
  // exist in the DOM for a brand-new user — decided here from server state
  // rather than discovered by probing, so the tour never bounces through
  // empty pages before landing on the steps that actually apply.
  const steps: TourStep[] = useMemo(
    () => TOUR_STEPS.filter((s) => !s.requiresPlan || hasPlan),
    [hasPlan]
  );

  const markOnboarded = useCallback(() => {
    if (onboardedRef.current) return;
    onboardedRef.current = true;
    const supabase = createClient();
    supabase
      .from("users")
      .update({ onboarded: true })
      .eq("id", userId)
      .then(({ error }) => {
        if (error) console.error("Failed to persist onboarded flag:", error);
      });
  }, [userId]);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setPhase("touring");
  }, []);

  const finishTour = useCallback(() => {
    markOnboarded();
    setPhase("idle");
  }, [markOnboarded]);

  const handleSkipWelcome = useCallback(() => {
    markOnboarded();
    setPhase("idle");
  }, [markOnboarded]);

  const currentStep: TourStep | undefined =
    phase === "touring" ? steps[stepIndex] : undefined;

  const goNext = useCallback(() => {
    if (stepIndex + 1 >= steps.length) {
      finishTour();
    } else {
      setStepIndex(stepIndex + 1);
    }
  }, [stepIndex, steps.length, finishTour]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Navigate to whatever route the current step lives on. Layouts persist
  // across client-side navigations in the App Router, so TourProvider (and
  // the tour's state) survives this without remounting.
  useEffect(() => {
    if (currentStep && pathname !== currentStep.route) {
      router.push(currentStep.route);
    }
  }, [currentStep, pathname, router]);

  const contextValue = useMemo<TourContextValue>(
    () => ({
      startTour,
      activeTarget: currentStep?.target ?? null,
    }),
    [startTour, currentStep]
  );

  return (
    <TourContext.Provider value={contextValue}>
      {children}

      {phase === "welcome" && (
        <WelcomeModal onTakeTour={startTour} onSkip={handleSkipWelcome} />
      )}

      {phase === "touring" && currentStep && (
        <TourOverlay
          step={currentStep}
          index={stepIndex}
          total={steps.length}
          onNext={goNext}
          onBack={stepIndex > 0 ? goBack : undefined}
          onSkip={finishTour}
          onUnavailable={goNext}
        />
      )}
    </TourContext.Provider>
  );
}
