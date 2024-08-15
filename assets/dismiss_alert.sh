#!/bin/sh
set -eu

TIMEOUT="$1"
ALERT_ID="$2"

sleep "$TIMEOUT"
luna-send -n 1 luna://com.webos.notification/closeAlert "{\"alertId\":\"$ALERT_ID\"}"
