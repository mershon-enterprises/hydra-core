#!/bin/bash
dir=`pwd`

cd "$dir/RestClient"
grunt clean

cd "$dir/data-gatherer"
grunt clean

cd "$dir/WebService/web-service-front-end"
grunt clean

cd "$dir/WebService/web-service"
lein clean

cd "$dir/WebService/well-test-identifier"
lein clean

cd "$dir"
