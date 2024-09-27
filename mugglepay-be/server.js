const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const request = require("request");
const sendEmail = require("./email.js");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        message: "Muggle Pay",
    });
});

let latestBitcoinPrice = 0;

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

app.post("/api/v1/chat-gpt", async (req, res) => {
    const token = "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";

    try {
        let httpResponse = await callChatGPT("https://openrouter.ai/api/v1/chat/completions", token, req.body.message);

        res.json({
            "message": "Success!",
            "status": 200,
            "data": {
                "result": httpResponse,
            },
        })
    } catch(err) {
        res.json({
            "message": `There's an error when calling the API: ${err}`,
            "status": 400,
        })
    }
});

app.post("/api/v1/coin-market-cap", async (req, res) => {
    const apiKey = "c4729bc9-8aac-4b18-b93b-d82357670aca";

    try {
        let httpResponse = await callCoinMarketCap("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", apiKey);

        res.json({
            "message": "Success!",
            "status": 200,
            "data": {
                "result": httpResponse,
            },
        });
    } catch(err) {
        res.json({
            "message": `There's an error when calling the API: ${err}`,
            "status": 400,
        });
    }
});

app.post("/api/v1/send-email", async (req, res) => {
    let sendToEmailRes = `The latest price of Bitcoin is ${req.body.data} USD`;
    sendEmail(sendToEmailRes);

    res.json({
        "message": "Email has been sent!",
        "status": 200,
        "data": sendToEmailRes,
    });
});

app.post("/api/v1/send-prompt", async (req, res) => {
    let prompt = req.body.prompt.toLowerCase();

    if(prompt.includes("what is") && prompt.includes("what's") && prompt.includes("price") && prompt.includes("bitcoin")) {
        const apiKey = "c4729bc9-8aac-4b18-b93b-d82357670aca";

        try {
            let httpResponse = await callCoinMarketCap("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", apiKey);
    
            latestBitcoinPrice = httpResponse.data[0].quote.USD.price.toFixed(2);
            res.json({
                "message": "Success!",
                "status": 200,
                "data": {
                    "result": `The latest price of Bitcoin is: $${httpResponse.data[0].quote.USD.price.toFixed(2)} USD`,
                },
            });
        } catch(err) {
            res.json({
                "message": `There's an error when calling the API: ${err}`,
                "status": 400,
            });
        }
    }
    else if(prompt.includes("send") && prompt.includes("@") && prompt.includes("bitcoin") && prompt.includes("price")) {
        let sendToEmailRes = `The latest price of Bitcoin is: $${latestBitcoinPrice} USD`;
        let emailTo = prompt.match(/\S+@[^\s.]+\.[^.\s]+/);
        sendEmail(sendToEmailRes, emailTo);

        res.json({
            "message": "Email has been sent!",
            "status": 200,
            "data": {
                "result": `Email has been sent to ${emailTo}!`,
            },
        });
    }
    else {
        res.json({
            "message": "Bad Request!",
            "status": 400,
            "data": {
                "result": "Sorry, we can't recognize that prompt!",
            },
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});