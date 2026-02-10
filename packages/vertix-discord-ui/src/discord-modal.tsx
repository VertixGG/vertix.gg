import "@vertix.gg/discord-ui/src/styles/discord-modal.css";

import type { ReactNode } from "react";

interface DiscordModalProps {
    title: string;
    avatarUrl?: string;
    submitLabel?: string;
    cancelLabel?: string;
    showNotice?: boolean;
    noticeBotName?: string;
    children?: ReactNode;
}

interface DiscordInputProps {
    label: string;
    placeholder?: string;
    value?: string;
    style?: "short" | "paragraph";
    required?: boolean;
}

export function DiscordModal( props: DiscordModalProps ) {
    const { title, avatarUrl, submitLabel = "Submit", cancelLabel, showNotice, noticeBotName = "Vertix", children } = props;

    return (
        <div className="discord-modal">
            <div className="discord-modal-header">
                <div className="discord-modal-header-left">
                    { avatarUrl && (
                        <img className="discord-modal-avatar" src={ avatarUrl } alt="" />
                    ) }
                    <span className="discord-modal-title">{ title }</span>
                </div>
                <button className="discord-modal-close" aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"/>
                    </svg>
                </button>
            </div>
            <div className="discord-modal-content">
                { showNotice && (
                    <div className="discord-modal-notice">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path fill="currentColor" d="M10 1.5L0.5 18h19L10 1.5zM10.75 15.5h-1.5v-1.5h1.5v1.5zm0-3h-1.5V9h1.5v3.5z"/>
                        </svg>
                        <span>This form will be submitted to <strong>{ noticeBotName }</strong>. Do not share passwords or other sensitive information.</span>
                    </div>
                ) }
                { children }
            </div>
            <div className="discord-modal-footer">
                { cancelLabel && (
                    <button className="discord-modal-cancel">{ cancelLabel }</button>
                ) }
                <button className="discord-modal-submit">{ submitLabel }</button>
            </div>
        </div>
    );
}

export function DiscordInput( props: DiscordInputProps ) {
    const { label, placeholder, value, style = "short", required } = props;

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
                    value={ value }
                    disabled
                />
            ) : (
                <textarea
                    className="discord-input discord-input-paragraph"
                    placeholder={ placeholder }
                    value={ value }
                    disabled
                    rows={ 3 }
                />
            ) }
        </div>
    );
}
