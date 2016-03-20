#!/bin/sh

export CX_DEBUG="1"
export CX_PORT=9999
export CX_ADDR="0.0.0.0"
export CX_COMPONENT="app"
export CX_SECRET_TOKEN="f073ba463e449a1ab1cdb5e61bbbf1b29922033407e0ab8ef2e52753ca6dc48b" # should not be committed.
export CX_MONGO_URI="mongodb://192.168.250.3:27017/coordinate-vx"

node server.js
