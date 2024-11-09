import https from "https"
import dotenv from 'dotenv';
// Carregar variáveis de ambiente
dotenv.config();

const apiKey = process.env.API_KEY_STREAMING;
const url = new URL('https://api.millicast.com/api/publish_token/');

// Ajuste: use 'url.pathname' ao invés de 'url.path'
const defaultOptions = {
  protocol: url.protocol,
  host: url.host,
  port: url.port,
  path: url.pathname, // Corrigido de url.path para url.pathname
  headers: {
    Authorization: 'Bearer ' + apiKey,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
};

export function createToken(data) {
  console.log(data, "tokenService")

  // const data = {
  //   label: "test",
  //   streams: [
  //     {
  //       streamName: "123"
  //     }
  //   ]
  // };
  return new Promise((resolve, reject) => {
    if (!data) {
      reject({ msg: 'Something went wrong.' });
      return;
    }

    const opts = {
      ...defaultOptions,
      method: 'POST',
    };

    const req = https.request(opts, (resp) => {
      let result = '';
      resp.on('data', (chunk) => {
        result += chunk;
      });
      resp.on('end', () => {
        resolve(result);
      });
      resp.on('error', (err) => {
        console.log(err)
        reject(err);
      });
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

