# Fotos e galeria — atualização do painel

## Publicar esta versão

1. Substitua os arquivos do repositório pelos arquivos deste ZIP, incluindo `src`, `prisma`, `tests`, `package.json` e `package-lock.json`.
2. Faça o deploy na Vercel com o comando padrão `npm run build`. Ele aplica automaticamente a nova migração `20261007130000_site_photos` e cria a tabela `SitePhoto` no banco existente.
3. Mantenha a mesma `DATABASE_URL` e os secrets já configurados. Não é necessário criar outro banco nem redefinir a senha.
4. Após o deploy, entre no painel e abra **Photos & gallery**.

Não use somente `next build` como comando de deploy: isso não executa as migrações. O script de baseline foi ajustado para reconhecer apenas a migração original, sem ignorar a nova tabela.

## Uso pela cliente

- **Add photos:** selecione até 20 fotos de uma vez no celular ou computador.
- Confira as prévias; adicione uma legenda opcional e remova seleções indesejadas.
- **Publish photos:** publica as selecionadas. A tela mostra o progresso. Se uma falhar, somente ela fica na seleção para tentar novamente; as fotos publicadas não são reenviadas.
- As fotos novas aparecem primeiro. A página completa mostra todas e a página inicial mostra as primeiras nove.
- **Move to first:** coloca uma foto no início da galeria.
- **Replace photo:** substitui a imagem onde ela já é usada no site, mantendo sua posição e presença na galeria.
- **Remove from gallery:** retira da galeria sem apagar o arquivo nem quebrar outras páginas. Pode ser adicionada novamente em **Other website photos → Add to gallery**.
- **Other website photos:** fotos fora da galeria, incluindo imagens usadas em outras seções e logotipos. As fotos compartilhadas entre seções são substituídas em todos os componentes visuais que usam a mesma imagem.
- As legendas aparecem no site em inglês conforme digitadas; não há tradução automática das legendas enviadas pela cliente.

## Armazenamento e limites

Os uploads são guardados em PostgreSQL (tabela `SitePhoto`), e não no disco temporário da Vercel. Eles sobrevivem aos próximos deploys, desde que seja mantido o banco. Inclua essa tabela nos backups; o ZIP do código não inclui o conteúdo do banco.

Aceita JPG, PNG e WebP de até 20 MB na seleção. O navegador reduz para até 1800 pixels antes do envio; o servidor verifica a imagem e a converte para WebP, removendo metadados e limitando o resultado a 1,5 MB. HEIC precisa ser exportado como JPG. A galeria usa miniaturas enquadradas e a visualização ampliada mostra a imagem inteira.

O armazenamento das fotos conta na cota do provedor PostgreSQL. Para acervos muito grandes, uma futura migração para armazenamento de objetos pode ser conveniente. Remover da galeria não libera espaço, pois preserva a imagem usada em outras seções.

## Validação

- `npm run typecheck`
- `npm run test:admin`: autenticação, upload, conversão real com Sharp, substituição, remoção/restauração, ordenação e validações de arquivo, com banco simulado.
- `npm run test:photos-ui`: seleção múltipla, sucesso parcial, tentativa somente de falhas e restauração, em DOM simulado.
- Compilação de produção com `next build`.

A migração e os uploads ainda devem ser verificados no banco real após o deploy. Não foram realizadas alterações no site publicado nesta entrega.
