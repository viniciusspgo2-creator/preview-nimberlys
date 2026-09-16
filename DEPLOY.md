# 🚀 Deploy na Vercel — Nimberly's Daycare

Guia completo, passo a passo. Tempo estimado: **15–20 minutos**.

---

## O que já está pronto no código

| Item | Status |
|---|---|
| Banco de dados | ✅ **PostgreSQL** via Prisma (`env("DATABASE_URL")`) — nada de SQLite |
| `postinstall: prisma generate` | ✅ Client gerado automaticamente a cada deploy |
| `build: prisma generate && next build` | ✅ Padrão Vercel |
| Senha do admin | ✅ **Criada no primeiro acesso** (`/admin` → setup) — hash scrypt, sem senha padrão |
| Chave do Gemini (chat) | ✅ Funciona via painel admin **ou** env var `GEMINI_API_KEY` |
| Sessão admin | ✅ Cookie httpOnly assinado com HMAC (12h) — usa `ADMIN_SECRET` |
| Fallback do chat | ✅ Se o Gemini falhar, responde com texto amigável (nunca quebra) |

---

## Passo 1 — Criar o banco PostgreSQL (grátis)

Escolha **uma** opção (recomendado: **Neon**, integração nativa com a Vercel):

**Opção A — Neon (recomendado)**
1. Acesse <https://neon.com> → Sign up (pode usar a conta Google).
2. Crie um projeto: nome `nimberlys-daycare`, região `US East (Ohio)` ou `US West` (perto da Califórnia).
3. Copie a **Connection string** (pooled) — parece com:
   ```
   postgresql://usuario:senha@ep-xxxx-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

**Opção B — Vercel Postgres**
1. Na Vercel: aba **Storage** → **Create Database** → **Postgres (Neon)**.
2. Copie a `DATABASE_URL` no painel.

---

## Passo 2 — Popular o banco (uma única vez, do seu computador)

No terminal, na raiz do projeto:

```bash
# 1. aplica o schema
DATABASE_URL="cole_a_connection_string_aqui" bunx prisma db push

# 2. semeia posts de blog, FAQs e configurações
DATABASE_URL="cole_a_connection_string_aqui" bun run db:seed
```

> 💡 O seed **não cria senha de admin** — a senha é criada por você no navegador no primeiro acesso (Passo 5).

---

## Passo 3 — Subir o projeto para a Vercel

1. Coloque o projeto num repositório GitHub.
2. Na Vercel: **Add New → Project** → importe o repositório.
3. Framework preset: **Next.js** (detectado automaticamente). Não mude build/start.
4. Antes de clicar em Deploy, abra **Environment Variables** e adicione:

| Nome | Valor | Obrigatória? |
|---|---|---|
| `DATABASE_URL` | a connection string do Passo 1 | ✅ Sim |
| `ADMIN_SECRET` | uma string aleatória longa — gere com `openssl rand -hex 32` | ✅ Sim |
| `GEMINI_API_KEY` | chave do <https://aistudio.google.com/apikey> (grátis) | Recomendada |
| `GEMINI_MODEL` | opcional (padrão: `gemini-2.5-flash`) | Não |

5. Clique em **Deploy** e aguarde (~2 min).

---

## Passo 4 — Domínio (opcional)

Vercel → Project → **Settings → Domains** → adicione o domínio e siga as instruções de DNS.

---

## Passo 5 — Primeiro acesso ao painel (criar a senha)

1. Abra `https://seu-dominio.vercel.app/admin`
2. A tela **"Create your admin password"** aparece — crie uma senha forte (mín. 8 caracteres).
3. Pronto: você já entra no dashboard. A senha fica salva com **hash scrypt** no banco.
   - Para trocar depois: **Settings → Security → Update password**.

> 🔒 Segurança: a tela de setup só existe enquanto nenhuma senha foi criada.
> Depois disso, qualquer tentativa de setup retorna 403.

---

## Checklist pós-deploy

- [ ] Site abre (`/`, `/about`, `/blog`, `/faq`, `/contact`)
- [ ] `/admin` mostra a tela de criação de senha → criar senha
- [ ] Dashboard mostra estatísticas
- [ ] Chatbot responde (ícone rosa no canto inferior direito)
- [ ] Formulário de contato envia mensagem (aparece em **Admin → Messages**)
- [ ] Sitemap: `https://seu-dominio/sitemap.xml`
- [ ] Google Search Console: cole o código de verificação em **Admin → Settings → SEO** (`gsc_verification`)

---

## Desenvolvimento local (este sandbox)

```bash
bun run db:up        # sobe PostgreSQL embutido (porta 5432) — já está rodando
bun run dev          # site em http://localhost:3000
bun run db:push      # aplica mudanças de schema
bun run db:seed      # re-semeia conteúdo
```

O `src/lib/db.ts` resolve a conexão automaticamente: usa `DATABASE_URL` quando for
PostgreSQL (Vercel/Neon) e cai para o Postgres local no desenvolvimento.

## Migração de dados legados

`scripts/migrate-sqlite-data.ts` copiou todo o conteúdo do banco SQLite antigo
(posts, FAQs, settings, mensagens, visualizações, logs do chat) para o PostgreSQL.
O arquivo `db/custom.db` é mantido apenas como arquivo morto — pode ser arquivado.
