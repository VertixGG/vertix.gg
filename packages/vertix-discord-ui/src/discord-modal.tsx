import "@vertix.gg/discord-ui/src/styles/discord-modal.css";

import type { ReactNode } from "react";

interface DiscordModalProps {
    title: string;
    submitLabel?: string;
    children?: ReactNode;
}

interface DiscordInputProps {
    label: string;
    placeholder?: string;
    style?: "short" | "paragraph";
    required?: boolean;
}

export function DiscordModal( props: DiscordModalProps ) {
    const { title, submitLabel = "Submit", children } = props;

    return (
        <div className="discord-modal">
            <div className="discord-modal-header">
                <span className="discord-modal-title">{ title }</span>
                <button className="discord-modal-close" aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"/>
                    </svg>
                </button>
            </div>
            <div className="discord-modal-content">
                { children }
            </div>
            <div className="discord-modal-footer">
                <button className="discord-modal-submit">{ submitLabel }</button>
            </div>
        </div>
    );
}

export function DiscordInput( props: DiscordInputProps ) {
    const { label, placeholder, style = "short", required } = props;

    return (
        <div className="discord-input-wrapper">
            <label className="discord-input-label">
                { label }
                { required && <span className="discord-input-required">*</span> }
            </label>
            { style === "short" ? (
                <input
                    type="text"
                    className="discord-input discord-input-short"
                    placeholder={ placeholder }
                    disabled
                />
            ) : (
                <textarea
                    className="discord-input discord-input-paragraph"
                    placeholder={ placeholder }
                    disabled
                    rows={ 3 }
                />
            ) }
        </div>
    );
}
