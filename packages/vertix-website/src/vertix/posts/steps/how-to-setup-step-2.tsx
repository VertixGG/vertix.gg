import { ArrowDown } from "@vertix/ui/arrows";

interface IHowToSetupStep2Props {
    displayStep?: boolean
}

export default function HowToSetupStep2( props: IHowToSetupStep2Props ) {
    return (
        <>
            <li>
                {
                    props.displayStep ? (
                        <h4 id="step-2">Step 2</h4>
                    ) :  <h4>Set temporary dynamic channel's button interface</h4>
                }
                <br/>
                {
                    props.displayStep ?  <h4>Set temporary dynamic channel's button interface</h4> : null
                }
                Click on ( <div className="btn btn-sm btn-dark pe-none"><ArrowDown/></div> ) down arrow to edit or
                continue with <b>( <code>default = All Buttons Enabled</code> )</b> by
                pressing <a href={`${ props.displayStep ? "#step-3" : "3" }`} className="btn btn-sm btn-primary">Next ▶</a>
                <br/>
                <img className="normalize" src="https://i.ibb.co/ZGCGwP1/setup-step-2-buttons-set-arrow-red.png"
                     alt="s5"/>
            </li>
            <br/>
            <p>
                Select buttons you wish to enable in your temporary dynamic channels that created by joining
                this <b>Master Channel</b>.
                <br/>
                <img className="normalize" src="https://i.ibb.co/fn9Bsq2/e5.png" alt="s6"/>
            </p>
            <br/>
            <p>
                What the buttons do?
                <ul className="fs-7">
                    <li><b>( ✏️ ∙ Rename ) - Allow the channel owner to rename his channel.</b></li>
                    <li><b>( ✋ ∙ User Limit ) - Allow the channel owner to set members limit over his
                        channel.</b></li>
                    <li><b>( 🧹 ∙ Clear Chat ) - Allow the channel owner clear basic messages, not including
                        embeds.</b></li>
                </ul>
                <br/>

                <ul className="fs-7">
                    <li><b>( 🚫 ∙ Private / 🌐 ∙ Public ) - Allow the channel owner to change the state of
                        channel</b> - ( Can <b>Connect</b>/Cannot <b>Connect</b> )
                    </li>
                    <li><b>( 🙈 ∙ Hidden / 🐵 ∙ Shown ) - Allow the channel owner to change visibility of
                        channel</b> - ( Channel <b>Visible</b>/Channel <b>Hidden</b> )
                    </li>
                    <li><b>( 👥 ∙ Access ) - Allow the channel owner to edit permissions of his channel.</b> -
                        The feature enables 4 menus described below:
                    </li>

                    <ul className="fs-7">
                        <li><b>( 👍 Grant Access ) - Grant access with to user, the user will able to see or
                            connect the chanel even if the state changed.</b></li>
                        <li><b>( 👎 Remove Access ) - Remove access that described above.</b></li>
                        <li><b>( 🫵 Block User Access ) - Block user access, kicks the user if he inside the
                            channel - to user cannot connect or see channel anymore.</b></li>
                        <li><b>( 🤙 Un-Block User Access ) - Removes the block that described above.</b></li>
                    </ul>
                </ul>
                <br/>

                <ul className="fs-7">
                    <li><b>( 🔃 ∙ Reset Channel ) - Restore channel's default state</b> -
                        ( <code>Name</code>, <code>User
                            limit</code>, <code>State</code>, <code>Visibility</code>, <code>Granted
                            users</code> ).
                    </li>
                    <li><b>( 🔀 ∙ Transfer ownership ) - Allow the channel owner transform ownership over the
                        channel to someone else.</b></li>
                    <li><b>( 😈 ∙ Claim Channel ) - Allow to take over the channel ownership after 10 minutes of
                        owner leaving the channel</b> - Automatically disabled when <b>owner back</b> ).
                    </li>
                </ul>
                <br/>

                <br/>
                Select the option that suits you the most, then click <a href={`${ props.displayStep ? "#step-3" : "3" }`}
                                                                         className="btn btn-sm btn-primary">Next
                ▶</a> to continue.
                <br/>
                <img className="normalize" src="https://i.ibb.co/tBtNfKF/004.png" alt="s7"/>
            </p>
        </>
    )
}
