import dotenv from 'dotenv';
dotenv.config(); // Carregar variáveis de ambiente
const apiKey = process.env.MILLICAST_API_KEY;
import https from "https"
import express from "express"
import fs from "fs"
import bodyParser from "body-parser"
import path from "path"
import open from "open"
import { salvarDadosNoDatabase, obterDados } from "./firebaseService.js"
import { createToken } from "./tokenService.js"
import axios from 'axios'
import cors from 'cors'
import { fileURLToPath } from 'url';
import { GraphQLClient, gql } from 'graphql-request'


const app = express();

// Defina __filename e __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public folder

app.use(bodyParser.json());
app.use(cors()); // Habilita CORS para o frontend
app.use(bodyParser.urlencoded({ extended: true }));


// Serve the index page for other requests
app.get('/', (req, res) => {
  res.render('streamControls');
});

app.get('/live-player', async (req, res) => {
  res.render('streamViewer');
})

// app.get('/live-player/:streamName', async (req, res) => {
//   // const streamName = await obterDados()
//   const streamName = req.params
//   console.log(streamName, "live-player")
//   res.render('streamViewer', streamName);
// })

app.get('/viewer/:streamName', async (req, res) => {
  const streamName = req.params
  const values = Object.values(streamName)
  res.render('viewer', { values });
});

app.post('/generateSubscriberToken', async (req, res) => {
  const { streamName, accountId } = req.body;

  if (!streamName || !accountId) {
    return res.status(400).json({ error: 'Missing streamName or accountId' });
  }

  try {
    const response = await axios.post(`https://api.millicast.com/api/v2/streams/${accountId}/generateSubscriberToken`, {}, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(response, "server")

    const token = response.data.token;

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listen to client requests
app.post('/millicast/:endpoint', (req, res) => {
  const params = req.params;
  const { streamName } = req.body

  switch (params.endpoint) {
    case 'createToken':
      createToken(streamName)
        .then((data) => {
          const reponse = JSON.parse(data)
          salvarDadosNoDatabase(reponse.data.name)
          res.json(reponse);
        })
        .catch((err) => {
          res.status(500).json({ status: 'fail', data: err });
        });
      break;
    default:
      res.status(400).json({ status: 'error', desc: 'No endpoint specified' });
  }
});



// app.get('/get', async () => {

//   const publishingToken = 'SEU_PUBLISHING_TOKEN';

//   try {
//     const response = await fetch(`https://api.millicast.com/api/account`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${apiKey}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const accountInfo = await response.json();

//   } catch (error) {
//     console.error('Erro ao obter informações da conta:', error);
//   }
// })

app.post('/get-token-name', async (req, res) => {
  const { token } = req.body

  fetch(`https://api.millicast.com/api/publish_token/${token}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(response => response.json())
    .then(data => {
      console.log('Response:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
})

app.post('/stop-stream', async (req, res) => {
  const { labelName } = req.body
  // console.log('labelName:', labelName)

  fetch("https://api.millicast.com/api/stream/stop", {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      streamId: `p9TPVt/${labelName}`, // Replace with the actual streamId
    })
  })
    .then(response => response.json())
    .then(data => {
      console.log('Response:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
})

// const urlconsult = 'https://api.millicast.com/graphql';
// const data = {
//   streamName: "test",
//   streamAccountId: "9042964"
// };

// const options = {
//   method: 'POST',
//   headers: {
//     'Authorization': `Bearer ${apiKey}`,
//     'Accept': 'application/json',
//     'Content-Type': 'application/json'
//   },
//   body: JSON.stringify(data)
// }

// fetch(urlconsult, options)
//   .then(response => response.json())
//   .then(data => {
//     console.log('Response:', data);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });

app.get('/getlist01', async (req, res) => {

  const endpoint = 'https://api.millicast.com/graphql';

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
  });

  // Defina a consulta GraphQL
  const query = gql`
  query FeedFindMany($skip: Int, $limit: Int) {
    feedFindMany(skip: $skip, limit: $limit) {
    accountId
    started
    active
    ended
    name
    streamId
    }
  }
`;

  // Defina as variáveis para a consulta
  const variables = {
    skip: 0,
    limit: 100
  };

  async function fetchFeed(res) {
    try {
      const response = await graphQLClient.request(query, variables);
      console.log('Response:', response);
      res.json(response);
    } catch (error) {
      console.error('GraphQL Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  fetchFeed(res);
})

// Define as opções para o servidor HTTPS, especificando a chave privada e o certificado SSL.
// const httpsOptions = {
//   key: fs.readFileSync(path.resolve(__dirname, './certs', 'server.key')),
//   cert: fs.readFileSync(path.resolve(__dirname, './certs', 'server.cert'))
// };

// Https server for serving our html files. (WebRTC requires https)
// https.createServer(httpsOptions, app).listen(process.env.PORT, (err) => {
//   if (err) throw err;
//   console.log(`Secure server is listening on ${process.env.PORT}`);

//   // Ajuste: abrir a URL correta no navegador com https://localhost
//   open(`https://localhost:${process.env.PORT}`); // Corrigido de http:// para https://
// });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`The server is now running on port ${PORT}`);
  open(`http://localhost:${PORT}`);
});

// const PORT = process.env.PORT || 8080;
// // Apenas em desenvolvimento local, abrir o navegador automaticamente
// if (process.env.NODE_ENV !== 'production') {
//   open(`http://localhost:${PORT}`);
// }

// app.listen(PORT, () => {
//   console.log(`The server is now running on port ${PORT}`);
// });