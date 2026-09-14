export const onAddToServerClick = ( type: "recommended" | "optimal" ) => {
    // @ts-ignore
    window.gtag( "event", "conversion", { "send_to": "AW-993508183" } );

    // @ts-ignore
    window.gtag( "event", "add_to_server", { type, "send_to": "G-B87MBQLL99" } );

    switch ( type ) {
        case "recommended":
            window.open( "https://discord.com/oauth2/authorize?client_id=1538844311062581339&permissions=8&scope=bot%20applications.commands" );
            break;

        case "optimal":
            window.open( "https://discord.com/oauth2/authorize?client_id=1538844311062581339&permissions=286354448&scope=bot%20applications.commands" );
            break;
    }
};

export default function InviteVertix() {
    return (
        <div className="vc-container vc-page-panel pt-12 text-center">
            <h1 className="text-h2">
                Invite VoiceChannels to your server
            </h1>
            <h2 className="text-center text-h4">
                Select the option that best suits your needs, you can always change the permissions later.
            </h2>
            <div className="grid grid-cols-12 p-12">
                <div className="col-span-12 xl:col-span-6 mb-4">
                    <button onClick={ () => onAddToServerClick( "recommended" ) } className="vc-btn vc-btn-lg vc-btn-cyan vc-btn-effect h-full w-full flex-col gap-1 p-10" type="button">
                        <h3 className="mb-0 text-h4">Recommended Permissions</h3>
                        <p className="mb-0 text-base opacity-80">The best practice</p>
                    </button>
                </div>
                <div className="col-span-12 xl:col-span-6 mb-4">
                    <button onClick={ () => onAddToServerClick( "optimal" ) } className="vc-btn vc-btn-lg vc-btn-crimson vc-btn-effect h-full w-full flex-col gap-1 p-10" type="button">
                        <h3 className="mb-0 text-h4">Minimal Permissions</h3>
                        <p className="mb-0 text-base opacity-80">For advanced users</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
