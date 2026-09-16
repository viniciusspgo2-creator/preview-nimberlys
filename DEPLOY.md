# 🚀 Deploy na Vercel — Nimberly's Daycare

Guia completo em linguagem simples. Tempo estimado: **10–15 minutos**.

> ✨ **Novidade:** o build da Vercel agora faz TUDO sozinho — cria as tabelas no banco,
> popula blog/FAQs/configurações e compila o site. Sem `db push` manual, sem seed manual.

---

## O que o build da Vercel faz automaticamente

```
prisma generate          → gera o cliente do banco
node prisma/baseline.mjs → protege bancos antigos (sem perder dados)
prisma migrate deploy    → cria/atualiza as tabelas (migrations reais)
npx tsx prisma/seed.ts   → popula blog, FAQs e configurações (só o que falta)
next build               → compila o site
```

O seed é **não-destrutivo**: cria apenas o que não existe. Seus posts editados
no painel e sua senha **nunca** são sobrescritos por um novo deploy.

---

## Passo 1 — Criar o banco PostgreSQL (grátis)

**Neon (recomendado):**
1. <https://neon.com> → Sign up → New Project: `nimberlys-daycare`, região `US East` ou `US West`.
2. Copie a **Connection string (POOLED)** e adicione `&pgbouncer=true` no final.
3. Fica assim:
   ```
   postgresql://usuario:senha@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
   ```

**Ou Vercel Postgres:** Vercel → **Storage** → **Create Database** → Postgres.

## Passo 2 — Variáveis de ambiente na Vercel

Vercel → seu projeto → **Settings → Environment Variables** → adicione:

| Nome | Obrigatória | Valor / onde conseguir |
|---|---|---|
| `DATABASE_URL` | ✅ | String do Neon/Vercel Postgres (Passo 1) |
| `ADMIN_SECRET` | ✅ | String aleatória gerada por você (comando abaixo) |
| `GEMINI_API_KEY` | Recomendada | <https://aistudio.google.com/apikey> → "Create API key" (sem restrição de site) |
| `NEXT_PUBLIC_SITE_URL` | Opcional | URL final do site, ex. `https://www.seudominio.com` |
| `GEMINI_MODEL` | Opcional | Deixe vazio (padrão: `gemini-flash-latest`) |

> ⚠️ Marque as mesmas variáveis para **Production E Preview** (a caixinha de ambiente
> na Vercel permite selecionar os dois — selecione os dois).

**Gerar o ADMIN_SECRET:**
- **Windows (PowerShell):**
  ```powershell
  -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
  ```
- **Mac/Linux:** `openssl rand -hex 32`
- Copie o resultado e cole como valor de `ADMIN_SECRET`.

## Passo 3 — Deploy

1. Suba o projeto para um repositório GitHub (`git init`, `git add .`, `git push`).
   O `.gitignore` já protege `.env`, banco local e segredos.
2. Vercel → **Add New → Project** → importe o repositório → **Deploy**.
3. Aguarde ~3 min. O build cria as tabelas e popula o conteúdo sozinho.

## Passo 4 — Primeiro acesso ao painel

1. Abra `https://seu-site.vercel.app/admin`
2. Crie sua senha (mín. 8 caracteres) — ela é salva com hash seguro no banco.
3. Para testar o chatbot: **Admin → Settings → Chatbot → "Test connection"**.
4. O botão **"Download project"** (canto inferior esquerdo do painel) baixa o ZIP
   atualizado do site — use-o para pegar o código mais recente a cada rodada de
   ajustes. Ele só existe dentro do painel (visitantes não veem).

---

## 🩺 Por que o blog aparecia vazio (e como foi resolvido)

O banco usado no primeiro deploy nunca recebeu os artigos (o seed era um passo manual).
Agora o **próprio build popula o banco** a cada deploy. Basta fazer o próximo deploy
(com as variáveis corretas) e o blog/FAQs aparecem — nenhuma ação manual.

## 🩺 Chatbot: "Model not found for this key"?

Chaves novas do Google AI Studio geralmente só têm os modelos **Gemini 3 ou mais novos**
(o `gemini-2.5-flash` antigo não existe mais para elas). O site já usa o alias
`gemini-flash-latest` como padrão, que funciona nessas chaves. Para ver a lista exata
dos modelos que a SUA chave aceita:

1. **Admin → Settings → Chatbot**
2. Cole/tenha a chave salva e clique em **"Load models for this key"** — o Google
   responde com a lista exata (aparece agrupada no topo do seletor de modelo).
3. Escolha um modelo do grupo verde e **salve**.
4. Use **"Test connection"** para confirmar. Se der erro 404, a mensagem agora mostra
   os modelos disponíveis para a sua chave.

E se qualquer modelo falhar em produção, o chatbot tenta automaticamente o
`gemini-flash-latest` antes de usar o assistente reserva — o Sunny nunca fica mudo.

---

## Desenvolvimento local (sandbox)

```bash
bun run db:up     # PostgreSQL local (porta 5432)
bun run dev       # site em http://localhost:3000
bun run build     # build de produção completo (idêntico ao da Vercel)
bun run db:seed   # re-semeia conteúdo que falta
```

## Estrutura das migrations

```
prisma/migrations/
├── migration_lock.toml          → provedor (postgresql)
└── 20260915220000_init/
    └── migration.sql            → cria as 6 tabelas + índices
```

Models cobertos: `Post`, `Faq`, `Setting`, `ContactMessage`, `PageView`, `ChatLog`.
(Não existe tabela `Account`/`User` — a autenticação do admin é própria, via cookie
assinado + senha com hash scrypt, então não há models do NextAuth.)
