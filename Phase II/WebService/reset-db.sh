#!/bin/bash
path=`dirname $0`

psql -U postgres -h 127.0.0.1 < "$path/reset.sql"
