export default function Terms() {
    return (
        <div className="mb-12">
            <h4 id="terms" className="mb-6">Getting to Know the Basics</h4>
            <div className="text-h5 text-vc-ice-dim">
                <p className="mb-6">
                    Before we dive in, let's look at two key concepts that make VoiceChannels work:
                </p>
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-6">
                        <div className="p-6 rounded-2xl bg-vc-space border border-vc-hairline-bright h-full">
                            <h5 className="text-vc-azure-soft mb-4"><strong>Master Channel</strong></h5>
                            <p className="mb-0">
                                Think of this as the "generator." When you enter a Master Channel, VoiceChannels automatically
                                creates a private space just for you and moves you there.
                            </p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="p-6 rounded-2xl bg-vc-space border border-vc-hairline-bright h-full">
                            <h5 className="text-vc-mint mb-4"><strong>Dynamic Channel</strong></h5>
                            <p className="mb-0">
                                This is your temporary home. It's created the moment you need it and disappears
                                automatically once the last person leaves, keeping your server clean and organized.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

