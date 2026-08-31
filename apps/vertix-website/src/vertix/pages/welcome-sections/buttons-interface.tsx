
import "../../components/discord/discord-chat-container.css";

export default function ButtonsInterface() {
    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">🎚</span>
                <h4 id="buttons-interface" className="mb-0">Buttons Interface</h4>
            </div>
            <div className="grid grid-cols-12 gap-12 items-center">
                <div className="col-span-12">
                    <div>
                        <div className="text-h5 text-vc-ice-dim">
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

