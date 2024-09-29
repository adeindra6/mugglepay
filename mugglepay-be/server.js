const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

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

app.post("/api/v1/send-prompt", async (req, res) => {
    let prompt = req.body.prompt.toLowerCase();

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