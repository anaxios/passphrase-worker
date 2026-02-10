import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { html, raw } from 'hono/html'
import { Passphrase, RandomLocal, RandomAPI } from './random-words.ts'

const app = new Hono();

app.use('/*', cors());

function numberSanitize(number) {
  return Math.min(Math.floor(Math.abs(number)), 1000) || 6;
}

app.get('/api/random/:count/token/:token', async (c) => {
  const { count, token } = c.req.param();
  if (token) {
    const passphrase = new Passphrase(new RandomAPI(numberSanitize(count), token));
    return c.text(await passphrase.roll());
  }
  const passphrase = new Passphrase(new RandomLocal(numberSanitize(count)));
  return c.text(await passphrase.roll());
});

app.get('/api/random/:count', async (c) => {
  const { count } = c.req.param();
  const passphrase = new Passphrase(new RandomLocal(numberSanitize(count)));
  return c.text(await passphrase.roll());
});

app.get('/', (c) => {
  return c.html(
    html`<!doctype html>
      <html>
        <head>
          <title>Random Passphrase API</title>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          <h1>Using the Random Passphrase API</h1>
          <p>Welcome to the Random Passphrase API! This API generates random passphrases for you to use. In this guide, we'll walk you through how to use the API to generate passphrases. See the source code here: <a href="https://github.com/anaxios/passphrase-worker">GitHub</a></p>
          <h2>Getting Started</h2>
          <p>To use the API, you'll need to make a GET request to one of the following endpoints:</p>
          <ul>
            <li><code>/api/random/:count</code> (without API key)</li>
            <li><code>/api/random/:count/token/:token</code> (with API key)</li>
          </ul>
          <h2>Passphrase Generation</h2>
          <p>By default, the API will generate a passphrase with 6 words. If the count you provide is invalid, the API will use this default value. The maximum count is 1000. If the count exceeds this maximum, the result will be truncated to the maximum count.</p>
          <h2>Word List</h2>
          <p>The API uses the EFF Long Word List, a list of 7,776 words curated by the Electronic Frontier Foundation (EFF) for generating strong and memorable passphrases. You can view the full list of words <a href="https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt">here</a>.</p>
          <h2>Without API Key</h2>
          <p>If you don't provide an API key, the API will generate a passphrase using a local random number generator, which utilizes Cloudflare's cryptographically secure library to ensure high-quality randomness.</p>
          <p>Make a GET request to <code>/api/random/:count</code>, replacing <code>:count</code> with the number of words you want in your passphrase.</p>
          <p>Example: <code>https://random.daedalist.net/api/random/8</code></p>
          <h2>With API Key</h2>
          <p>If you provide an API key, the API will generate a passphrase using the specified API key. If the API key is for Random.org, the API will use Random.org's API to generate true randomness from atmospheric noise.</p>
          <p>Make a GET request to <code>/api/random/:count/token/:token</code>, replacing <code>:count</code> with the number of words you want in your passphrase and <code>:token</code> with your API key.</p>
          <p>Example: <code>https://random.daedalist.net/api/random/8/token/your_api_key_here</code></p>
          <h2>Parameters</h2>
          <ul>
            <li><code>count</code>: The number of words you want in your passphrase.</li>
            <li><code>token</code>: Your API key.</li>
          </ul>
          <h2>Response</h2>
          <p>The API will respond with a text string containing the generated passphrase.</p>
          <h2>Example Use Cases</h2>
          <ul>
            <li>Generate a passphrase with 6 words: <code>https://random.daedalist.net/api/random/6</code></li>
            <li>Generate a passphrase with 8 words using a local random number generator: <code>https://random.daedalist.net/api/random/8</code></li>
            <li>Generate a passphrase with 4 words using the Random.org API: <code>https://random.daedalist.net/api/random/4/token/your_api_key_here</code></li>
          </ul>
        </body>
      </html>
    `
  );
});

export default app
