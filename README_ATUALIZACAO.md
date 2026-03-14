# 🪖 C.H.D.I · 1º RCG — Atualização v2.1

## ✅ Funcionalidades Implementadas

### 🔒 Controle de Acesso (App + Web)
- Conteúdo protegido por login no app
- Soldados fazem login com número + senha
- Contexto `AppAuthContext` gerencia sessão do usuário
- Módulos com `requiresLogin` bloqueados para não-logados

### 📋 Escala de Serviço
**Backend:**
- Modelo `Schedule` com entradas por data (1 escala/dia)
- CRUD completo com proteção por admin
- Notificações automáticas ao montar/alterar/remover escala

**Admin Panel (`/admin/escala`):**
- Calendário visual interativo por mês
- Adicionar/editar/remover soldados por dia
- Seleção de patente, nome, horário e observações
- Exportar → **Excel (.xlsx)**, **PDF**, **Imagem (.png)**
- Planilha com slogan `1º RCG · C.H.D.I` bem formatada

**App/Web (`/escala`):**
- "Minha Escala" — próximas escalas do soldado logado
- "Escala Geral" — calendário com todos os escalados
- Visual diferenciado para dias onde o soldado está escalado
- Bloqueado para não-logados (redireciona para login)

### 🎖 Patentes
Patentes disponíveis: Recruta, Soldado, Cabo, Sargento, Tenente, Capitão, Major, Coronel, Comandante
- Exibidas no app, na escala e nos exports
- Cores e badges visuais por patente

### 🔔 Notificações
- Sino de notificações na Navbar (visível após login)
- Notificação automática quando soldado é escalado
- Notificação quando escala é alterada ou removida
- Contador de não-lidas com badge vermelho
- Marcar todas como lidas
- Atualização automática a cada 30s

### 📢 Conteúdos / Avisos
**Admin Panel (`/admin/conteudos`):**
- Criar/editar/remover avisos, informações, alertas
- Visibilidade: 🌐 Todos | 🔒 Logados | 👤 Específicos
- Selecionar soldados específicos para ver o conteúdo
- Fixar conteúdos no topo
- Imagem de capa (URL)
- Ativar/desativar sem deletar

**App/Web:**
- Feed de conteúdo na Home
- Conteúdo "Todos" aparece sem login
- Conteúdo "Logados/Específicos" só aparece para autenticados

## 📦 Instalação

### Backend
```bash
cd server
npm install
cp .env.example .env
# Configurar variáveis no .env
npm start
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Novas dependências (client)
```
xlsx         — exportar Excel
jspdf        — exportar PDF
html2canvas  — captura de tela
```

## 🗺 Novas Rotas

### API
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/schedule` | Admin | Listar escalas do mês |
| POST | `/api/schedule` | Admin | Criar/atualizar escala |
| DELETE | `/api/schedule/:id` | Admin | Remover escala |
| GET | `/api/schedule/mine` | AppUser | Minhas escalas |
| GET | `/api/schedule/all-active` | AppUser | Todas as escalas |
| GET | `/api/notifications` | AppUser | Minhas notificações |
| PUT | `/api/notifications/read-all` | AppUser | Marcar todas como lidas |
| GET | `/api/content` | Optional | Feed de conteúdo |
| GET | `/api/content/admin/list` | Admin | Listar todos os conteúdos |
| POST | `/api/content` | Admin | Criar conteúdo |
| PUT | `/api/content/:id` | Admin | Atualizar conteúdo |
| DELETE | `/api/content/:id` | Admin | Remover conteúdo |

### Frontend
| Rota | Descrição |
|------|-----------|
| `/app-login` | Login do soldado no app/web |
| `/escala` | Calendário de escalas (requer login) |
| `/admin/escala` | Gerenciar escalas (admin) |
| `/admin/conteudos` | Gerenciar conteúdos (admin) |
