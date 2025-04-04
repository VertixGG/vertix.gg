
import { ResizablePanelGroup, ResizablePanel } from "@vertix.gg/flow/src/shared/components/resizable";
import { cn } from "@vertix.gg/flow/src/lib/utils";

import type {
    FlowLayoutProps,
    FlowLayoutLeftSidebarProps,
    FlowLayoutRightSidebarProps,
    FlowLayoutTopBarProps,
    FlowLayoutEditorProps,
    FlowLayoutActivityBarProps,
    FlowLayoutContentProps,
    FlowLayoutMainContentProps
} from "@vertix.gg/flow/src/features/flow-editor/types/flow-layout.types";

const LAYOUT_DEFAULTS = {
    LEFT_SIDEBAR: {
        DEFAULT_SIZE: 20,
        MIN_SIZE: 10,
        MAX_SIZE: 30
    },
    RIGHT_SIDEBAR: {
        DEFAULT_SIZE: 20,
        MIN_SIZE: 10,
        MAX_SIZE: 40
    },
    MAIN_CONTENT: {
        DEFAULT_SIZE: 60,
        MIN_SIZE: 30
    }
} as const;

export function FlowLayout( { className, children }: FlowLayoutProps ) {
    return (
        <div className={cn( "flex flex-col h-screen bg-background overflow-hidden", className )}>
            {children}
        </div>
    );
}

export function FlowLayoutContent( { className, children, onLayout }: FlowLayoutContentProps ) {
    return (
        <ResizablePanelGroup
            direction="horizontal"
            className={cn( "flex-grow min-h-0", className )}
            onLayout={onLayout}
        >
            {children}
        </ResizablePanelGroup>
    );
}

export function FlowLayoutLeftSidebar( {
    className,
    children,
    defaultSize = LAYOUT_DEFAULTS.LEFT_SIDEBAR.DEFAULT_SIZE,
    minSize = LAYOUT_DEFAULTS.LEFT_SIDEBAR.MIN_SIZE,
    maxSize = LAYOUT_DEFAULTS.LEFT_SIDEBAR.MAX_SIZE,
}: FlowLayoutLeftSidebarProps ) {
    return (
        <ResizablePanel
            defaultSize={defaultSize}
            minSize={minSize}
            maxSize={maxSize}
            className={cn( "border-r", className )}
        >
            <div className="flex flex-col h-full">
                {children}
            </div>
        </ResizablePanel>
    );
}

export function FlowLayoutRightSidebar( {
    className,
    children,
    defaultSize = LAYOUT_DEFAULTS.RIGHT_SIDEBAR.DEFAULT_SIZE,
    minSize = LAYOUT_DEFAULTS.RIGHT_SIDEBAR.MIN_SIZE,
    maxSize = LAYOUT_DEFAULTS.RIGHT_SIDEBAR.MAX_SIZE,
}: FlowLayoutRightSidebarProps ) {
    return (
        <ResizablePanel
            defaultSize={defaultSize}
            minSize={minSize}
            maxSize={maxSize}
            className={cn( "border-l", className )}
        >
            <div className="flex flex-col h-full">
                {children}
            </div>
        </ResizablePanel>
    );
}

export function FlowLayoutMainContent( {
    className,
    children,
    defaultSize = LAYOUT_DEFAULTS.MAIN_CONTENT.DEFAULT_SIZE
}: FlowLayoutMainContentProps ) {
    return (
        <ResizablePanel
            defaultSize={defaultSize}
            minSize={LAYOUT_DEFAULTS.MAIN_CONTENT.MIN_SIZE}
        >
            <div className={cn( "flex flex-col h-full", className )}>
                {children}
            </div>
        </ResizablePanel>
    );
}

export function FlowLayoutTopBar( { className, children }: FlowLayoutTopBarProps ) {
    return (
        <div className={cn( "p-4 border-b bg-muted/20", className )}>
            {children}
        </div>
    );
}

export function FlowLayoutEditor( { className, children }: FlowLayoutEditorProps ) {
    return (
        <div className={cn( "flex-grow overflow-hidden", className )}>
            {children}
        </div>
    );
}

export function FlowLayoutActivityBar( { className, children }: FlowLayoutActivityBarProps ) {
    return (
        <div className={cn( "border-t bg-muted/10 p-2", className )}>
            {children}
        </div>
    );
}
