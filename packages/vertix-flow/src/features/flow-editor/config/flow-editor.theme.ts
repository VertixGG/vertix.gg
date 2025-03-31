import type { FlowComponentStyles } from "@vertix.gg/flow/src/features/flow-editor/types/flow-components";

/**
 * Theme configuration for the flow editor
 */
export interface FlowEditorTheme {
    // Z-index layers
    zIndex: {
        edgeDefault: number;
        nodeDefault: number;
        edgeInterFlow: number;
        nodeSelected: number;
        controls: number;
        minimap: number;
    };
    // Component styles
    components: {
        node: FlowComponentStyles;
        edge: {
            default: {
                strokeWidth: number;
                strokeColor: string;
                animated: boolean;
            };
            interFlow: {
                strokeWidth: number;
                strokeColor: string;
                animated: boolean;
            };
        };
        minimap: {
            backgroundColor: string;
            nodeColor: string;
            maskColor: string;
        };
    };
}

/**
 * Default theme for the flow editor
 */
export const FLOW_EDITOR_THEME: FlowEditorTheme = {
    zIndex: {
        edgeDefault: 1,
        nodeDefault: 10,
        edgeInterFlow: 1000,
        nodeSelected: 1100,
        controls: 2000,
        minimap: 3000
    },
    components: {
        node: {
            primaryColor: "hsl(var(--primary))",
            secondaryColor: "hsl(var(--secondary))",
            backgroundColor: "hsl(var(--background))",
            textColor: "hsl(var(--foreground))",
            borderRadius: "var(--radius)"
        },
        edge: {
            default: {
                strokeWidth: 2,
                strokeColor: "hsl(var(--primary))",
                animated: false
            },
            interFlow: {
                strokeWidth: 2,
                strokeColor: "hsl(var(--primary))",
                animated: true
            }
        },
        minimap: {
            backgroundColor: "hsl(var(--background))",
            nodeColor: "hsl(var(--muted))",
            maskColor: "hsl(var(--muted-foreground))"
        }
    }
};
