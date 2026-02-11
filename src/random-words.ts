import { wordlist } from "./wordlist.ts";
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
      return Number(
        new ConvertBase(6, x, (a) => a + 1)
          .convert()
          .toString()
          .padStart(5, "1"),
      );
    });

    const words = new Wordlist().list();
    let result = [];
    for (let n of convertedNumbers) {
      for (let key in words) {
        if (key === n.toString()) {
          result.push(words[key]);
        }
      }
    }
    return result.join("-");
  }
}

/**
 * A local random number generator class.
 *
 * This class generates an array of random numbers within a specified range.
 *
 * @class RandomLocal
 * @param {number} count - The number of random numbers to generate.
 */
export class RandomLocal {
  /**
   * Creates an instance of RandomLocal.
   *
   * @param {number} count - The number of random numbers to generate.
   * @memberof RandomLocal
   */
  constructor(count) {
    this.count = count;
  }

  /**
   * Generates an array of random numbers within a specified range.
   *
   * This method returns a promise that resolves with an array of random numbers.
   *
   * @async
   * @returns {Promise<number[]>} A promise that resolves with an array of random numbers.
   */
  async calculate() {
    return new Promise((resolve, reject) => {
      const result = crypto.getRandomValues(new Uint16Array(this.count));
      if (!result) {
        reject("fail");
      } else {
        resolve(result.map((x) => x % 7775));
      }
    });
  }
}

/**
 * A random number generator class that uses the Random.org API.
 *
 * This class generates an array of random numbers within a specified range using the Random.org API.
 *
 * @class RandomAPI
 * @param {number} count - The number of random numbers to generate.
 */
export class RandomAPI {
  /**
   * Creates an instance of RandomAPI.
   *
   * @param {number} count - The number of random numbers to generate.
   * @memberof RandomAPI
   */
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

  /**
   * Calculates an array of random numbers using the Random.org API.
   *
   * This method sends a POST request to the Random.org API with the specified parameters and returns a promise that resolves with an array of random numbers.
   *
   * @async
   * @returns {Promise<number[]>} A promise that resolves with an array of random numbers.
   */
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
