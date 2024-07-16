// Importar o Firebase Admin SDK
import admin from "firebase-admin"
import dotenv from 'dotenv'
dotenv.config();

var serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Inicializar o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://usuariostripe-default-rtdb.firebaseio.com/'
});

// Função para salvar dados no Realtime Database
export function salvarDadosNoDatabase(dados) {
  console.log(dados, "salvar aqui")
  // Obter uma referência para o Realtime Database
  var database = admin.database();

  // Salvar os dados em uma referência específica
  const ref = database.ref(`restricted_access/secret_document`);
  ref.push(dados, (error) => {
    if (error) {
      console.error('Erro ao salvar dados:', error);
    } else {
      console.log('Dados salvos com sucesso!');
    }
  });
}

export function obterDados() {
  return new Promise((resolve, reject) => {
    // Obter uma referência para o banco de dados
    var database = admin.database();

    async function getRestrictedAccessData() {
      try {
        const snapshot = await database.ref('/restricted_access/secret_document').once('value');
        const data = snapshot.val();
        const values = Object.values(data); // Extrair apenas os valores
        resolve(values)
      } catch (error) {
        console.error('Erro ao obter dados:', error);
      }
    }
    getRestrictedAccessData()
  })
}

// module.exports = {
//   salvarDadosNoDatabase,
//   obterDados
// };

// export default {salvarDadosNoDatabase, obterDados}
