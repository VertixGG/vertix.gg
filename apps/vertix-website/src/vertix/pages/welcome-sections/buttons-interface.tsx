
import "../../components/discord/discord-chat-container.css";

export default function ButtonsInterface() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">🎚</span>
                <h4 id="buttons-interface" className="mb-0">Buttons Interface</h4>
            </div>
            <div className="row g-5 align-items-center">
                <div className="col-12">
                    <div>
                        <div className="fs-5 text-secondary">
                            <p>
                                Please note buttons interface is located inside the dynamic channel.<br />
                                You can access it by opening the chat box of the dynamic channel.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

