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
            window.open( "https://discord.com/oauth2/authorize?client_id=1538844311062581339&permissions=286346256&scope=bot%20applications.commands" );
            break;
    }
};

export default function InviteVertix() {
    return (
        <div className="vc-container vc-page-panel pt-12 text-center">
            <h2>
                Invite VoiceChannels to your server
            </h2>
            <h4 className="text-center">
                Select the option that best suits your needs, you can always change the permissions later.
            </h4>
            <div className="grid grid-cols-12 p-12">
                <div className="col-span-12 xl:col-span-6 mb-4">
                    <button onClick={ () => onAddToServerClick( "recommended" ) } className="vc-btn vc-btn-lg vc-btn-cyan vc-btn-effect h-full w-full flex-col gap-1 p-10" type="button">
                        <h2 className="mb-0 text-h4">Recommended Permissions</h2>
                        <p className="mb-0 text-base opacity-80">The best practice</p>
                    </button>
                </div>
                <div className="col-span-12 xl:col-span-6 mb-4">
                    <button onClick={ () => onAddToServerClick( "optimal" ) } className="vc-btn vc-btn-lg vc-btn-crimson vc-btn-effect h-full w-full flex-col gap-1 p-10" type="button">
                        <h2 className="mb-0 text-h4">Minimal Permissions</h2>
                        <p className="mb-0 text-base opacity-80">For advanced users</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
