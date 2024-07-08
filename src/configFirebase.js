// Importar o Firebase Admin SDK
var admin = require("firebase-admin");
require('dotenv').config();

var serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Inicializar o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://usuariostripe-default-rtdb.firebaseio.com/'
});

// Função para salvar dados no Realtime Database
function salvarDadosNoDatabase(dados) {
  // Obter uma referência para o Realtime Database
  var database = admin.database();

  // Salvar os dados em uma referência específica
  const ref = database.ref("restricted_access/secret_document");
  ref.set(dados, (error) => {
    if (error) {
      console.error('Erro ao salvar dados:', error);
    } else {
      console.log('Dados salvos com sucesso!');
    }
  });
}

function obterDados() {
  return new Promise((resolve, reject) => {
    // Obter uma referência para o banco de dados
    var database = admin.database();

    async function getRestrictedAccessData() {
      try {
        const snapshot = await database.ref('/restricted_access/secret_document').once('value');
        const data = snapshot.val();
        resolve(data)
      } catch (error) {
        console.error('Erro ao obter dados:', error);
      }
    }
    getRestrictedAccessData()
  })
}

module.exports = {
  salvarDadosNoDatabase,
  obterDados
};