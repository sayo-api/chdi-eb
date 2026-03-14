# 🔔 Configuração de Notificações Push

## Web Push (Navegador) — ZERO configuração extra

Já está tudo pronto. Adicione ao `server/.env`:
```env
VAPID_PUBLIC_KEY=BCdmqhhwQxwe00WVIPG4vXv6RYl6SGcvkJsyTGSF2w_8nTtg9AalntEjKNKBGzQ3o49MULo-iHeAoNaIz9dxZps
VAPID_PRIVATE_KEY=C4QV224fti0dbQIN9YVqgLgicqtDJgh7xtmC8u2cylE
VAPID_EMAIL=seuemail@gmail.com
```

---

## FCM V1 (Android App) — Firebase Console

### Passo 1 — Baixar o google-services.json
1. console.firebase.google.com → seu projeto **chdi-app**
2. Engrenagem ⚙️ → Configurações do projeto → aba **Geral**
3. Em "Seus apps" → app Android `com.chdi.app` → **Baixar google-services.json**
4. Coloque o arquivo em `app/google-services.json`

### Passo 2 — Conta de Serviço (substitui a antiga Server Key)
> A API legada foi desativada pelo Google. O projeto já usa a API V1.

1. Engrenagem ⚙️ → **Configurações do projeto** → aba **Contas de serviço**
2. Clique em **Gerar nova chave privada** → confirme → baixa um arquivo `.json`
3. Abra o arquivo, copie o conteúdo **inteiro**

### Passo 3 — Configurar no servidor

**Opção A** — JSON direto no .env (mais simples):
```env
FCM_PROJECT_ID=chdi-app
FCM_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"chdi-app","private_key_id":"abc...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxx@chdi-app.iam.gserviceaccount.com",...}
```

**Opção B** — Arquivo no servidor (mais seguro):
```env
FCM_PROJECT_ID=chdi-app
FCM_SERVICE_ACCOUNT_PATH=/etc/chdi/service-account.json
```

### Onde achar o FCM_PROJECT_ID
Engrenagem ⚙️ → Configurações do projeto → aba **Geral** → campo **ID do projeto**

---

## Resumo dos eventos que disparam push

| Evento | Web (navegador) | App Android |
|---|---|---|
| Adicionado à escala | ✅ | ✅ |
| Escala alterada | ✅ | ✅ |
| Removido da escala | ✅ | ✅ |
| Novo aviso publicado | ✅ | ✅ |
