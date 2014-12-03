#!/bin/bash
dir=`pwd`

# Build the RestClient
cd "$dir/RestClient"
grunt build

# Build the Data Gatherer
cd "$dir/data-gatherer"
grunt build

# Build the front-end
cd "$dir/WebService/web-service-front-end"
grunt build

# Build the back-end and bundle everything
cd "$dir/WebService/web-service"
lein ring uberwar

# Build the back-end well-test identifier
cd "$dir/WebService/well-test-identifier"
lein ring uberwar

cd "$dir"
clear
echo "Final build file at:"
ls WebService/web-service/target/*-standalone.war
