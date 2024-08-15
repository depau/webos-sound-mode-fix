#!/bin/sh
set -eu

SCRIPT_DIR="/media/developer/apps/usr/palm/applications/eu.depau.webos.soundmodefix/assets"

while true; do
    "${SCRIPT_DIR}/soundmodectl.sh" enforce
    sleep 3
done
