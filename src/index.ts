import { Hono } from 'hono'
import { Passphrase, RandomLocal, RandomAPI } from './random-words.ts'

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

function numberSanitize(number) {
  return Math.min(Math.floor(Math.abs(number)), 1000) || 6;
}

app.get('/api/random/:count?', async (c) => {
  const { count } = c.req.param();
  const passphrase = new Passphrase(new RandomLocal(numberSanitize(count)));
  return c.text(await passphrase.roll());
});

app.get('/api/random/:count?/token/:token?', async (c) => {
  const { count, token } = c.req.param();
  if (token) {
    const passphrase = new Passphrase(new RandomAPI(numberSanitize(count), token));
    return c.text(await passphrase.roll());
  }
  const passphrase = new Passphrase(new RandomLocal(numberSanitize(count)));
  return c.text(await passphrase.roll());
});

export default app
