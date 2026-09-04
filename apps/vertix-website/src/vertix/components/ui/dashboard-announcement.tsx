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

    const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || "https://dashboard.voicechannels.online";

    return (
        <div className="vc-animate-slide-in-right fixed bottom-5 right-5 z-[9999] max-w-[340px]">
            <div className="vc-toast w-full" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="flex items-center gap-2 border-b border-vc-cyan/20 px-3 py-2">
                    <strong className="mr-auto text-vc-cyan">✨ New Feature</strong>
                    <button type="button"
                        className="rounded p-1 leading-none text-vc-ice-dim transition-colors
                            hover:text-vc-starlight"
                        aria-label="Close"
                        onClick={ handleClose }>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                            aria-hidden="true">
                            <path d="M3 3l10 10M13 3L3 13"/>
                        </svg>
                    </button>
                </div>
                <div className="px-3 py-3 text-vc-ice">
                    Introducing the <b>VoiceChannels Dashboard</b> — a brand new way to customize
                    your server experience! Edit channel interfaces, manage settings, and fine-tune
                    every detail, all from one place.<br/><br/>
                    <a href={ dashboardUrl } target="_blank" rel="noreferrer"
                        className="vc-btn vc-btn-cyan vc-btn-sm">
                        Open Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
