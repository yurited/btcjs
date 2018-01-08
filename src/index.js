'use strict';
// localbitcoin
// https://localbitcoins.com/buy-bitcoins-online/CNY/alipay/.json

var http = require('http');
var async = require('async');
var colors = require('colors');
var getObjValue = require('../lib/get_obj_value');

let coindeskService = (cb) => {
    http.get({
        host: 'api.coindesk.com',
        path: '/v1/bpi/currentprice/CNY.json'
    }, (response) => {
        const statusCode = response.statusCode;
        let error;
        if (statusCode !== 200) {
            error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`);
        }
        if (error) {
            response.resume();
            return;
        }

        let body = '';
        response.on('data', (data) => {
            body += data;
        });
        response.on('end', () => {
            try {
                let parsed = JSON.parse(body);
                let USD = getObjValue(parsed, ['bpi', 'USD', 'rate_float']);
                let CNY = getObjValue(parsed, ['bpi', 'CNY', 'rate_float']);
                if (!USD || !CNY) {
                    cb('Data error from coindesk.', null);
                    return;
                }
                let ret = {
                    usd: USD,
                    cny: CNY,
                    cny_usd_btc: CNY / USD
                };
                cb(null, ret);
            } catch (e) {
                cb('Data error from coindesk.', null);
            }

        });
    }).on('error', (err) => {
        cb('Request failed from coindesk api.', null);
    });
};

let yahooService = (cb) => {
    http.get({
        host: 'query.yahooapis.com',
        path: '/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22USDCNY%22)&format=json&diagnostics=false&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys'
    }, (response) => {
        const statusCode = response.statusCode;
        let error;
        if (statusCode !== 200) {
            error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`);
        }
        if (error) {
            response.resume();
            return;
        }
        let body = '';
        response.on('data', (data) => {
            body += data;
        });
        response.on('end', () => {
            try{
                let parsed = JSON.parse(body);
                let ret = getObjValue(parsed, ['query', 'results', 'rate', 'Rate']);
                if (!ret) {
                    cb('Data error from yahoo.', null);
                    return;
                }
                cb(null, ret);
            } catch (e) {
                cb('Data error from coindesk.', null);
            }
        });
    }).on('error', (err) => {
        cb('Request failed from yahoo api.', null);
    });
};

exports.outputPrice = () => {
    async.parallel(
        [coindeskService, yahooService],
        (err, results) => {
            if (err) {
                console.error(('Failed. ' + err).red);
                return;
            }
            let cny_usd = parseFloat(results[1]);
            let cny_usd_btc = results[0].cny_usd_btc;
            let diff = (cny_usd_btc / cny_usd - 1) * 100;
            let isUp = diff >= 0;
            diff = ('(' + (isUp ? '+' + diff.toFixed(2) : diff.toFixed(2)) + '%)');
            diff = isUp ? diff : diff.red;
            console.log('\tCNY = ¥ ' + results[0].cny + ' / BTC');
            console.log('\tUSD = $ ' + colors.black.bgGreen(results[0].usd) + ' / BTC');
            console.log('\tCNY/USD = ' + results[1]);
            console.log(
                '\tCNY/USD based on BTC = ' +
                results[0].cny_usd_btc.toFixed(4) + ' ' + diff
            );
            console.log('Data provided by coindesk.com and Yahoo! Finance.\n'.gray);
        }
    );
}
