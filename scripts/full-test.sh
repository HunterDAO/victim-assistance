#!/usr/bin/env bash

yarn workspace dapp test
yarn workspace contracts test
yarn workspace poap-hunterdao-connector test
yarn workspace github-hunterdao-connector test
# yarn workspace discord-hunterdao-connector test
yarn workspace coordinApe-hunterdao-connector test
# yarn connectors/sourcecred/instance  test
# yarn workspace connectors/sourcecred/server test
yarn workspace proxy-issuer-hunterdao-connector test