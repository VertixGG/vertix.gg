import type {
    IActivationStats,
    IAdoptionStats,
    IGrowthStats,
    IRevenueStats,
    IUsageStats
} from "@vertix.gg/definitions/src/dashboard-stats-definitions";

/** What each of the statistics page's reads leaves in its component's state - null when it failed. */
export interface GrowthDisplayState {
    growthStats: IGrowthStats | null;
}

export interface ActivationDisplayState {
    activationStats: IActivationStats | null;
}

export interface UsageDisplayState {
    usageStats: IUsageStats | null;
}

export interface RevenueDisplayState {
    revenueStats: IRevenueStats | null;
}

export interface AdoptionDisplayState {
    adoptionStats: IAdoptionStats | null;
}
