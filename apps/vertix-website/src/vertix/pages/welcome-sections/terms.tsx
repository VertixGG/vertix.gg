export default function Terms() {
    return (
        <div className="mb-5">
            <h4 id="terms" className="mb-4">Getting to Know the Basics</h4>
            <div className="fs-5 text-secondary">
                <p className="mb-4">
                    Before we dive in, let's look at two key concepts that make Vertix work:
                </p>
                <div className="row g-4">
                    <div className="col-md-6">
                        <div className="p-4 rounded-4 bg-dark border border-secondary h-100">
                            <h5 className="text-primary mb-3"><strong>Master Channel</strong></h5>
                            <p className="mb-0">
                                Think of this as the "generator." When you enter a Master Channel, Vertix automatically
                                creates a private space just for you and moves you there.
                            </p>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="p-4 rounded-4 bg-dark border border-secondary h-100">
                            <h5 className="text-success mb-3"><strong>Dynamic Channel</strong></h5>
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

