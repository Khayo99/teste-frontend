# Validação da entrega — 03/10/2026

**Conclusão: ainda não aprovado para entrega.** A implementação atende parte do desafio, mas existem requisitos funcionais e evidências obrigatórias pendentes. Esta avaliação usa o enunciado original fornecido pelo usuário, não alterações posteriores dos requisitos em arquivos locais.

## Escopo e limites das evidências

Foram lidos os contratos, componentes, stores, handlers MSW, integração Socket.IO, testes e configurações. Foram executados TypeScript, lint, build, uma suite completa e verificações adicionais em navegador. Não foram alteradas funcionalidades nesta auditoria; foram produzidos README, arquitetura e este relatório.

O checkout sofreu alterações concorrentes durante o trabalho: iniciou em `ec60ae169af84479ddfdf445ca98efbaca3a4688` e a última conferência estava em `e2983ad6590f991fdcd9e71287102b7b16d01b29`, com documentação em edição. Resultados da primeira suite não certificam o commit posterior. A reexecução ampla em cópia temporária foi interrompida e descartada como certificação, pois o symlink de dependências inicialmente impediu servir fontes. Os dois testes diagnósticos seguintes usaram permissão de arquivos corrigida e contextos limpos, sem a fixture destrutiva da suite.

Ambiente observado: macOS/arm64, Node 24.14.1, npm 11.11.0. Não foi feita instalação nova com `npm ci`; foi usado `node_modules` existente. Não houve auditoria Lighthouse completa nesta revisão. O Figma negou acesso à ferramenta por falta de permissão de edição. A URL pública não foi fornecida/encontrada na documentação examinada.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | Aprovado, inclusive na conferência final |
| `npm run build` | Aprovado, inclusive na conferência final; aviso de import dinâmico ineficaz de `auth-page.tsx` |
| `npm run lint` | Reprovado: 2 erros em `e2e/support/fixtures.ts:68,71`; 8 warnings de Fast Refresh no router na conferência final |
| `git diff --check` | Sem erros na conferência |
| Suite inicial: `npm run test:e2e -- --workers=2` | 78 casos: **28 passaram, 49 falharam, 1 ignorado**, duração 8,4 min; houve alterações concorrentes |
| Perfil salvo → refresh, sem fixture destrutiva | Aprovado em diagnóstico separado |
| Sessão avançada para data expirada | `GET /auth/session` retornou 401, mas `GET /profile` retornou **200** usando a mesma sessão |
| Visitante e socket | `realtimeClient.connected === false` |
| Pedido pendente → desconectar → confirmar no mock → reconectar | Reprovado: modal de confirmação não apareceu após 8 s; tela permaneceu pendente |
| Chromium mobile | Não atendido pela configuração atual: trace confirmou **WebKit**, embora o projeto se chame `chromium-mobile` |

O Playwright produz HTML/traces conforme configurado, mas outras execuções concorrentes podem substituir `playwright-report` e `test-results`. Não associe um relatório posterior automaticamente aos números acima. Não foi calculada nota sobre 100; isso dependeria também de Figma, deploy e medições ausentes.

## Achados prioritários

### P1 — Sessão expirada continua autorizando operações privadas

`src/mocks/handlers.ts:324` resolve `activeUser` sem conferir `expiresAt`. A expiração é verificada apenas na consulta de sessão; `src/main.tsx` faz essa consulta na inicialização e não há interceptação global de 401 para retomada de checkout. Após reload, o mock também pode recriar sessão vencida a partir do token. Requisito afetado: conta/sessão e expiração durante compra.

Correção necessária: validar validade/revogação em todo endpoint privado, persistir a sessão simulada corretamente e preservar rascunho/destino ao pedir nova autenticação.

### P1 — Carrinho não usa os recursos REST exigidos nem isola identidades

`src/features/cart/cart-store.ts` inicia fixtures e executa inclusões, quantidades e remoções diretamente no Zustand. `cart-api.ts` implementa apenas cotação e cupom. A chave única `kurio.cart.v2` permanece ao sair/trocar de usuário. Não há consulta/mutations de carrinho via REST ou merge explícito visitante → usuário.

Isso viola os requisitos de contratos mínimos, mocks na camada de rede e isolamento. É também um risco para o critério eliminatório de exposição de estado entre usuários; não está sendo afirmado vazamento de todos os outros recursos, que possuem chaves privadas.

### P1 — Recuperação de pedidos e tempo real incompletos

`src/lib/realtime.ts:87` identifica a sessão apenas no primeiro `connect`; o mock depende dessa identificação para os eventos privados. Visitantes não conectam. A reconciliação de `connect` não invalida detalhe. O mock retém sockets desconectados.

No checkout, o efeito de recuperação retorna quando `recoveredOrderId` já foi preenchido, deixando de aplicar novas respostas REST ao pedido local. O diagnóstico confirmou que uma confirmação perdida durante desconexão não abre o recibo após reconexão. Timers de confirmação de pendências também se perdem no reload. Requisito afetado: cenário obrigatório de interrupção com pedido pendente, atualização de catálogo/detalhe/carrinho e ciclo de vida dos listeners.

### P1 — Carteira secundária é apenas visual

Em `src/features/account/account-page.tsx:530`, os botões “Igual à carteira principal” e “Adicionar” não têm handlers. O checkout ainda cria dados de carteira fictícios na própria UI quando não existe carteira cadastrada. É necessário concluir cadastro/edição/seleção da secundária e usar as carteiras da API.

### P1 — Suite de testes não valida corretamente os fluxos exigidos

