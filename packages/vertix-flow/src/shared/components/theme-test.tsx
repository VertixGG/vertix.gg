import React from "react";

export const ThemeTest = () => {
    return (
        <div className="p-8 space-y-6 w-full max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="p-4 bg-background text-foreground border border-border rounded-lg">
                        Background & Foreground
                    </div>
                    <div className="p-4 bg-primary text-primary-foreground rounded-lg">
                        Primary
                    </div>
                    <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
                        Secondary
                    </div>
                    <div className="p-4 bg-muted text-muted-foreground rounded-lg">
                        Muted
                    </div>
                    <div className="p-4 bg-accent text-accent-foreground rounded-lg">
                        Accent
                    </div>
                    <div className="p-4 bg-destructive text-destructive-foreground rounded-lg">
                        Destructive
                    </div>
                    <div className="p-4 bg-card text-card-foreground border border-border rounded-lg">
                        Card
                    </div>
                    <div className="p-4 bg-popover text-popover-foreground border border-border rounded-lg">
                        Popover
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="p-4 bg-background text-foreground border border-border rounded-lg">
                        Sidebar
                    </div>
                    <div className="p-4 bg-primary text-primary-foreground rounded-lg">
                        Sidebar Primary
                    </div>
                    <div className="p-4 bg-accent text-accent-foreground rounded-lg">
                        Sidebar Accent
                    </div>
                    <div className="p-4 border border-input rounded-lg">
                        Input Border
                    </div>
                    <div className="p-4 ring-2 ring-ring rounded-lg">
                        Ring
                    </div>
                </div>
            </div>
        </div>
    );
};
