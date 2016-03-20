#!/bin/env node

'use strict';

var
format = require('util').format,
siteSignature = require('../common/components/site-signature');

console.log('New private key [KEEP SECRET]: %s', siteSignature.createPrivateKey());
