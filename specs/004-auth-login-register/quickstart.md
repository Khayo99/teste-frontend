# Quickstart de validação

1. Execute `npm install` e `npm run dev`.
2. Abra `/login` e use `demo@kurio.test` / `kurio-demo`.
3. Confirme que o retorno ocorre para a rota original, recarregue a página e valide que a sessão permanece.
4. Abra `/register`, cadastre um e-mail novo e confirme autenticação imediata; repita o e-mail para validar erro de conflito.
5. Acesse diretamente `/checkout` sem sessão, autentique e confirme retorno à rota.
6. Use o botão de logout e confirme que `/profile`, `/wallets`, `/favorites` e `/orders` voltam ao login.
7. Rode `npm run typecheck`, `npm run lint`, `npm run build` e `npm run test:e2e -- e2e/auth.spec.ts`.
