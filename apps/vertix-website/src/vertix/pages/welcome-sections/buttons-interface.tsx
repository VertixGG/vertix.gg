
import "../../components/discord/discord-chat-container.css";

export default function ButtonsInterface() {
    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">🎚</span>
                <h2 id="buttons-interface" className="text-h4 mb-0">Buttons Interface</h2>
            </div>
            <div className="grid grid-cols-12 gap-12 items-center">
                <div className="col-span-12">
                    <div>
                        <div className="text-h5 text-vc-ice-dim">
                            <p>
                                The buttons live on a panel inside your dynamic channel — open its chat
                                box to find it.
                            </p>
                            <p className="mb-0">
                                Every button is a slash command too. <code>/voice rename</code>, <code>/voice limit</code>,{ " " }
                                <code>/voice privacy</code> and the rest open the same screens, and{ " " }
                                <code>/voice panel</code> brings the panel back if it scrolls away.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

