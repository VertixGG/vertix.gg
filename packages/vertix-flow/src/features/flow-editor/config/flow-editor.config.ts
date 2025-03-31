import type { LayoutConfig } from "@vertix.gg/flow/src/features/flow-editor/utils/graph-layout";

/**
 * Flow editor configuration types
 */
export interface FlowEditorConfig {
    // Layout settings
    layout: LayoutConfig;
    // Viewport settings
    viewport: {
        defaultZoom: number;
        maxZoom: number;
        minZoom: number;
        snapGrid: [number, number];
    };
    // Timing settings
    timing: {
        initDelay: number;
        layoutDelay: number;
    };
    // Position settings
    position: {
        threshold: number;
        defaultSpacing: number;
        margins: {
            x: number;
            y: number;
        };
    };
    // Node settings
    node: {
        defaultSize: {
            width: number;
            height: number;
        };
        minSize: {
            width: number;
            height: number;
        };
    };
}

/**
 * Default configuration for the flow editor
 */
export const FLOW_EDITOR_CONFIG: FlowEditorConfig = {
    layout: {
        rankdir: "TB",
        alignRank: "UL",
        nodesep: 100,
        ranksep: 100,
        marginx: 50,
        marginy: 50,
        nodeWidth: 200,
        nodeHeight: 150
    },
    viewport: {
        defaultZoom: 0.85,
        maxZoom: 1.5,
        minZoom: 0.1,
        snapGrid: [ 10, 10 ]
    },
    timing: {
        initDelay: 100,
        layoutDelay: 150
    },
    position: {
        threshold: 1,
        defaultSpacing: 50,
        margins: {
            x: 100,
            y: 50
        }
    },
    node: {
        defaultSize: {
            width: 200,
            height: 150
        },
        minSize: {
            width: 100,
            height: 75
        }
    }
};
