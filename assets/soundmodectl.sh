#!/bin/sh
set -eu

ALERT_TIMEOUT="${ALERT_TIMEOUT:-3}"
SCRIPT_DIR="/media/developer/apps/usr/palm/applications/eu.depau.webos.soundmodefix/assets"
cd "$SCRIPT_DIR/.."

usage() {
    echo "Usage: $0 <get|set|disable|enforce|install> [soundmode]"
    exit 1
}

if [ "$(id -u)" != 0 ]; then
    echo "The script is not running as root: $(id)" >&2
    exit 1
fi

get_settings() {
    if [ -f "soundmode.txt" ]; then
        cat "soundmode.txt"
    else
        echo "enabled,music"
    fi
}

set_settings() {
    echo "$1" >"soundmode.txt"
}

get_sound_mode() {
    luna-send -f -q settings.soundMode -n 1 'luna://com.webos.settingsservice//getSystemSettings' '{"category":"sound"}' |
        grep soundMode |
        cut -d ':' -f 2 |
        tr -d ' "'
}

set_sound_mode() {
    luna-send -f -n 1 'luna://com.webos.settingsservice//setSystemSettings' '{"category":"sound","settings":{"soundMode":"'"$1"'"}}'
}

daemonize() {
    setsid -f "$@" 0<&- 2>&1 >/dev/null &
}

_display_alert() {
    luna-send -f -n 1 luna://com.webos.notification/createAlert '
        {
            "message": "\"Sound Mode Fix\" app changed the sound mode. Open the app to change the settings",
            "buttons":  [
                {
                    "label": "Open app",
                    "onclick": "luna://com.webos.applicationManager/launch",
                    "params": {
                        "id": "eu.depau.webos.soundmodefix"
                    }
                }
            ]
        }
  ' | grep 'alertId' | cut -d ':' -f 2 | tr -d ' ",'
}

display_alert() {
    if [ "${DISABLE_TOAST:-}" = "1" ]; then
        return
    fi

    _d_a_alert_id="$(_display_alert)"
    daemonize "$SCRIPT_DIR/dismiss_alert.sh" "$ALERT_TIMEOUT" "$_d_a_alert_id"
}

enforce_settings() {
    _e_s_settings="$(get_settings)"
    _e_s_enabled="${_e_s_settings%,*}"
    _e_s_mode="${_e_s_settings#*,}"

    if [ "$_e_s_enabled" != "enabled" ]; then
        return
    fi

    _e_s_current_mode="$(get_sound_mode)"

    if [ "$_e_s_current_mode" != "$_e_s_mode" ]; then
        set_sound_mode "$_e_s_mode"
        display_alert
    fi
}

install() {
    "$SCRIPT_DIR/install.sh"
}

COMMAND="${1:-}"
if [ -z "$COMMAND" ]; then
    usage
fi

if [ -f "$SCRIPT_DIR/../noPopups" ]; then
    DISABLE_TOAST=1
fi

case "$COMMAND" in
"install")
    install
    ;;
"get")
    get_settings
    ;;
"set")
    if [ -z "${2:-}" ]; then
        usage
    fi
    DISABLE_TOAST=1
    set_settings "enabled,$2"
    enforce_settings
    ;;
"disable")
    CUR="$(get_settings | cut -d ',' -f 2)"
    set_settings "disabled,$CUR"
    ;;
"enforce")
    enforce_settings
    ;;
*)
    usage
    ;;
esac
