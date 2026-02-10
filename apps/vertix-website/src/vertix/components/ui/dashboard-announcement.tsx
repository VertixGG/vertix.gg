import React from "react";

const COOKIE_NAME = "vertix_dashboard_announcement_dismissed";

function getCookie( name: string ): string | null {
    const match = document.cookie.match( new RegExp( `(?:^|; )${ name }=([^;]*)` ) );
    return match ? decodeURIComponent( match[ 1 ] ) : null;
}

function setCookie( name: string, value: string, days: number ) {
    const expires = new Date( Date.now() + days * 864e5 ).toUTCString();
    document.cookie = `${ name }=${ encodeURIComponent( value ) }; expires=${ expires }; path=/`;
}

export default function DashboardAnnouncement() {
    const [ visible, setVisible ] = React.useState( () => {
        return ! getCookie( COOKIE_NAME );
    } );

    const handleClose = () => {
        setCookie( COOKIE_NAME, "1", 365 );
        setVisible( false );
    };

    if ( ! visible ) {
        return null;
    }

    const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || "https://dashboard.vertix.gg";

    return (
        <div className="dashboard-announcement">
            <div className="toast show w-100" role="alert" aria-live="assertive" aria-atomic="true"
                data-bs-theme="dark">
                <div className="toast-header">
                    <strong className="me-auto">✨ New Feature</strong>
                    <button type="button" className="btn-close btn-close-white" aria-label="Close"
                        onClick={ handleClose }></button>
                </div>
                <div className="toast-body">
                    Introducing the <b>Vertix Dashboard</b> — a brand new way to customize
                    your server experience! Edit channel interfaces, manage settings, and fine-tune
                    every detail, all from one place.<br/><br/>
                    <a href={ dashboardUrl } target="_blank" rel="noreferrer"
                        className="btn btn-sm btn-outline-info">
                        Open Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
