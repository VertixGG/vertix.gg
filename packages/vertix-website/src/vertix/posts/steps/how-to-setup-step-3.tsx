interface IHowToSetupStep3Props {
    displayStep?: boolean
}

export default function HowToSetupStep3( props: IHowToSetupStep3Props ) {
    return (
        <>
            <li>
            {
                props.displayStep ? (
                    <h4 id="step-3">Step 3</h4>
                ) : <h4>Set verified roles</h4>
            }
                <br/>
                {
                    props.displayStep ? (
                        <h4>Set verified roles</h4>
                    ) : null
                }
                Or continue with <b>( <code>default = @everyone</code> recommended! )</b>
                <br/>
                <img className="normalize"
                     src="https://i.ibb.co/DCvxSvG/setup-step-3-verfied-roles-arrow-red-on-select-roles.png"
                     alt="s8"/>
                <br/>
                <br/>
                <p>Select <b>Verified Roles</b></p>
                <img className="normalize" src="https://i.ibb.co/cY7NFgS/setup-step-3-trusted-members.png"
                     alt="s8"/>

                <ul>
                    <p>Do I need to set <b>Verified Roles</b>?</p>
                    <ul>
                        <li>
                            For most Discord servers, the <code>@everyone</code> role is sufficient. However,
                            there are use cases where you may need additional roles. Here's an
                            example:<br/><br/>
                            Let's say that by <b>default</b>, new members in your Discord server cannot see
                            any <b>Channels</b>. If the owner of a dynamic channel sets their channel to be
                            visible and <b>Verified Role</b> tagged as <code>@everyone</code>, new members will
                            be able to <b>join/see</b> the channel, which may not be what you intended. This is
                            where the <b>Verified Role selection</b> comes into play.
                        </li>
                        <br/>
                        <li><b>Tip:</b> In most cases, one <b>verified role</b> is sufficient, and its
                            recommended to use <code>@everyone</code> role.
                        </li>
                    </ul>
                </ul>

                <br/>
                Press <b>( ✔ Finish )</b> to generate your <b>Master Channel.</b>
                <br/>
                <img className="normalize" src="https://i.ibb.co/0FsSRDQ/setup-step-3-finish.png" alt="s8"/>
                <br/>
                <br/>
                <h4>Its done, the <b>Master Channel</b> created!</h4>
                <br/>
                <img className="normalize" src="https://i.ibb.co/jTqkr0j/setup-finish.png" alt="s9"/>
                <br/>
            </li>
        </>
    )
}
