export interface AuthUser {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    email?: string;
}

export interface Guild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
}

export interface SelectedGuild {
    id: string;
    name: string;
    icon: string | null;
}
