"use client";
import axios from "axios";
import styles from "./page.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";

export default function Home() {
  const [chatGPTData, setChatGPTData] = useState(null);
  const [coinMarketCapData, setCoinMarketCapData] = useState(null);
  const [emailSent, setEmailSent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");

  const serverUrl = "http://localhost:3001";

  const fetchChatGPTData = async () => {
    setLoading(true);
    await axios.post(`${serverUrl}/api/v1/chat-gpt`, {
        "message": message,
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      })
      .then((response) => {
        setChatGPTData(response.data.data.result.choices[0].message.content);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchCoinMarketCapData = async () => {
    setLoading1(true);
    await axios.post(`${serverUrl}/api/v1/coin-market-cap`, null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
      .then((response) => {
        setCoinMarketCapData(response.data.data.result.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading1(false);
      })
  };

  const getCoinMarketCapData = (data) => {
    let coinData = [];
    for(let i=0; i<data.length; i++) {
      const item = data[i];
      coinData.push(<li key={item.id}>{item.name} ({item.symbol}): {item.quote.USD.price} USD</li>);
    }

    return coinData;
  };

  const sendEmail = async () => {
    if(coinMarketCapData != null) {
      setLoading2(true);
      await axios.post(`${serverUrl}/api/v1/send-email`, {
          "data": coinMarketCapData[0].quote.USD.price,
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        })
        .then((response) => {
          setEmailSent(response.data.message);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading2(false);
        });
    }
    else {
      alert("Please fetch coin price from https://coinmarketcap.com first!");
    }
  };

  const sendPrompt = async () => {
    setLoading(true);
    await axios.post(`${serverUrl}/api/v1/send-prompt`, {
      "prompt": message,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
      .then((response) => {
        setAnswer(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 style={{textAlign: "center"}}>MugglePay Chatbot</h1>
        <div className={styles.ctas}>
          <input
            className="form-control"
            placeholder="Give prompt here"
            onChange={(e) => {
              setMessage(e.currentTarget.value);
            }}
            />
          <button className="btn btn-primary" onClick={() => sendPrompt()}>Send</button>
        </div>
        {/*
        <div className={styles.ctas}>
          <button className="btn btn-info" onClick={() => fetchCoinMarketCapData()}>Fetch Data from Coin Market Cap</button>
        </div>
        */}
        {loading &&
        <div className={styles.ctas}>
          <h3>Generating answer. Please wait...</h3>
        </div>
        }
        {loading1 &&
        <div className={styles.ctas}>
          <h3>Fetching response from Coin Market Cap. Please wait...</h3>
        </div>
        }
        {loading2 &&
        <div className={styles.ctas}>
          <h3>Sending email please wait...</h3>
        </div>
        }
        {answer != "" &&
        <div className={styles.ctas}>
          <pre><h3>{answer.result}</h3></pre>
        </div>
        }
        {chatGPTData != null &&
        <div className={styles.ctas}>
          <h3>Here's the answer from Chat GPT:</h3>
          <p>{chatGPTData}</p>
        </div>
        }
        {/*
        <div className={styles.ctas}>
          <button className="btn btn-success" onClick={() => sendEmail()}>Send to shawn@mugglepay.com the price of Bitcoin</button>
        </div>
        */}
        {emailSent != null && 
        <div className={styles.ctas}>
          <h4>{emailSent}</h4>
        </div>
        }
        {coinMarketCapData != null &&
        <div>
          <div className={styles.ctas}>
            <h3>Here's coins price information fetched from https://coinmarketcap.com</h3>
          </div>
          <div className={styles.ctas}>
            <ol>
              {getCoinMarketCapData(coinMarketCapData)}
            </ol>
          </div>
        </div>
        }
      </main>
      <footer className={styles.footer}>
        <p>Created By <a href="https://www.mugglepay.com/">MugglePay</a></p>
      </footer>
    </div>
  );
}
