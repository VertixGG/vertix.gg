interface IHowToSetupStep1Props {
    displayStep?: boolean
}

export default function HowToSetupStep1( props: IHowToSetupStep1Props ) {
    return (
        <>
            <li>
                {
                    props.displayStep ? (
                        <h4 id="step-1">Step 1</h4>
                    ) : <h3>Channel's default name</h3>
                }
                <br/>
                Click on <b>( ➕ Create Master Channel )</b> button to create new master channel.
                <ul>
                    <li>What is a <b>Master Channel</b>?</li>
                    <ul>
                        <li>A voice channel that generate dynamic temporary voice channels, his name will be <b>(
                            ➕ New Channel )</b></li>
                    </ul>

                    <br/>

                    <li>How i generate new temporary dynamic channel?</li>
                    <ul>
                        <li>Simply just join the <b>Master Channel ( ➕ New Channel )</b> and you will be
                            automatically moved to new temporary voice channel
                        </li>
                    </ul>
                </ul>
                <br/>
                <img className="normalize" src="https://i.ibb.co/mNcTWQK/000.png" alt="s2"/>
            </li>
            <br/>
            <li>
                <h4 id="set-default-channels-name-template">Set default channel's name template</h4>
                Edit by pressing <div className="btn btn-sm btn-secondary pe-none">#️⃣ Edit Channel
                Name</div> button or
                continue with <code>default = { "{user}" }'s channel</code>
                by pressing <a href={`${ props.displayStep ? "#step-2" : "2" }`} className="btn btn-sm btn-primary">Next ▶</a>
                <br/>
                <br/>
                <ul>
                    <li>What is <b>Default Channel's Name Template?</b></li>
                    <ul>
                        <li>Its the name that will be used to create the temporary voice channels, that are
                            created by joining this <b>Master Channel.</b></li>
                    </ul>
                </ul>
                <br/>
                <img className="normalize" src="https://i.ibb.co/BVdjwFW/001.png" alt="s3"/>
            </li>
            <br/>

            <ul>
                <li>What is <code>{ "{user}" }</code>?</li>
                <ul>
                    <li>Its name <b>Placeholder</b> that will be used to create the temporary voice
                        channels, that are created by joining this <b>Master Channel.</b></li>
                    <li>Assume your name in discord is <b>Bob</b>, And the placeholder is: <code>{ "{User}" }'s
                        Channel</code> by
                        joining to the <b>Master Channel</b> newly created temporary channel's name
                        will be <code>Bob's Channel</code></li>
                </ul>
            </ul>
            <br/>
            <img className="normalize" src="https://i.ibb.co/0Q6mRPM/002.png" alt="s3"/>
            <p>
                Press <div className="btn btn-primary user-select-none pe-none">Submit</div> to proceed.
            </p>
            <img className="normalize" src="https://i.ibb.co/mHqSW4H/003.png" alt="s4"/>
            <ul>
                <li>
                    <li>Then press <a href={`${ props.displayStep ? "#step-2" : "2" }`} className="btn btn-sm btn-primary">Next ▶</a> to continue.
                    </li>
                </li>
            </ul>
        </>
    )
}
