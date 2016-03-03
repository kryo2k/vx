#!/bin/sh

export CX_DEBUG="1"
export CX_PORT=9999
export CX_ADDR="0.0.0.0"
export CX_COMPONENT="app"
export CX_MONGO_URI="mongodb://192.168.250.3:27017/coordinate-vX-test"
export CX_SECRET_TOKEN="-- something secret goes here --"

nodeunit test