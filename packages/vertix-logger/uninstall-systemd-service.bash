#!/usr/bin/env bash

set -euo pipefail

usage() {
    printf '%s\n' "Usage: $(basename "$0") [--name <serviceName>] [--scope user|system] [--unit-dir <path>]"
}

die() {
    printf '%s\n' "$1" >&2
    exit 1
}

name="vertix-logger"
scope="user"
unit_dir=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --name)
            [[ $# -ge 2 ]] || die "Missing value for --name"
            name="$2"
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

service_file="${name}.service"
unit_path="${unit_dir}/${service_file}"

if "${systemctl_cmd[@]}" is-active --quiet "$service_file" >/dev/null 2>&1; then
    "${systemctl_cmd[@]}" stop "$service_file" >/dev/null 2>&1 || true
fi

if "${systemctl_cmd[@]}" is-enabled --quiet "$service_file" >/dev/null 2>&1; then
    "${systemctl_cmd[@]}" disable "$service_file" >/dev/null 2>&1 || true
fi

rm -f "$unit_path"

"${systemctl_cmd[@]}" daemon-reload
"${systemctl_cmd[@]}" reset-failed "$service_file" >/dev/null 2>&1 || true

printf '%s\n' "Removed ${service_file} from ${unit_path}"

