#!/bin/bash
# Play The Hateful Eight in its own window (F = fullscreen).   ./play.sh            title screen
#   dev: ./play.sh '?ch=4'  start at a chapter     ./play.sh '?ch=3&auto'  watch it play itself
cd "$(dirname "$0")"
URL="file://$PWD/index.html$1"
for b in brave-browser chromium google-chrome firefox; do
  if command -v $b >/dev/null; then
    case $b in firefox) exec firefox "$URL" ;; *) exec $b --app="$URL" --window-size=1920,1080 --start-fullscreen --allow-file-access-from-files ;; esac
  fi
done
xdg-open "$URL"
