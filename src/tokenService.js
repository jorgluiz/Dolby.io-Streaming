import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.MILLICAST_API_KEY;

if (!apiKey) {
  console.error('Erro: MILLICAST_API_KEY não encontrada no arquivo .env');
}

const url = new URL('https://api.millicast.com/api/publish_token/');

const defaultOptions = {
  protocol: url.protocol,
  host: url.host,
  path: url.pathname,
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Accept': 'application/json'
  },
};

export function createToken(data) {
  return new Promise((resolve, reject) => {
    if (!data) {
      reject({ msg: 'Parâmetros inválidos.' });
      return;
    }

    const options = {
      ...defaultOptions,
      method: 'POST',
    };

    const req = https.request(options, (resp) => {
      let result = '';
      resp.on('data', (chunk) => {
        result += chunk;
      });

      resp.on('end', () => {
        try {
          const parsedResult = JSON.parse(result);
          resolve(parsedResult);
        } catch (err) {
          reject({ msg: 'Erro ao parsear a resposta.', error: err });
        }
      });

      resp.on('error', (err) => {
        console.error('Erro na resposta:', err);
        reject(err);
      });
    });

    req.on('error', (err) => {
      console.error('Erro na requisição:', err);
      reject(err);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

// import https from "https"
// import dotenv from 'dotenv';
// // Carregar variáveis de ambiente
// dotenv.config();

// const apiKey = process.env.MILLICAST_API_KEY;
// const url = new URL('https://api.millicast.com/api/publish_token/');

// // Ajuste: use 'url.pathname' ao invés de 'url.path'
// const defaultOptions = {
//   protocol: url.protocol,
//   host: url.host,
//   port: url.port,
//   path: url.pathname, // Corrigido de url.path para url.pathname
//   headers: {
//     Authorization: 'Bearer ' + apiKey,
//     'Accept': 'application/json',
//     'Content-Type': 'application/json'
//   },
// };

// export function createToken(data) {
//   console.log(data, "tokenService")

//   return new Promise((resolve, reject) => {
//     if (!data) {
//       reject({ msg: 'Something went wrong.' });
//       return;
//     }

//     const opts = {
//       ...defaultOptions,
//       method: 'POST',
//     };

//     const req = https.request(opts, (resp) => {
//       let result = '';
//       resp.on('data', (chunk) => {
//         result += chunk;
//       });
//       resp.on('end', () => {
//         resolve(result);
//       });
//       resp.on('error', (err) => {
//         console.log(err)
//         reject(err);
//       });
//     });

//     req.write(JSON.stringify(data));
//     req.end();
//   });
// }

