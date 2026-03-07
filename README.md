# C.H.D.I Web — Sistema Completo

> Centro de Hinos e Danças Institucionais — Plataforma Web  
> Stack: Node.js · Express · MongoDB · Cloudinary · React · Vite

---

## Pré-requisitos

- Node.js 18+
- MongoDB (local ou Atlas)
- Conta Cloudinary

---

## Instalação

### 1. Clone e instale dependências

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure o Backend

```bash
cd server
cp .env.example .env
```

Edite `.env` com suas credenciais:

| Variável | Descrição |
|----------|-----------|
| `MONGODB_URI` | URI do MongoDB (ex: `mongodb://localhost:27017/chdi`) |
| `JWT_SECRET` | Chave secreta JWT (mín. 64 caracteres aleatórios) |
| `JWT_REFRESH_SECRET` | Chave refresh JWT (mín. 64 caracteres aleatórios) |
| `CLOUDINARY_CLOUD_NAME` | Nome do cloud no Cloudinary |
| `CLOUDINARY_API_KEY` | API Key do Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret do Cloudinary |
| `ADMIN_SECRET` | Chave secreta para criar contas admin |
| `CLIENT_URL` | URL do frontend (ex: `http://localhost:5173`) |

### 3. Inicie o Backend

```bash
cd server
npm run dev       # desenvolvimento
npm start         # produção
```

### 4. Inicie o Frontend

```bash
cd client
npm run dev       # desenvolvimento (http://localhost:5173)
npm run build     # build de produção
```

---

## Estrutura do Projeto

```
chdi-web/
├── server/
│   ├── config/
│   │   ├── db.js             ← Conexão MongoDB
│   │   └── cloudinary.js     ← Configuração Cloudinary + Multer
│   ├── models/
│   │   ├── User.js           ← Modelo de usuário (bcrypt, lockout)
│   │   ├── Category.js       ← Módulos/categorias
│   │   └── Song.js           ← Músicas + letras sincronizadas
│   ├── middleware/
│   │   └── auth.js           ← JWT protect + restrictTo
│   ├── controllers/
│   │   ├── authController.js ← Register, login, refresh, logout
│   │   ├── categoryController.js
│   │   └── songController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── categories.js
│   │   └── songs.js
│   ├── utils/
│   │   └── jwt.js            ← Access + Refresh token utils
│   └── server.js             ← Entry point Express
└── client/
    └── src/
        ├── pages/
        │   ├── Home.jsx      ← Módulos (igual ao app Android)
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Player.jsx    ← Player de áudio + letra sincronizada
        │   └── admin/
        │       ├── AdminLayout.jsx
        │       ├── Dashboard.jsx
        │       ├── AdminCategories.jsx  ← CRUD categorias + ícones
        │       └── AdminSongs.jsx       ← Upload áudio Cloudinary + letras
        └── components/
            ├── Icons.jsx     ← 15 ícones militares SVG
            ├── Navbar.jsx
            └── Toast.jsx
```

---

## Segurança implementada

| Medida | Detalhe |
|--------|---------|
| Senhas | bcrypt com 14 rounds |
| JWT | Access Token 15min + Refresh Token 7 dias (httpOnly cookie) |
| Bloqueio de conta | 5 tentativas → bloqueio 15 minutos |
| Rate limiting | 10 req/15min em auth, 5 registros/hora |
| Headers HTTP | Helmet.js (CSP, HSTS, etc.) |
| MongoDB Injection | express-mongo-sanitize |
| HTTP Param Pollution | hpp |
| CORS | Configurado para origem específica |
| Input validation | express-validator em todas as rotas sensíveis |
| Tokens invalidados | Refresh tokens armazenados e validados no banco |

---

## Como criar conta Admin

No cadastro, informe a chave definida em `ADMIN_SECRET` no campo "Chave de administrador".

---

## Como adicionar uma música (painel admin)

1. Acesse `/admin/musicas`
2. Clique em **+ Adicionar Música**
3. Aba **Informações**: preencha título, categoria
4. Aba **Áudio**: faça upload do arquivo MP3/WAV
5. Aba **Letra Sync**: adicione cada linha com o tempo em segundos

---

## Ícones disponíveis

`music-note`, `military-star`, `trumpet`, `soldier-march`, `shield`, `anchor`, `laurel`, `drum`, `bugle`, `medal`, `flag`, `sword`, `eagle`, `crown`, `salute`

---

**C.H.D.I v2.0 — by SAYOZ**