`e2e/support/fixtures.ts:58` registra `localStorage.clear()` e `sessionStorage.clear()` em `addInitScript`, executado a cada documento. Cada `page.goto`/reload apaga a sessão, o carrinho e os registros persistidos. A aprovação do diagnóstico isolado de perfil comprova por que essas falhas não devem ser confundidas automaticamente com defeito da persistência da aplicação.

Outros problemas: configurações de mock em memória são perdidas em navegações completas; o teste de evento antigo usa pedido inexistente e não demonstra não regressão de pedido real; falta comprovação de troca de usuário, expiração, recusa, retomada real e estoque por edição. O projeto mobile herda WebKit do dispositivo iPhone 13; deve declarar Chromium explicitamente para atender ao enunciado.

### P1 — Evidências de entrega incompletas

Na última conferência há configuração/script Lighthouse, mas não o conjunto de 12 relatórios HTML/JSON e medianas. A URL pública e os testes de deep link/refresh no deploy não estão comprovados. Existem baselines de início e detalhe, mas faltam carrinho/pagamento e separação desktop/mobile: `snapshotPathTemplate` não contém o projeto. Não é possível aprovar visualmente sem comparação com Figma.

### P2 — Paginação não faz parte do contrato REST

`src/features/catalog/api/catalog-api.ts` não envia página/tamanho; `home-catalog.tsx` fatia o resultado com `slice`. A URL conserva página, busca e filtros, mas a API não executa a paginação solicitada no recurso mínimo.

### P2 — Estoque, cotação, idempotência e precisão precisam de reforço

Em `src/mocks/handlers.ts`, estoque é global por NFT; `editionId` não define disponibilidade própria. A criação de pedido compara apenas o total da cotação enviada e armazena esse objeto como recibo; precisa validar/reconstruir o snapshot completo e rejeitar quantidade fracionária/edição inválida/cupom inválido. O fingerprint de idempotência ignora `quote`.

`checkout-page.tsx` converte ETH em `Number` e multiplica valores em ponto flutuante, contrariando a exigência de precisão nos cálculos/apresentação. Há referência de carteira fixa no recibo. A consulta individual de pedido após reload depende de o mapa em memória já ter sido restaurado por outro endpoint.

### P2 — Cenários não cobrem integralmente o enunciado

Existe uma única fixture de usuário. `variable-latency` usa atraso fixo de 300 ms. `order-timeout` devolve erro de rede imediato, sem atraso que ultrapasse o timeout. O reset do mock não apaga sessão/carrinho/tentativas; o README agora documenta um reset integral manual. Ainda faltam cenários reproduzíveis de respostas fora de ordem, permissão 403 e expiração consistente.

### P2 — Acessibilidade e ações auxiliares

Drawer de filtros e confirmação não contêm o foco completamente; erros de perfil/carteiras não são associados aos campos; o detalhe oculta informações no mobile. Botões de carrinho/favorito dos cards só interrompem propagação do clique. Newsletter anuncia sucesso local sem operação correspondente. As larguras 390/768/1440, zoom, contraste e foco precisam de uma rodada de validação abrangendo todas as telas.

## Matriz de conformidade por seção do desafio

| Seção | Estado | Evidência / pendência |
| --- | --- | --- |
| 1. Escopo | Parcial | Telas principais presentes; secundária e recuperação incompletas |
| 2. Stack | Parcial | Uso efetivo de React/TS/Router/Query/Axios/Tailwind/MSW/Socket.IO; componentes locais CVA/shadcn; auditoria Lighthouse sem resultados |
| 3. Telas e fluxos | Parcial | Catálogo, detalhe, conta e compra existem; limitações funcionais acima |
| 4. Integração e estado | Parcial | Queries, URL e favorito otimista presentes; carrinho fora de REST e isolamento/reconciliação incompletos |
| 5. Contratos REST | Parcial | Recursos de conta/NFT/cotação/pedido presentes; carrinho CRUD e paginação ausentes |
| 6. MSW | Parcial | HTTP e binding Socket.IO reais; cenários/reset/segunda fixture incompletos |
| 7. Tempo real | Parcial | Eventos/versionamento implementados; visitante/reconexão/pedido pendente falham |
| 8. UI e acessibilidade | Parcial / não certificado | Assets locais e shimmer presentes; Figma indisponível e foco/formulários pendentes |
| 9. Playwright | Não aprovado | Suite executável com falhas, fixture destrutiva, browser mobile e baselines incorretos/incompletos |
| 10. Lighthouse | Não comprovado | Script/config presentes; medições/relatórios/medianas não entregues na revisão |
| 11. Critérios eliminatórios | Risco | Fluxo de carteira secundária visual e isolamento incompleto do carrinho; não declarar aprovação |
| 12. Entrega | Parcial | Código/lockfile/assets/mocks presentes; README/ARCHITECTURE produzidos; deploy e evidências pendentes |

## Ordem recomendada para conclusão

1. Corrigir sessão/isolamento, carrinho REST, carteira secundária, validação de pedidos e reconciliação Socket.IO.
2. Corrigir a fixture, lint, Chromium mobile e testes de falhas/retomada; rodar a suite em um commit estável.
3. Comparar com Figma, revisar foco/validação/responsividade e gerar baselines completas por viewport.
4. Executar as 12 medições Lighthouse, tratar resultados e incluir HTML/JSON/medianas/ambiente.
5. Publicar o mesmo commit, validar mocks/eventos/rotas e registrar a URL pública no README.

Os documentos agora descrevem o comportamento atual e essas limitações. Documentar uma lacuna não substitui implementar o requisito.
