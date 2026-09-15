export { TourGate } from "@vertix.gg/dashboard/src/features/onboarding/components/tour-gate";
export { TourRunner } from "@vertix.gg/dashboard/src/features/onboarding/components/tour-runner";

export { useTourAnchor } from "@vertix.gg/dashboard/src/features/onboarding/hooks/use-tour-anchor";
export { useTourStore } from "@vertix.gg/dashboard/src/features/onboarding/hooks/use-tour-store";

export { TOUR_ANCHORS, entityListAnchor } from "@vertix.gg/dashboard/src/features/onboarding/lib/tour-anchors";

export { hasTakenTour, rememberTourTaken, forgetTourTaken } from "@vertix.gg/dashboard/src/features/onboarding/lib/tour-storage";

export {
    DYNAMIC_CHANNEL_COLOR_TOUR,
    DYNAMIC_CHANNEL_COLOR_TOUR_ID
} from "@vertix.gg/dashboard/src/features/onboarding/tours/dynamic-channel-color-tour";

export type { TourDefinition, TourStep, TourPlacement, TourStepGate, TourGateEvent } from "@vertix.gg/dashboard/src/features/onboarding/types";
