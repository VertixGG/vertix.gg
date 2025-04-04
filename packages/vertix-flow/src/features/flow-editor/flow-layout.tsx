import { ResizablePanelGroup, ResizablePanel } from "@vertix.gg/flow/src/shared/components/resizable";
import { cn } from "@vertix.gg/flow/src/lib/utils";

import type { ReactNode } from "react";

interface FlowLayoutProps {
  className?: string;
  children?: ReactNode;
}

interface FlowLayoutLeftSidebarProps {
  className?: string;
  children?: ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}

interface FlowLayoutRightSidebarProps {
  className?: string;
  children?: ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}

interface FlowLayoutTopBarProps {
  className?: string;
  children?: ReactNode;
}

interface FlowLayoutEditorProps {
  className?: string;
  children?: ReactNode;
}

interface FlowLayoutActivityBarProps {
  className?: string;
  children?: ReactNode;
}

interface FlowLayoutContentProps {
  className?: string;
  children?: ReactNode;
  onLayout?: ( sizes: number[] ) => void;
}

interface FlowLayoutMainContentProps {
  className?: string;
  children?: ReactNode;
  defaultSize?: number;
}

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
  defaultSize = 20,
  minSize = 10,
  maxSize = 30,
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
  defaultSize = 20,
  minSize = 10,
  maxSize = 40,
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

export function FlowLayoutMainContent( { className, children, defaultSize = 60 }: FlowLayoutMainContentProps ) {
  return (
    <ResizablePanel
      defaultSize={defaultSize}
      minSize={30}
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
