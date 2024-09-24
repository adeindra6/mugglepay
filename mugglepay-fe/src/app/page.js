import styles from "./page.module.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
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
            />
          <button className="btn btn-primary">Ask</button>
        </div>
        <div className={styles.ctas}>
          <button className="btn btn-success">Send to shawn@mugglepay.com</button>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>Created By <a href="https://www.mugglepay.com/">MugglePay</a></p>
      </footer>
    </div>
  );
}
