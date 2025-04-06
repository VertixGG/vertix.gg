import HowToSetupStep1 from "@vertix/posts/steps/how-to-setup-step-1";
import HowToSetupStep2 from "@vertix/posts/steps/how-to-setup-step-2";
import HowToSetupStep3 from "@vertix/posts/steps/how-to-setup-step-3";

export default function HowToSetup() {
    return (
        <>
            <div className="container box-1">
                <h4>Setup step-by-step</h4>
                <br/>

                <ul className="fs-5">
                    <li>
                        Enter your discord server and type <code>/setup</code> in any channel.
                        <br/>
                        <img className="normalize" src="https://i.ibb.co/LYkTJyh/e1.png" alt="s1"/>
                    </li>
                    <hr/>
                    <br/>
                    <HowToSetupStep1 displayStep={true} />
                    <br/>
                    <hr/>
                    <br/>
                    <HowToSetupStep2 displayStep={true} />
                    <br/>
                    <hr/>
                    <br/>
                   <HowToSetupStep3 displayStep={true} />
                </ul>

                <hr/>
                <br/>

                <ul className="fs-5 ">
                    <li>
                        <h4>Create the dynamic channel</h4>
                        <br/>
                        Join <b>Master Channel (➕ New Channel )</b>
                        <br/>
                        <img className="normalize" src="https://i.ibb.co/Tc1xJ5M/generate-dynamic.png" alt="s10"/>
                        <br/>
                        You will be automatically moved to new <b>Dynamic Channel (Temporary Voice Channel)</b>.
                        <br/>
                        <br/>
                        Open the chat the interface by clicking on the message badge.
                        <br/>
                        <img className="normalize" src="https://i.ibb.co/X8nbPs0/enter-dynamic-chan.png" alt="s11"/>
                        <br/>
                        On the right screen of the window you will see the interface.
                        <br/>
                        <img className="normalize" src="https://i.ibb.co/55xpqZz/101.png" alt="s12"/>
                    </li>
                </ul>

                <hr/>

                <div className="container">
                    <br/>
                    <div aria-live="polite" aria-atomic="true"
                         className="d-flex justify-content-center align-items-center">
                        <div className="toast show w-100" role="alert" aria-live="assertive" aria-atomic="true"
                             data-bs-theme="dark">
                            <div className="toast-header">
                                <img src="https://simgbb.com/avatar/PGKBv5T3fZLJ.png" width="30"
                                     className="rounded-4 me-2"
                                     alt="..."/>
                                <strong className="me-auto">leonid@vertix.gg</strong>
                                <small className="d-flex justify-content-end"><span className="d-none d-sm-block">Updated at&nbsp;</span>21/06/2023</small>
                            </div>
                            <div className="toast-body">
                                Hi there👋<br/><br/>
                                Found something wrong?<br/>
                                Do you have any questions?<br/>
                                Doesn't like something?<br/><br/>
                                <a href="https://discord.com/invite/dEwKeQefUU" target="_blank" rel="noreferrer">Join
                                    our discord server</a> and let us know!
                                or use <code>/help</code> command to send us feedback.<br/><br/>
                                We value your opinion and are eager to take it into consideration!<br/><br/>
                                Best regards ❤️<br/>
                                <b>Vertix Team</b>.
                            </div>
                        </div>
                    </div>
                </div>

                <br/>
            </div>


        </>
    )
}
