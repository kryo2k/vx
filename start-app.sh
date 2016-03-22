#!/bin/sh

export CX_DEBUG="1"
export CX_SECRET_TOKEN="f073ba463e449a1ab1cdb5e61bbbf1b29922033407e0ab8ef2e52753ca6dc48b" # should not be committed.
export CX_RABBITMQ_URI="amqp://192.168.250.3"
export CX_MONGO_URI="mongodb://192.168.250.3:27017/coordinate-vx"

crossbar start
