import type { ReactNode } from "react";

export interface FlowLayoutProps {
    className?: string;
    children?: ReactNode;
}

export interface FlowLayoutLeftSidebarProps {
    className?: string;
    children?: ReactNode;
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
}

export interface FlowLayoutRightSidebarProps {
    className?: string;
    children?: ReactNode;
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
}

export interface FlowLayoutTopBarProps {
    className?: string;
    children?: ReactNode;
}

export interface FlowLayoutEditorProps {
    className?: string;
    children?: ReactNode;
}

export interface FlowLayoutActivityBarProps {
    className?: string;
    children?: ReactNode;
}

export interface FlowLayoutContentProps {
    className?: string;
    children?: ReactNode;
    onLayout?: ( sizes: number[] ) => void;
}

export interface FlowLayoutMainContentProps {
    className?: string;
    children?: ReactNode;
    defaultSize?: number;
}
