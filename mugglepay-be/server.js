const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const request = require("request");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        message: "Muggle Pay",
    });
});

function callChatGPT(url, token, message) {
    return new Promise(function (resolve, reject) {
        console.log(url);
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

app.post("/api/v1/chat", async (req, res) => {
    const token = "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";

    try {
        let httpResponse = await callChatGPT("https://openrouter.ai/api/v1/chat/completions", token, req.body.message);

        res.json({
            "result": httpResponse,
        })
    } catch(err) {
        res.json({
            "result": err,
        })
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});