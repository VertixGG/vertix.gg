#!/usr/bin/env bash

# Uninstalls the Vertix Logger launchd service on macOS.
# Equivalent to uninstall-systemd-service.bash for Linux.

set -euo pipefail

usage() {
    printf '%s\n' "Usage: $(basename "$0") [--name <label>] [--scope user|system] [--plist-dir <path>]"
    printf '%s\n' ""
    printf '%s\n' "  --name       launchd label / plist filename stem (default: gg.vertix.logger)"
    printf '%s\n' "  --scope      user (~/Library/LaunchAgents) or system (/Library/LaunchDaemons)"
    printf '%s\n' "  --plist-dir  override the plist directory"
}

die() {
    printf '%s\n' "$1" >&2
    exit 1
}

[[ "$(uname -s)" == "Darwin" ]] || die "This script is for macOS only. Use uninstall-systemd-service.bash on Linux."

name="gg.vertix.logger"
scope="user"
plist_dir=""

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
        --plist-dir)
            [[ $# -ge 2 ]] || die "Missing value for --plist-dir"
            plist_dir="$2"
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
    die "Invalid --scope: $scope (must be 'user' or 'system')"
fi

if [[ "$scope" == "system" && "$(id -u)" -ne 0 ]]; then
    die "System scope requires root. Re-run with sudo or use --scope user."
fi

if [[ -z "$plist_dir" ]]; then
    if [[ "$scope" == "user" ]]; then
        plist_dir="${HOME}/Library/LaunchAgents"
    else
        plist_dir="/Library/LaunchDaemons"
    fi
fi

plist_path="${plist_dir}/${name}.plist"

# Stop and unload the service (ignore errors if it was never loaded).
launchctl unload -w "$plist_path" >/dev/null 2>&1 || true

# Remove the plist file.
if [[ -f "$plist_path" ]]; then
    rm -f "$plist_path"
    printf '%s\n' "Removed ${plist_path}"
else
    printf '%s\n' "Plist not found (already removed?): ${plist_path}"
fi

printf '%s\n' "Uninstalled ${name}"
