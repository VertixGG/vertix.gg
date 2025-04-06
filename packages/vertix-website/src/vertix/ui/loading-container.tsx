import React from "react";

export enum LoadingContainerType {
    PRIMARY = "primary",
    SECONDARY = "secondary",
    SUCCESS = "success",
    DANGER = "danger",
    WARNING = "warning",
}

export default function LoadingContainer(
    props: {
        type?: LoadingContainerType
    } = {
        type: LoadingContainerType.PRIMARY
    }
) {
    const className = `spinner spinner-border text-${ props.type }`;

    return (
        <div className="container box-1">
            <div className="row">
                <div className="col-12 text-center">
                    <div className={ className } style={ { width: "100px", height: "100px" } } role="status">
                    </div>
                </div>
            </div>
        </div>
    );
};
