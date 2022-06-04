#!/usr/bin/env bash
if ! [ -x "$(command -v pm2)" ]; then
  echo 'Error: pm2 is not installed.' >&2
  echo 'Installing globally: pm2' >&2
  npm install pm2 -g
fi


pm2 start processes.yaml
# yarn workspace connectors/sourcecred/instance run load
# yarn workspace connectors/sourcecred/instance run start
