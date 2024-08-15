#!/bin/sh
set -eu

SCRIPT_DIR="/media/developer/apps/usr/palm/applications/eu.depau.webos.soundmodefix/assets"

cat >/run/systemd/system/enforce-sound-mode.service <<EOF
[Service]
[Unit]
Description=Force the TV audio mode to a user preset
[Service]
ExecStart=$SCRIPT_DIR/daemon.sh
Restart=on-failure
RestartSec=3
EOF

systemctl daemon-reload
systemctl restart enforce-sound-mode.service

SCRIPT_PATH="$SCRIPT_DIR/install.sh"
set +e
rm -f /var/lib/webosbrew/init.d/20-force-sound-mode
ln -sf "$SCRIPT_PATH" /var/lib/webosbrew/init.d/20-force-sound-mode
