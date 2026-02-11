import Wordlist from "./wordlist.ts";
//import "dotenv/config";
//import crypto from 'crypto';

class ConvertBase {
  constructor(base, number, modifier = (x) => x) {
    this.base = base;
    this.number = number;
    this.modifier = modifier;
    Object.freeze(this); // Make the instance immutable
  }

  convert() {
    let result = [];
    let intermediate = this.number;
    while (intermediate > 0) {
      result.push(this.modifier(intermediate % this.base));
      intermediate = Math.floor(intermediate / this.base);
    }
    while (result.length < 5) {
      result.push(this.modifier(0));
    }
    result.reverse();
    return Number(result.join(""));
  }
}
class RequestRoll {
  constructor(randomizer) {
    this.randomizer = randomizer;
  }

  async calculate() {
    return await this.randomizer.calculate();
  }
}

export class Passphrase {
  constructor(api, count = 6) {
    this.count = count;
    this.api = api;
  }

  async roll() {
    const numbers = await new RequestRoll(this.api).calculate();
    const convertedNumbers = numbers.map((x) => {
      return Number(new ConvertBase(6, x, (a) => a + 1).convert().toString());
    });

    const words = new Wordlist().list();
    let result = convertedNumbers.map((x) => {
      return words[x];
    });
    console.log(result);
    //let result = [];
    //    for (let n of convertedNumbers) {
    //      for (let key in words) {
    //        if (Number(key) === Number(n)) {
    //          result.push(words[key]);
    //        }
    //      }
    //    }
    return result.join("-");
  }
}

export class RandomLocal {
  constructor(count) {
    this.count = count;
  }

  async calculate() {
    return new Promise((resolve, reject) => {
      const result = [...crypto.getRandomValues(new Uint16Array(this.count))];
      if (!result) {
        reject("fail");
      } else {
        resolve(result.map((x) => x % 7775));
      }
    });
  }
}

export class RandomAPI {
  constructor(count, token) {
    this.count = count;
    this.url = "https://api.random.org/json-rpc/2/invoke";
    this.body = {
      jsonrpc: "2.0",
      method: "generateIntegers",
      params: {
        apiKey: token,
        n: count,
        min: 0, // base ten of 11111
        max: 7775, // base ten of 66666
        replacement: true,
      },
      id: 42,
    };
  }

  async calculate() {
    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.result.random.data;
    } catch (error) {
      console.error("Error fetching random hex string:", error);
      return [];
    }
  }
}
