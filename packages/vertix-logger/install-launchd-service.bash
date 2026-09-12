#!/usr/bin/env bash

# Installs the Vertix Logger as a launchd service on macOS.
# Equivalent to install-systemd-service.bash for Linux.

set -euo pipefail

usage() {
    printf '%s\n' "Usage: $(basename "$0") [--name <label>] [--repo-root <path>] [--scope user|system] [--plist-dir <path>] [--env-file <path>] [--no-start]"
    printf '%s\n' ""
    printf '%s\n' "  --name        launchd label / plist filename stem (default: gg.vertix.logger)"
    printf '%s\n' "  --repo-root   path to the monorepo root (default: two levels up from this script)"
    printf '%s\n' "  --scope       user (~/Library/LaunchAgents) or system (/Library/LaunchDaemons)"
    printf '%s\n' "  --plist-dir   override the plist directory"
    printf '%s\n' "  --env-file    .env file to source environment variables from"
    printf '%s\n' "  --no-start    write the plist but do not load it"
}

die() {
    printf '%s\n' "$1" >&2
    exit 1
}

[[ "$(uname -s)" == "Darwin" ]] || die "This script is for macOS only. Use install-systemd-service.bash on Linux."

name="gg.vertix.logger"
repo_root=""
scope="user"
plist_dir=""
env_file=""
no_start="false"

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
        --plist-dir)
            [[ $# -ge 2 ]] || die "Missing value for --plist-dir"
            plist_dir="$2"
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

script_dir="$(cd "$(dirname "$0")" && pwd -P)"

if [[ -z "$repo_root" ]]; then
    repo_root="$(cd "${script_dir}/../.." && pwd -P)"
fi

root_package_json="${repo_root}/package.json"
logger_package_json="${repo_root}/packages/vertix-logger/package.json"

[[ -f "$root_package_json" ]] || die "Repo root does not look valid (missing package.json): $repo_root"
[[ -f "$logger_package_json" ]] || die "Repo root does not contain packages/vertix-logger (missing package.json): $repo_root"

if [[ -z "$plist_dir" ]]; then
    if [[ "$scope" == "user" ]]; then
        plist_dir="${HOME}/Library/LaunchAgents"
    else
        plist_dir="/Library/LaunchDaemons"
    fi
fi

mkdir -p "$plist_dir"

plist_path="${plist_dir}/${name}.plist"

log_dir="${HOME}/Library/Logs/vertix-logger"
mkdir -p "$log_dir"
stdout_log="${log_dir}/stdout.log"
stderr_log="${log_dir}/stderr.log"

# Resolve bun path — launchd runs with a minimal PATH so we need the full path.
bun_path="$(command -v bun 2>/dev/null || true)"
if [[ -z "$bun_path" ]]; then
    # Common install locations
    for candidate in "${HOME}/.bun/bin/bun" "/usr/local/bin/bun" "/opt/homebrew/bin/bun"; do
        if [[ -x "$candidate" ]]; then
            bun_path="$candidate"
            break
        fi
    done
fi
[[ -n "$bun_path" ]] || die "bun not found. Install bun or ensure it is on PATH."

# Build the EnvironmentVariables block if an env file was provided.
env_vars_block=""
if [[ -n "$env_file" ]]; then
    [[ -f "$env_file" ]] || die "Env file not found: $env_file"
    env_vars_block=$'\t<key>EnvironmentVariables</key>\n\t<dict>'
    while IFS= read -r line || [[ -n "$line" ]]; do
        # Skip blank lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        # Strip inline comments
        line="${line%%#*}"
        line="${line%"${line##*[![:space:]]}"}"  # rtrim
        if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            val="${BASH_REMATCH[2]}"
            # Strip surrounding quotes from value
            val="${val#\"}"
            val="${val%\"}"
            val="${val#\'}"
            val="${val%\'}"
            env_vars_block+=$'\n\t\t<key>'"${key}"$'</key>\n\t\t<string>'"${val}"$'</string>'
        fi
    done < "$env_file"
    env_vars_block+=$'\n\t</dict>'
fi

# Auto-include repo-root .env if no explicit env file was given.
if [[ -z "$env_file" && -f "${repo_root}/.env" ]]; then
    env_file="${repo_root}/.env"
    env_vars_block=$'\t<key>EnvironmentVariables</key>\n\t<dict>'
    while IFS= read -r line || [[ -n "$line" ]]; do
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        line="${line%%#*}"
        line="${line%"${line##*[![:space:]]}"}"
        if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            val="${BASH_REMATCH[2]}"
            val="${val#\"}"
            val="${val%\"}"
            val="${val#\'}"
            val="${val%\'}"
            env_vars_block+=$'\n\t\t<key>'"${key}"$'</key>\n\t\t<string>'"${val}"$'</string>'
        fi
    done < "$env_file"
    env_vars_block+=$'\n\t</dict>'
fi

cat > "$plist_path" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>${name}</string>

	<key>ProgramArguments</key>
	<array>
		<string>${bun_path}</string>
		<string>--bun</string>
		<string>${repo_root}/packages/vertix-logger/src/index.ts</string>
	</array>

	<key>WorkingDirectory</key>
	<string>${repo_root}</string>
${env_vars_block}
	<key>StandardOutPath</key>
	<string>${stdout_log}</string>

	<key>StandardErrorPath</key>
	<string>${stderr_log}</string>

	<key>RunAtLoad</key>
	<true/>

	<key>KeepAlive</key>
	<dict>
		<key>Crashed</key>
		<true/>
	</dict>

	<key>ThrottleInterval</key>
	<integer>2</integer>
</dict>
</plist>
PLIST

if [[ "$no_start" != "true" ]]; then
    # Unload first in case an old version is already loaded.
    launchctl unload "$plist_path" >/dev/null 2>&1 || true
    launchctl load -w "$plist_path"
    printf '%s\n' "Loaded ${name}"
fi

printf '%s\n' "Installed plist to ${plist_path}"
printf '%s\n' "Logs: ${log_dir}/"
