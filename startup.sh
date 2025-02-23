#!/bin/sh
eval $(aws s3 cp s3://moscaresolutions/env_files/.client_env - | sed 's/^/export /')
npm run start