# Recuperar o acesso ao painel

`ADMIN_SECRET` NÃO é a senha. É a chave usada para assinar os cookies de sessão.
A senha é armazenada no PostgreSQL como hash scrypt na configuração
`admin_password_hash`. Alterar o secret e fazer deploy não altera essa senha.

## Procedimento na Vercel

1. Substitua o código do repositório por esta versão, incluindo `package-lock.json`.
   Esta versão usa npm; remova o `bun.lock` antigo do repositório, caso ainda exista.
2. Em Settings → Environment Variables, mantenha `DATABASE_URL` e `ADMIN_SECRET`.
3. Adicione `ADMIN_RESET_TOKEN` no ambiente Production com um valor aleatório
   de 32 a 256 caracteres, DIFERENTE do `ADMIN_SECRET`.
   Pode gerar um código no terminal:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

4. Faça um novo deploy. Adicionar uma variável não altera um deploy já pronto.
5. Abra `/admin` → **Forgot password?**.
6. Digite o valor de `ADMIN_RESET_TOKEN`, escolha a nova senha e confirme.
7. Clique em **Save new password**, volte ao login e entre com a nova senha.
8. Remova `ADMIN_RESET_TOKEN` da Vercel e faça outro deploy.

O código funciona UMA vez. Se precisar recuperar novamente, crie outro código.
A recuperação não apaga posts, FAQs, mensagens ou configurações do site.
Todas as sessões anteriores deixam de funcionar quando a senha é trocada.
Nenhuma senha padrão, código de recuperação ou credencial real está no pacote.

## Caso apareça erro

- **Recovery is not enabled:** variável ausente, pequena demais, igual ao
  ADMIN_SECRET ou deploy feito sem ela. Confira o ambiente Production/Preview.
- **Invalid recovery code:** digite o mesmo valor configurado em ADMIN_RESET_TOKEN.
- **This recovery code has already been used:** configure outro valor e faça deploy.
- **Admin is temporarily unavailable:** confira DATABASE_URL, disponibilidade do
  PostgreSQL e migrations. Agora isso não é mais apresentado como primeiro acesso.
- Se `/admin` não tiver **Forgot password?**, o código novo ainda não está no
  domínio acessado. Confira a versão do deploy.

## Validação desta entrega

- Build de produção Next.js concluído; TypeScript sem erros.
- npm ci: arquivo de dependências validado.
- Testes de contrato dos handlers reais com banco simulado: login, setup,
  recuperação inválida/válida, código de uso único, concorrência, rollback,
  revogação de sessões, falha de banco, proteção das APIs, dashboard,
  configurações, mensagens, logs, CRUD de posts/FAQs e download do projeto.
- Os testes não acessaram seu banco, sua conta Vercel ou seu painel publicado.
  Após o deploy, confira o login e os dados no ambiente real.

## Executar os testes

```sh
npm ci
npm run typecheck
npm run test:admin
```
