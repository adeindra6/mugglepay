const request = require("request");

function callCoinMarketCap(url, apiKey) {
    return new Promise(function (resolve, reject) {
        request.get({
            "headers": {
                "Accept": "application/json",
                "X-CMC_PRO_API_KEY": apiKey,
            },
            url: url,
        }, function(error, response, body) {
            if(error) {
                reject(error);
            }
            resolve(JSON.parse(body));
        });
    })
}

module.exports = callCoinMarketCap;