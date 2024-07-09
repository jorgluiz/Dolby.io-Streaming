require('dotenv').config();
const https = require("https");
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const open = require("open");
const {salvarDadosNoDatabase, obterDados} = require("./configFirebase")
const axios = require('axios');
const cors = require('cors');


const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(cors()); // Habilita CORS para o frontend
app.use(bodyParser.urlencoded({ extended: true }));

// Define as opções para o servidor HTTPS, especificando a chave privada e o certificado SSL.
// const httpsOptions = {
//     key: fs.readFileSync(path.resolve(__dirname, './certs', 'server.key')),
//     cert: fs.readFileSync(path.resolve(__dirname, './certs', 'server.cert'))
// };


const apiKey = process.env.API_KEY;
// const PORT = '8084';
const url = new URL('https://api.millicast.com/api/publish_token/');

// Ajuste: use 'url.pathname' ao invés de 'url.path'
const defaultOptions = {
    protocol: url.protocol,
    host: url.host,
    port: url.port,
    path: url.pathname, // Corrigido de url.path para url.pathname
    headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
    },
};

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

function createToken(data) {
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
                reject(err);
            });
        }); 

        req.write(JSON.stringify(data));
        req.end();
    });
}

// Listen to client requests
app.post('/millicast/:endpoint', (req, res) => {
    const params = req.params;

    switch (params.endpoint) {
        case 'createToken':
            createToken(req.body)
                .then((data) => {
                    res.json(JSON.parse(data));
                })
                .catch((err) => {
                    res.status(500).json({ status: 'fail', data: err });
                });
            break;
        default:
            res.status(400).json({ status: 'error', desc: 'No endpoint specified' });
    }
});

// Serve the index page for other requests
app.get('/', (req, res) => {
    res.render('index');
});

// const yourPublishingToken = process.env.yourPublishingToken
// const yourStreamName = process.env.yourStreamName

// app.get('/publisher', (req, res) => {
//     res.render('publisher', {yourPublishingToken, yourStreamName});
// });

app.get('/viewer', async (req, res) => {
   const dados = await obterDados()
// console.log(dados.data.name)
// console.log(dados.data.id)
   res.render('viewer');
});

// Https server for serving our html files. (WebRTC requires https)
// https.createServer(httpsOptions, app).listen(PORT, (err) => {
//     if (err) throw err;
//     console.log(`Secure server is listening on ${PORT}`);
    
//     // Ajuste: abrir a URL correta no navegador com https://localhost
//     open(`https://localhost:${PORT}`); // Corrigido de http:// para https://
// });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`The server is now running on port ${PORT}`);
    open(`http://localhost:${PORT}`);
});