#!/bin/sh

export CX_AWS_ACCESSKEYID="AKIAJ7ZGNKQZMKXVGSYA"
export CX_AWS_ACCESSSECRET="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"
export CX_DEBUG="1"
export CX_SECRET_TOKEN="f073ba463e449a1ab1cdb5e61bbbf1b29922033407e0ab8ef2e52753ca6dc48b" # should not be committed.
export CX_MONGO_URI="mongodb://localhost:27017/coordinate-vx"

crossbar start
