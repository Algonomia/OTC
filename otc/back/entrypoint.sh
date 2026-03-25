#!/bin/sh

cd /otc/orm
npm run deploy
npm run generate
npm start
cd -

exec "$@"
