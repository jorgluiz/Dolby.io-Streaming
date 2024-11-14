import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.MILLICAST_API_KEY;

if (!apiKey) {
  console.error('Erro: MILLICAST_API_KEY não encontrada no arquivo .env');
}

const options = {
  method: 'GET',
  hostname: 'api.millicast.com',
  port: null,
  path: '/api/publish_token/list?sortBy=Name&page=1&itemsOnPage=100&isDescending=false',
  headers: {
    authorization: 'Bearer ' + apiKey,
    accept: 'application/json'
  }
};

export function listTokens() {
  const req = https.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
      chunks.push(chunk);
    });

    res.on('end', function () {
      const body = Buffer.concat(chunks).toString();
      try {
        const parsedBody = JSON.parse(body);

        // Verifique se `data` está definido
        if (parsedBody.data) {
          const ids = parsedBody.data.map(item => item.id);

          // Deletar cada token individualmente
          ids.forEach(id => deleteTokens(id));
        } else {
          console.log('Nenhum dado encontrado na resposta.');
        }
      } catch (error) {
        console.error('Erro ao parsear a resposta JSON:', error.message);
      }
    });
  });

  req.on('error', function (error) {
    console.error('Erro na requisição:', error.message);
  });

  req.end();
}



export function deleteTokens(tokenId) {

  const options = {
    method: 'DELETE',
    hostname: 'api.millicast.com',
    port: null,
    path: `https://api.millicast.com/api/publish_token/${tokenId}`,
    headers: {
      authorization: 'Bearer ' + apiKey,
      accept: 'application/json'
    }
  };

  const req = https.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
      chunks.push(chunk);
    });

    res.on('end', function () {
      const body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  });

  req.end();
}

// Chamar a função para listar e deletar tokens
listTokens();


// 1 Declaração de Funções Antes do Uso:

// Você definiu deleteToken antes de chamá-la dentro de listTokens. Em JavaScript, esse
//  comportamento é possível devido ao "hoisting" (içamento), o que significa que as funções e
//   variáveis declaradas com function e var são "elevadas" ao topo do escopo.

// Como deleteToken foi declarada usando a palavra-chave function, ela é içada e pode ser
//  referenciada em qualquer lugar do escopo onde foi definida, mesmo antes da linha onde foi escrita.

// 2 Funções de Ordem Superior:

// listTokens é uma função que recebe dados de uma requisição GET e então usa esses
//  dados para chamar outra função (deleteToken), passando um argumento específico (o id de cada token).

// Essa técnica de passar uma função como argumento ou chamar uma função dentro
//  de outra é típica de funções de ordem superior, que permitem modularização e reutilização de código.

// 3 Assincronicidade e Chamadas HTTP:

// Embora não utilize async/await ou promises, a função está lidando com operações
//  assíncronas (chamadas HTTP), usando eventos (data e end) para processar dados de forma assíncrona.

// Esse tipo de implementação é comum em ambientes que não precisam de resposta imediata
//  antes de continuar, como ao iterar sobre os ids de tokens e deletá-los um por um.


// RESUMO

// Essa abordagem é baseada em:

// Funções de Ordem Superior: listTokens chama deleteToken para cada id.

// Funções com Hoisting: Definindo funções antes do uso, permitindo chamadas antecipadas.

// Tratamento Assíncrono de Requisições: Utilizando eventos para lidar com o fluxo de dados,
//  típico em operações HTTP no Node.js.

// Essa estrutura permite um código mais modular e flexível, fácil de reutilizar e adaptar.