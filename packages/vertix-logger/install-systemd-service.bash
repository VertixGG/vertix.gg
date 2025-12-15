#!/usr/bin/env bash

set -euo pipefail

usage() {
    printf '%s\n' "Usage: $(basename "$0") [--name <serviceName>] [--repo-root <path>] [--scope user|system] [--unit-dir <path>] [--env-file <path>] [--no-start] [--linger]"
}

die() {
    printf '%s\n' "$1" >&2
    exit 1
}

name="vertix-logger"
repo_root=""
scope="user"
unit_dir=""
env_file=""
no_start="false"
linger="false"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --name)
            [[ $# -ge 2 ]] || die "Missing value for --name"
            name="$2"
            shift 2
            ;;
        --repo-root)
            [[ $# -ge 2 ]] || die "Missing value for --repo-root"
            repo_root="$2"
            shift 2
            ;;
        --scope)
            [[ $# -ge 2 ]] || die "Missing value for --scope"
            scope="$2"
            shift 2
            ;;
        --unit-dir)
            [[ $# -ge 2 ]] || die "Missing value for --unit-dir"
            unit_dir="$2"
            shift 2
            ;;
        --env-file)
            [[ $# -ge 2 ]] || die "Missing value for --env-file"
            env_file="$2"
            shift 2
            ;;
        --no-start)
            no_start="true"
            shift 1
            ;;
        --linger)
            linger="true"
            shift 1
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            usage
            die "Unknown argument: $1"
            ;;
    esac
done

if [[ "$scope" != "user" && "$scope" != "system" ]]; then
    die "Invalid --scope: $scope"
fi

script_dir="$(cd "$(dirname "$0")" && pwd -P)"

if [[ -z "$repo_root" ]]; then
    repo_root="$(cd "${script_dir}/../.." && pwd -P)"
fi

root_package_json="${repo_root}/package.json"
logger_package_json="${repo_root}/packages/vertix-logger/package.json"

[[ -f "$root_package_json" ]] || die "Repo root does not look valid (missing package.json): $repo_root"
[[ -f "$logger_package_json" ]] || die "Repo root does not contain packages/vertix-logger (missing package.json): $repo_root"

service_file="${name}.service"

systemctl_cmd=( "systemctl" )
if [[ "$scope" == "user" ]]; then
    systemctl_cmd=( "systemctl" "--user" )
fi

if [[ -z "$unit_dir" ]]; then
    if [[ "$scope" == "user" ]]; then
        unit_dir="${HOME}/.config/systemd/user"
    else
        unit_dir="/etc/systemd/system"
    fi
fi

if [[ "$scope" == "system" && "$(id -u)" -ne 0 ]]; then
    die "System scope requires root. Re-run with sudo or use --scope user."
fi

mkdir -p "$unit_dir"

unit_path="${unit_dir}/${service_file}"

if [[ -z "$env_file" ]]; then
    if [[ -f "${repo_root}/.env" ]]; then
        env_file="${repo_root}/.env"
    fi
fi

env_line=""
if [[ -n "$env_file" ]]; then
    [[ -f "$env_file" ]] || die "Env file not found: $env_file"
    env_line="EnvironmentFile=${env_file}"
fi

user_name=""
group_name=""
user_group_lines=""
if [[ "$scope" == "system" ]]; then
    user_name="${SUDO_USER:-${USER}}"
    group_name="$(id -gn "$user_name")"
    user_group_lines=$(
        printf '%s\n' \
            "User=${user_name}" \
            "Group=${group_name}"
    )
fi

unit_content=$(
    wanted_by="default.target"
    if [[ "$scope" == "system" ]]; then
        wanted_by="multi-user.target"
    fi

    printf '%s\n' \
        "[Unit]" \
        "Description=Vertix Logger Server (${name})" \
        "After=network.target" \
        "" \
        "[Service]" \
        "Type=simple" \
        "StandardOutput=journal" \
        "StandardError=journal" \
        "SyslogIdentifier=${name}" \
        "${user_group_lines}" \
        "${env_line}" \
        "WorkingDirectory=${repo_root}" \
        "ExecStart=/usr/bin/env bun --bun packages/vertix-logger/src/index.ts" \
        "Restart=on-failure" \
        "RestartSec=2" \
        "" \
        "[Install]" \
        "WantedBy=${wanted_by}"
)

printf '%s\n' "$unit_content" > "$unit_path"

"${systemctl_cmd[@]}" daemon-reload

if [[ "$linger" == "true" && "$scope" == "user" ]]; then
    if command -v loginctl >/dev/null 2>&1; then
        loginctl enable-linger "${USER}" >/dev/null 2>&1 || true
    fi
fi

if [[ "$no_start" != "true" ]]; then
    "${systemctl_cmd[@]}" enable --now "$service_file"
fi

printf '%s\n' "Installed ${service_file} to ${unit_path}"

