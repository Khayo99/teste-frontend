# Quickstart: Detalhes do NFT

Instale dependências com `npm install`, inicie com mocks via `npm run dev`, depois abra o catálogo e
clique em um card para chegar em `/nft/:id`.

1. Confirme que o header e o footer aparecem tanto na Home quanto na tela de detalhe (layout global).
2. Confirme galeria, preço/avaliação, descrição, badge de edição, metadados, rede/contrato/direitos
   autorais e carrossel "Mais desta coleção" conferem com os frames desktop e mobile do Figma.
3. Ajuste a quantidade e confirme que ela nunca excede a disponibilidade da edição; com disponibilidade
   zero, confirme que quantidade e "Comprar" ficam desabilitados com rótulo de indisponibilidade.
4. Sem sessão autenticada, clique em "Favoritar" e confirme o redirecionamento para `/login` com
   retorno à mesma tela de detalhe após autenticar; repita autenticado e confirme a persistência do
   estado de favorito ao recarregar a rota.
5. Clique em "Comprar" autenticado e confirme a navegação para `/checkout` com o NFT e a quantidade
   selecionados.
6. Alterne entre as abas "Detalhes" e "Avaliações" e confirme que o conteúdo e a contagem de
   avaliações correspondem ao payload mockado.
7. Navegue para um identificador de NFT inexistente e confirme o estado "não encontrado" com link de
   volta ao catálogo, preservando header/footer.
8. Rode `npm run typecheck`, `npm run lint`, `npm run build` e `npm run test:e2e`.
