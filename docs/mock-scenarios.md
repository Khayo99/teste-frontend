# Cenários MSW e tempo real

O build de demonstração ativa MSW por padrão. Defina `VITE_ENABLE_MSW=false` para usar uma API externa e `VITE_MOCK_SCENARIO` antes de iniciar o Vite para escolher um cenário reproduzível:

| Valor | Efeito |
| --- | --- |
| `success` | catálogo, cotação e pagamento confirmados |
| `slow` | cada resposta REST aguarda 1,5 s |
| `variable-latency` | latência variável determinística, útil para descarte de resposta obsoleta |
| `offline` | falha de rede (`HttpResponse.error`) |
| `server-error` | resposta 503 |
| `payment-declined` | pedido recusado |
| `payment-pending` | pedido permanece pendente |
| `order-timeout` | pedido é criado, mas a resposta falha; repetir a mesma chave recupera o pedido |

Os endpoints de autenticação, cupom, perfil e carteira também incluem respectivamente 401/expiração, 410/422, 400/409 e 400. `resetMockScenario()` restaura os fixtures e remove toda persistência. Em desenvolvimento e demonstração, `window.__KURIO_MOCKS__.reset()` e `updateNft(id, update)` oferecem o mesmo controle para Playwright ou uma demonstração manual; esta superfície altera somente o banco de dados do mock, portanto REST e evento observam a mesma mudança.

## Transporte de eventos

`src/lib/realtime.ts` sempre usa `socket.io-client`, no namespace padrão, via WebSocket em `/realtime/socket.io`. MSW intercepta essa conexão e `@mswjs/socket.io-binding` decodifica o protocolo Socket.IO; os handlers em `src/mocks/handlers.ts` publicam `nft.updated` e `order.updated` com `resource id`, `userId` quando privado, e `version` monotônica. O cliente valida, ignora duplicatas/eventos antigos e revalida REST após reconectar.

O binding de mock suporta o namespace padrão e eventos de texto. Acks, anexos binários, rooms e namespaces customizados não devem ser usados no ambiente de mocks. Esses limites não alteram o cliente de produção: ele continua sendo um cliente Socket.IO convencional.
