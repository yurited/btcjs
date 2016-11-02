/* jshint node:true */

'use strict';

var http = require('http');
var async = require('async');
var colors = require('colors');
var getObjValue = require('../lib/get_obj_value');


function outputPrice() {
    async.parallel([
        function(cb) {
            http.get({
                host: 'api.coindesk.com',
                path: '/v1/bpi/currentprice/CNY.json'
            }, function(response) {
                var body = '';
                response.on('data', function(d) {
                    body += d;
                });
                response.on('end', function() {
                    var parsed = JSON.parse(body);
                    var USD = getObjValue(parsed, ['bpi', 'USD', 'rate_float']);
                    var CNY = getObjValue(parsed, ['bpi', 'CNY', 'rate_float']);
                    if (!USD || !CNY) {
                        cb('Data error from coindesk.', null);
                        return;
                    }
                    var ret = {
                        usd: USD,
                        cny: CNY,
                        cny_usd_btc: CNY / USD
                    };
                    cb(null, ret);
                });
            });
        },
        function(cb) {
            http.get({
                host: 'query.yahooapis.com',
                path: '/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22USDCNY%22)&format=json&diagnostics=false&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys'
            }, function(response) {
                var body = '';
                response.on('data', function(d) {
                    body += d;
                });
                response.on('end', function() {
                    var parsed = JSON.parse(body);
                    var ret = getObjValue(parsed, ['query', 'results', 'rate', 'Rate']);
                    if (!ret) {
                        cb('Data error from yahoo.', null);
                        return;
                    }
                    cb(null, ret);
                });
            });

        }
    ], function(err, results) {
        if (err) {
            console.error('Failed.', err);
            return;
        }
        var cny_usd = parseFloat(results[1]);
        var cny_usd_btc = results[0].cny_usd_btc;
        var diff = (cny_usd_btc / cny_usd - 1) * 100;
        var isUp = diff >= 0;
        diff = ('(' + (isUp ? '+' + diff.toFixed(2) : diff.toFixed(2)) + '%)');
        diff = isUp ? diff : diff.red;
        console.log('\tCNY = ¥ ' + results[0].cny + ' / BTC');
        console.log('\tUSD = $ ' + colors.black.bgGreen(results[0].usd) + ' / BTC');
        console.log('\tCNY/USD = ' + results[1]);
        console.log(
            '\tCNY/USD based on BTC = ' +
            results[0].cny_usd_btc.toFixed(4) + ' ' +
            diff
        );
        // if (cny_usd_btc <= cny_usd + 0.01) {
        //     console.log('\tCNY/USD based on BTC = ' + results[0].cny_usd_btc.toFixed(4).red);
        // } else {
        //     console.log('\tCNY/USD based on BTC = ' + results[0].cny_usd_btc.toFixed(4));
        // }
        console.log('Data provided by coindesk.com and Yahoo! Finance.\n'.gray)
    });
}

exports.outputPrice = outputPrice;
