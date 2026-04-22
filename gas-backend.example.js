// ═══════════════════════════════════════════════════════════
//  CÂMBIO PERU — Google Apps Script Backend (EXEMPLO)
//
//  Como usar:
//  1. Acesse https://script.google.com e crie um novo projeto
//  2. Apague o código padrão e cole o conteúdo de gas-backend.js
//     (a versão real, não este arquivo de exemplo)
//  3. Preencha as constantes abaixo com seus valores reais
//  4. Salve e implante como Web App
// ═══════════════════════════════════════════════════════════

// ── CONFIGURAÇÕES ─────────────────────────────────────────

// Sua chave da ExchangeRate-API
// Como obter:
//   1. Acesse https://app.exchangerate-api.com
//   2. Crie uma conta gratuita (1.500 requisições/mês)
//   3. Após o cadastro, sua chave aparece no dashboard
//   4. Formato: string de ~24 caracteres alfanuméricos
const API_KEY = 'SUA_CHAVE_AQUI';

// Senha de acesso ao app
// Como definir:
//   - Escolha qualquer senha que você queira usar no app
//   - Deve ser a mesma senha que você digita na tela de login do HTML
//   - Exemplo de formato: letras + números, mínimo 6 caracteres
const APP_SECRET = 'SUA_SENHA_AQUI';

// URL base da ExchangeRate-API — não altere
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

// Moedas que serão buscadas — adicione ou remova conforme necessário
// Códigos ISO 4217: https://en.wikipedia.org/wiki/ISO_4217
const CURRENCIES = ['BRL', 'USD', 'EUR', 'PEN'];

// ─────────────────────────────────────────────────────────


// ── NÃO ALTERE O CÓDIGO ABAIXO ────────────────────────────

// Algoritmo de hash djb2 — deve ser idêntico ao do front-end
function simpleHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

// Serializa a resposta como JSON
function output(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Responde requisições OPTIONS (preflight do browser)
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Ponto de entrada principal — chamado pelo front-end via GET
function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const token  = params.token || '';

  // Verifica se o token enviado pelo front-end é válido
  // O front-end envia: btoa(senha + ':' + timestamp)
  // Aqui decodificamos e comparamos o hash da senha
  let authorized = false;
  try {
    const decoded  = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    const sentPass = decoded.split(':')[0];
    authorized     = simpleHash(sentPass) === simpleHash(APP_SECRET);
  } catch (err) {
    authorized = false;
  }

  if (!authorized) {
    return output({ error: 'Não autorizado' });
  }

  // Cache interno do Google Apps Script (evita chamar a API a cada request)
  // Expira em 1 hora — após isso, busca dados frescos
  const cache    = CacheService.getScriptCache();
  const cacheKey = 'rates_usd_v1';
  const cached   = cache.get(cacheKey);

  if (cached) {
    return output({ rates: JSON.parse(cached), source: 'cache' });
  }

  // Chama a ExchangeRate-API com a chave configurada acima
  let response;
  try {
    response = UrlFetchApp.fetch(`${BASE_URL}/${API_KEY}/latest/USD`, {
      muteHttpExceptions: true
    });
  } catch (err) {
    return output({ error: 'Falha de rede: ' + err.toString() });
  }

  if (response.getResponseCode() !== 200) {
    return output({ error: 'API retornou ' + response.getResponseCode() });
  }

  let data;
  try {
    data = JSON.parse(response.getContentText());
  } catch (err) {
    return output({ error: 'Resposta inválida da API' });
  }

  if (data.result !== 'success') {
    return output({ error: data['error-type'] || 'Erro na API' });
  }

  // Filtra apenas as moedas listadas em CURRENCIES
  const all      = data.conversion_rates;
  const filtered = {};
  CURRENCIES.forEach(c => { if (all[c] !== undefined) filtered[c] = all[c]; });

  // Salva no cache por 1 hora (3600 segundos)
  cache.put(cacheKey, JSON.stringify(filtered), 3600);

  return output({ rates: filtered, source: 'api' });
}
