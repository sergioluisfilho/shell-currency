# 🇵🇪 Câmbio Peru

Conversor de moedas minimalista feito para turistas brasileiros (e de outros países) que viajam ao Peru. Exibe cotações em tempo real, converte valores automaticamente com spread turístico e oferece um guia prático de como trocar dinheiro no destino.

**Acesse:** [sergioluisfilho.github.io](https://sergioluisfilho.github.io)

---

## O que o app faz

- **Cotações em tempo real** — busca as taxas de câmbio via API na primeira abertura do dia
- **Cache inteligente** — armazena os dados no `localStorage` e só atualiza quando o dia vira, sem gastar requisições desnecessárias
- **Conversor automático** — selecione a moeda e o valor; todas as outras conversões aparecem instantaneamente com spread turístico (~4%) já aplicado
- **Guia de câmbio** — orienta como trocar dinheiro no Peru dependendo da moeda que você tem, com dicas práticas e links úteis
- **Offline first** — funciona sem internet enquanto houver dados em cache
- **Acesso protegido por senha** — apenas usuários autorizados conseguem buscar cotações novas; a sessão fica salva para não precisar digitar toda vez

### Moedas suportadas

| | Moeda | Código |
|---|---|---|
| 🇧🇷 | Real brasileiro | BRL |
| 🇺🇸 | Dólar americano | USD |
| 🇪🇺 | Euro | EUR |
| 🇵🇪 | Sol peruano | PEN |

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | HTML + CSS + JavaScript puro (single file) |
| Back-end | Google Apps Script (proxy serverless) |
| API de câmbio | [ExchangeRate-API](https://exchangerate-api.com) (plano gratuito) |
| Hospedagem | GitHub Pages |
| Armazenamento | `localStorage` (cache diário de cotações + sessão) |

---

## Como replicar

### Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Google](https://google.com) (para o Apps Script)
- Chave gratuita na [ExchangeRate-API](https://app.exchangerate-api.com)

---

### 1. Obter a chave da API

1. Acesse [app.exchangerate-api.com](https://app.exchangerate-api.com)
2. Crie uma conta gratuita
3. Copie sua **API Key** no dashboard (1.500 requisições/mês gratuitas)

---

### 2. Configurar o Google Apps Script

1. Acesse [script.google.com](https://script.google.com) e clique em **Novo projeto**
2. Apague o código padrão
3. Copie o conteúdo de `gas-backend.example.js`, renomeie para `gas-backend.js` e preencha:

```js
const API_KEY    = 'sua_chave_da_exchangerate_api';
const APP_SECRET = 'sua_senha_de_acesso';
```

4. Cole o código no editor e salve (`Ctrl+S`)
5. Clique em **Implantar → Nova implantação**
6. Tipo: **App da Web**
7. Configure:
   - Executar como: `Eu`
   - Quem pode acessar: `Qualquer pessoa`
8. Clique em **Implantar** e autorize as permissões solicitadas
9. Copie a **URL do App da Web** gerada

---

### 3. Configurar o front-end

Abra o `index.html` e substitua a variável `GAS_URL`:

```js
const GAS_URL = 'https://script.google.com/macros/s/SEU_ID/exec';
```

---

### 4. Publicar no GitHub Pages

```bash
git init
git add index.html
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_USUARIO.github.io.git
git push -u origin main
```

> Para usar a URL `SEU_USUARIO.github.io`, o repositório **deve** se chamar exatamente `SEU_USUARIO.github.io`. O GitHub Pages é ativado automaticamente, sem configuração extra.

Para qualquer outro nome de repositório, ative manualmente em **Settings → Pages → Branch: main → Save**.

---

### 5. Primeiro acesso

Ao abrir o app pela primeira vez:

1. A tela de senha será exibida
2. Digite a mesma senha definida em `APP_SECRET` no Google Apps Script
3. Na primeira vez, a senha é registrada localmente — nas próximas visitas o login é automático

---

### Atualizar o app no futuro

```bash
git add index.html
git commit -m "update"
git push
```

---

## Segurança

- A senha é armazenada como hash `djb2` no `localStorage` — nunca em texto puro
- Após 5 tentativas erradas, o app bloqueia por 5 minutos
- Cada requisição ao GAS envia um token `btoa(senha + timestamp)` verificado no servidor
- A chave da API fica apenas no Google Apps Script, nunca exposta no front-end

---

## Estrutura do projeto

```
├── index.html               # App completo (front-end)
├── gas-backend.js           # Backend real (não commitar — contém credenciais)
├── gas-backend.example.js   # Template sem credenciais (seguro para commitar)
└── README.md
```

> **Atenção:** nunca suba o `gas-backend.js` para um repositório público. Adicione-o ao `.gitignore`.

```bash
echo "gas-backend.js" >> .gitignore
```
