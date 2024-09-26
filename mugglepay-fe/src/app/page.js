"use client";
import axios from "axios";
import styles from "./page.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";

export default function Home() {
  const [chatGPTData, setChatGPTData] = useState(null);
  const [coinMarketCapData, setCoinMarketCapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [message, setMessage] = useState("");

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
  }

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
  }

  const getCoinMarketCapData = (data) => {
    let coinData = [];
    for(let i=0; i<data.length; i++) {
      const item = data[i];
      coinData.push(<li key={item.id}>{item.name} ({item.symbol}): {item.quote.USD.price} USD</li>);
    }

    return coinData;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ol>
          <li>
            Welcome to MugglePay Crypto Price Checker
          </li>
          <li>
            You can check it via Chat GPT and Coin Market Cap below
          </li>
        </ol>
        <div className={styles.ctas}>
          <input
            className="form-control"
            placeholder="Ask Chat GPT"
            onChange={(e) => {
              setMessage(e.currentTarget.value);
            }}
            />
          <button className="btn btn-primary" onClick={() => fetchChatGPTData()}>Ask</button>
        </div>
        <div className={styles.ctas}>
          <button className="btn btn-info" onClick={() => fetchCoinMarketCapData()}>Fetch Data from Coin Market Cap</button>
        </div>
        {loading &&
        <div className={styles.ctas}>
          <h3>Fetching response from Chat GPT. Please wait...</h3>
        </div>
        }
        {loading1 &&
        <div className={styles.ctas}>
          <h3>Fetching response from Coin Market Cap. Please wait...</h3>
        </div>
        }
        {chatGPTData != null &&
        <div className={styles.ctas}>
          <h3>Here's the answer from Chat GPT:</h3>
          <p>{chatGPTData}</p>
        </div>
        }
        <div className={styles.ctas}>
          <button className="btn btn-success">Send to shawn@mugglepay.com</button>
        </div>
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
