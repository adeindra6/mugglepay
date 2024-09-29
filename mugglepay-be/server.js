const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const moment = require("moment");

const callCoinMarketCap = require("./services/fetch_price.js");
const sendEmail = require("./services/email.js");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        message: "Muggle Pay",
    });
});

let latestCryptosPrice = [];
const unlistedCrypto = [
    "celo",
];

app.post("/api/v1/send-prompt", async (req, res) => {
    let prompt = req.body.prompt.toLowerCase();
    latestCryptosPrice = [];

    if((prompt.includes("what is") || prompt.includes("what's")) && prompt.includes("price")) {
        const apiKey = "c4729bc9-8aac-4b18-b93b-d82357670aca";

        try {
            let httpResponse = await callCoinMarketCap("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", apiKey);
            let splitPrompt = prompt.split(" ");

            for(let i=0; i<httpResponse.data.length; i++) {
                for(let j=0; j<splitPrompt.length; j++) {
                    if(splitPrompt[j] == httpResponse.data[i].slug || splitPrompt[j] == httpResponse.data[i].symbol.toLowerCase()) {
                        latestCryptosPrice.push({
                            "coin_name": httpResponse.data[i].name,
                            "price": httpResponse.data[i].quote.USD.price.toFixed(2),
                        });
                    }
                }
            }

            for(let i=0; i<unlistedCrypto.length; i++) {
                for(let j=0; j<splitPrompt.length; j++) {
                    if(splitPrompt[j] == unlistedCrypto[i]) {
                        let quoteResponse = await callCoinMarketCap(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${splitPrompt[j]}`, apiKey);

                        latestCryptosPrice.push({
                            "coin_name": quoteResponse.data[splitPrompt[j].toUpperCase()][0].name,
                            "price": quoteResponse.data[splitPrompt[j].toUpperCase()][0].quote.USD.price.toFixed(2),
                        });
                    }
                }
            }

            let result = "";
            for(let i=0; i<latestCryptosPrice.length; i++) {
                result = result + `${i+1}. ${latestCryptosPrice[i].coin_name}: $${latestCryptosPrice[i].price} USD\n`;
            }

            res.json({
                "message": "Success!",
                "status": 200,
                "data": {
                    "result": `Here's the latest price of cryptocurrencies:\n${result}`,
                },
            });
        } catch(err) {
            res.json({
                "message": `There's an error when calling the API: ${err}`,
                "status": 400,
            });
        }
    }
    else if(prompt.includes("send") && prompt.includes("@") && prompt.includes("price")) {
        let result = "";
        for(let i=0; i<latestCryptosPrice.length; i++) {
            result = result + `${i+1}. ${latestCryptosPrice[i].coin_name}: $${latestCryptosPrice[i].price} USD\n`;
        }

        let sendToEmailRes = `Here's the latest price of cryptocurrencies:\n${result}`;
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
    else if(prompt.includes("date") && prompt.includes("today")) {
        let today = moment().format("MMMM Do YYYY");

        res.json({
            "message": "Success!",
            "status": 200,
            "data": {
                "result": `Today date is: ${today}`,
            },
        });
    }
    else if((prompt.includes("what is") || prompt.includes("what's")) && prompt.includes("top") && prompt.includes("token")) {
        const apiKey = "c4729bc9-8aac-4b18-b93b-d82357670aca";
        latestCryptosPrice = [];

        try {
            let httpResponse = await callCoinMarketCap("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", apiKey);
            let splitPrompt = prompt.split(" ");
            let limit = 1;

            for(let i=0; i<splitPrompt.length; i++) {
                if(!isNaN(splitPrompt[i])) {
                    limit = splitPrompt[i];
                }
            }

            for(let i=0; i<limit; i++) {
                latestCryptosPrice.push({
                    "coin_name": httpResponse.data[i].name,
                    "price": httpResponse.data[i].quote.USD.price.toFixed(2),
                });
            }

            let result = "";
            for(let i=0; i<latestCryptosPrice.length; i++) {
                result = result + `${i+1}. ${latestCryptosPrice[i].coin_name}: $${latestCryptosPrice[i].price} USD\n`;
            }

            res.json({
                "message": "Success!",
                "status": 200,
                "data": {
                    "result": `Here's the top ${limit} tokens:\n${result}`,
                },
            });
        } catch(err) {
            res.json({
                "message": `There's an error when calling the API: ${err}`,
                "status": 400,
            });
        }
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