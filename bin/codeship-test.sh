#!/bin/bash

printf "Node "; node -v;
printf "npm v"; npm -v

echo "Testing branch: ${CI_BRANCH}"
if [ ${CI_BRANCH} != "gh-pages" ]; then

if [ ${PIPE_NUM} == "1" ]; then
    echo "Starting local WCT tests"
    npm test
fi

fi