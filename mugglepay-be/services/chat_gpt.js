const request = require("request");

function callChatGPT(url, token, message) {
    return new Promise(function (resolve, reject) {
        request.post({
            "headers": {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            url: url,
            body: {
                "model": "openai/gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "user",
                        "content": message,
                    }
                ]
            },
            json: true,
        }, function(error, response, body) {
            if(error) {
                reject(error);
            }
            resolve(body);
        });
    });
}

module.exports = callChatGPT;