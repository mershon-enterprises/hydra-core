#!/bin/bash
dir=`pwd`

# Build the RestClient
cd "$dir/RestClient"
grunt dev

# Build the Data Gatherer
cd "$dir/data-gatherer"
grunt dev

# Build the front-end
cd "$dir/WebService/web-service-front-end"
grunt dev

# Build the back-end and bundle everything
cd "$dir/WebService/web-service"
lein run
