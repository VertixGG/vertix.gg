declare module "react-photo-view" {
    import React from "react";

    export interface PhotoViewProps {
        src: string;
        children?: React.ReactNode;
    }

    export const PhotoView: React.ComponentType<PhotoViewProps>;
    export const PhotoProvider: React.ComponentType<{ children?: React.ReactNode }>;
}

