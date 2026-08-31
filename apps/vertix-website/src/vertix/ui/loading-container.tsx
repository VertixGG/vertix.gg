export enum LoadingContainerType {
    PRIMARY = "primary",
    SECONDARY = "secondary",
    SUCCESS = "success",
    DANGER = "danger",
    WARNING = "warning",
}

const SPINNER_COLOR: Record<LoadingContainerType, string> = {
    [ LoadingContainerType.PRIMARY ]: "text-vc-azure",
    [ LoadingContainerType.SECONDARY ]: "text-vc-ice-dim",
    [ LoadingContainerType.SUCCESS ]: "text-vc-mint",
    [ LoadingContainerType.DANGER ]: "text-vc-crimson",
    [ LoadingContainerType.WARNING ]: "text-vc-magenta",
};

export default function LoadingContainer(
    props: {
        type?: LoadingContainerType
    } = {
        type: LoadingContainerType.PRIMARY
    }
) {
    const color = SPINNER_COLOR[ props.type ?? LoadingContainerType.PRIMARY ];

    return (
        <div className="vc-container vc-page-panel">
            <div className="flex justify-center">
                <div
                    className={ `size-25 animate-spin rounded-full border-4 border-current
                        border-r-transparent ${ color }` }
                    role="status"
                >
                    <span className="sr-only">Loading…</span>
                </div>
            </div>
        </div>
    );
};
