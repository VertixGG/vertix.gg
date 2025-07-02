export const onAddToServerClick = ( type: "recommended" | "optimal" ) => {
    // @ts-ignore
    window.gtag( 'event', 'conversion', { 'send_to': 'AW-993508183' } );

    // @ts-ignore
    window.gtag( 'event', 'add_to_server', { type, 'send_to': 'G-B87MBQLL99' } );

    switch ( type ) {
        case "recommended":
            window.open( "https://discord.com/oauth2/authorize?client_id=1111283172378955867&permissions=8&scope=bot%20applications.commands" );
            break;

        case "optimal":
            window.open( "https://discord.com/oauth2/authorize?client_id=1111283172378955867&permissions=286346256&scope=bot%20applications.commands" );
            break;
    }
};

export default function InviteVertix() {
    return (
        <div className="container box-1 pt-5 text-center">
            <h2>
                Invite Vertix to your server
            </h2>
            <h4 className="text-center">
                Select the option that best suits your needs, you can always change the permissions later.
            </h4>
            <div className="row p-5">
                <div className="col-xl-6 mb-3">
                    <button onClick={() => onAddToServerClick( "recommended" ) } className="btn btn-lg btn-outline-info btn-effect w-100 h-100 p-5" type="button">
                        <h2>Recommended Permissions</h2>
                        <p>The best practice</p>
                    </button>
                </div>
                <div className="col-xl-6 mb-3">
                    <button onClick={() => onAddToServerClick( "optimal" ) } className="btn btn-lg btn-outline-danger btn-effect w-100 h-100 p-5" type="button">
                        <h2>Minimal Permissions</h2>
                        <p>For advanced users</p>
                    </button>
                </div>
            </div>
        </div>
    )
}
