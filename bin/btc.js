#!/usr/bin/env node

'use strict';

process.title = 'btc';

var outputPrice = require('../src/index.js').outputPrice;

outputPrice();
