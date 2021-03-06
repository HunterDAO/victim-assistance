#!/usr/bin/env bash

rm -rf "./packages/frontend/artifacts/"
rm -rf "./packages/frontend/types/typechain/"

mkdir -p "./packages/frontend/artifacts/"
mkdir -p "./packages/frontend/types/typechain/"

yarn workspace contracts clean
yarn workspace contracts compile

cp -R -a "./packages/hardhat/artifacts/." "./packages/frontend/artifcacts/"
cp -R -a "./packages/hardhat/typechain/." "./packages/frontend/typechain/typechain/"