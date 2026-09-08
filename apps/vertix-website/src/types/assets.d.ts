declare module "*.webp" {
    const src: string;
    export default src;
}

declare module "*.png" {
    const src: string;
    export default src;
}

declare module "*.jpg" {
    const src: string;
    export default src;
}

declare module "*.jpeg" {
    const src: string;
    export default src;
}

declare module "*.gif" {
    const src: string;
    export default src;
}

declare module "*.svg" {
    const src: string;
    export default src;
}

declare module "*.svg?raw" {
    const source: string;
    export default source;
}

declare module "@assets/*.png" {
    const src: string;
    export default src;
}

declare module "*.ttf?url" {
    const src: string;
    export default src;
}

interface ImportMeta {
    /**
     * Vite's glob import, declared here rather than by referencing `vite/client`, whose own
     * `*.svg` and `*.png` declarations would collide with the ones above.
     */
    glob<T>(
        pattern: string,
        options: { query: string; import: string; eager: true }
    ): Record<string, T>;
}
