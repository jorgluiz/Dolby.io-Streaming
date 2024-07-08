require('dotenv').config();
const https = require("https");
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const open = require("open");
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

let publisherData = {};  // Adiciona uma variável global para armazenar dados do publisher

const apiKey = process.env.API_KEY;
const port = '8084';
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

// Define as opções para o servidor HTTPS, especificando a chave privada e o certificado SSL.
// const httpsOptions = {
//     key: fs.readFileSync(path.resolve(__dirname, './certs', 'server.key')),
//     cert: fs.readFileSync(path.resolve(__dirname, './certs', 'server.cert'))
// };

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

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
    console.log(params);

    switch (params.endpoint) {
        case 'createToken':
            createToken(req.body)
                .then((data) => {
                    const parsedData = JSON.parse(data);
                    publisherData = parsedData;  // Armazena os dados do publisher
                    res.json(parsedData);  // Envia a resposta como JSON
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

app.get('/viewer', (req, res) => {
    res.render('viewer', {
        streamAccountId: publisherData.data.id,
        streamName: publisherData.data.label,
        streamToken: publisherData.data.token
    });
});

// Https server for serving our html files. (WebRTC requires https)
// https.createServer(httpsOptions, app).listen(port, (err) => {
//     if (err) throw err;
//     console.log(`Secure server is listening on ${port}`);
    
//     // Ajuste: abrir a URL correta no navegador com https://localhost
//     open(`https://localhost:${port}`); // Corrigido de http:// para https://
// });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`The server is now running on port ${PORT}`);
    open(`http://localhost:${PORT}`);
});
