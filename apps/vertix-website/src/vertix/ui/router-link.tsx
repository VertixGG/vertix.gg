import { Link } from "react-router-dom";

/**
 * The router's `Link`, typed against this app's React.
 *
 * react-router's declarations resolve the monorepo's hoisted `@types/react` 19 while this app builds
 * against 18, so its components do not type as JSX here - `index.tsx` casts `Routes` and `Route` for
 * the same reason. Only the props this app passes are declared.
 */
const RouterLink = Link as React.ComponentType<{
    to: string,
    className?: string,
    "aria-current"?: "page",
    children?: React.ReactNode
}>;

export default RouterLink;
