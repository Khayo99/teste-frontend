# Kurio — NFT Marketplace

Marketplace de NFTs em React e TypeScript para o desafio frontend. A demonstração usa REST e Socket.IO simulados no navegador com MSW, sem backend privado, extensão de carteira, blockchain ou pagamento real.

- Repositório: [Khayo99/teste-frontend](https://github.com/Khayo99/teste-frontend).
- Layout: [Frontend Challenge no Figma](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1).
- Aplicação pública: [Url publica](https://teste-frontend-psi.vercel.app/).
- [Arquitetura, contratos e limitações](ARCHITECTURE.md).
- [Relatório de validação da entrega](docs/delivery-audit.md).

## Estado da entrega

O projeto está preparado para validação final, com sessão persistida, carrinho REST por visitante/usuário, merge no login, paginação de catálogo, carteiras principal/secundária, reconciliação Socket.IO e documentação Spec Kit. Ainda existem pendências de evidência de publicação/performance e alguns cenários E2E ampliados; consulte o relatório antes do deploy.

## Executar a partir de um checkout limpo

Ambiente usado na validação: Node.js `24.14.1` e npm `11.11.0`. Use Node 24 e o lockfile incluído. O navegador precisa suportar Service Worker e WebSocket. Não é necessário configurar serviços externos.

```bash
git clone https://github.com/Khayo99/teste-frontend.git
cd teste-frontend
npm ci
cp .env.example .env
npm run dev -- --host 127.0.0.1
```

Abra [http://127.0.0.1:5173](http://127.0.0.1:5173). `public/mockServiceWorker.js` já está incluído. MSW inicia antes da renderização; em caso de falha, verifique o console, a disponibilidade do worker e o contexto seguro (`localhost` ou HTTPS).

### Variáveis de ambiente

| Variável             | Valores                   | Comportamento                                                                                                        |
| -------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `VITE_ENABLE_MSW`    | `true` / `false`          | `.env.example` usa `true`. Somente `false` desativa os mocks. `true` também expõe controles de demonstração no build |
| `VITE_MOCK_SCENARIO` | tabela de cenários abaixo | Cenário inicial; padrão `success`                                                                                    |

Variáveis `VITE_*` são públicas e incorporadas no build. Mudanças exigem reiniciar o Vite ou reconstruir a aplicação. `VITE_ENABLE_MSW=false` pressupõe uma API em `/api` e Socket.IO no mesmo host; esse backend não acompanha a entrega.

## Comandos

| Finalidade                 | Comando                                                         |
| -------------------------- | --------------------------------------------------------------- |
| Desenvolvimento com mocks  | `VITE_ENABLE_MSW=true npm run dev`                              |
| Build de demonstração      | `VITE_ENABLE_MSW=true VITE_MOCK_SCENARIO=success npm run build` |
| Preview do build           | `npm run preview -- --host 127.0.0.1`                           |
| TypeScript                 | `npm run typecheck`                                             |
| ESLint                     | `npm run lint`                                                  |
| Playwright                 | `npm run test:e2e`                                              |
| Interface do Playwright    | `npm run test:e2e:ui`                                           |
| Relatório HTML             | `npm run test:e2e:report`                                       |
| Atualizar capturas visuais | `npm run test:e2e:update-snapshots`                             |
| Lighthouse completo        | `npm run lighthouse`                                            |

O preview padrão fica em [http://127.0.0.1:4173](http://127.0.0.1:4173). Exemplos de variáveis inline usam shell POSIX; no PowerShell, defina `$env:VITE_ENABLE_MSW="true"` antes do comando.

## Credenciais fictícias e navegação

| E-mail            | Senha        | Observação                |
| ----------------- | ------------ | ------------------------- |
| `demo@kurio.test` | `kurio-demo` | Única conta pré-carregada |

Para testar outra identidade, cadastre `Pessoa Dois`, `pessoa2@kurio.test`, senha fictícia `kurio-demo-2` em `/register`. Essa conta só existirá após o cadastro; uma segunda fixture pré-carregada ainda está pendente. Use apenas dados fictícios.

| Tela                | Rota                    |
| ------------------- | ----------------------- |
| Início/catálogo     | `/`                     |
| Detalhe de exemplo  | `/nft/emerald-ape-042`  |
| Detalhe inexistente | `/nft/nao-existe`       |
| Carrinho            | `/cart`                 |
| Login/cadastro      | `/login`, `/register`   |
| Perfil/carteiras    | `/profile`, `/wallets`  |
| Favoritos/pedidos   | `/favorites`, `/orders` |
| Pagamento           | `/checkout`             |

Checkout, perfil, carteiras, favoritos e pedidos exigem login. A confirmação aparece em modal quando a simulação retorna pedido confirmado. Logout fica na área do perfil. O carrinho começa com itens de demonstração; também é possível adicionar pelo detalhe. Botões de adicionar/favoritar nos cards do catálogo ainda não executam essas ações.

### Percurso de compra

1. Abra um NFT, escolha edição/quantidade e adicione pelo detalhe.
2. Abra o carrinho, ajuste itens e aplique `KURIO10` se desejar desconto de 10%.
3. Prossiga para `/checkout` e autentique-se. Revise os dados do colecionador, carteira, rede e resumo.
4. Selecione a carteira simulada e confirme. Mudanças de cotação exigem aceitar o novo total e confirmar novamente.
5. No cenário `success`, o pedido confirmado apresenta referência simulada, itens, taxa e total. Consulte `/orders` para a lista de pedidos.

Não há transferência de criptomoedas. O checkout lista somente carteiras persistidas no perfil; cadastre uma carteira principal ou secundária antes de confirmar.

## Cenários e falhas reproduzíveis

Selecione um cenário ao iniciar o processo:

```bash
VITE_ENABLE_MSW=true VITE_MOCK_SCENARIO=payment-declined npm run dev
```

| Cenário            | Efeito atual                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `success`          | Respostas normais e compra confirmada                                                                                        |
| `slow`             | 1,5 s de atraso por requisição REST                                                                                          |
| `variable-latency` | Atualmente 300 ms fixos; variação/fora de ordem ainda não implementadas                                                      |
| `offline`          | Erro de conexão MSW em REST                                                                                                  |
| `server-error`     | HTTP 503 em REST                                                                                                             |
| `payment-declined` | Pedido recusado; itens devem permanecer no carrinho                                                                          |
| `payment-pending`  | Pedido pendente; por padrão o mock confirma após cerca de 800 ms                                                             |
| `order-timeout`    | Cria pedido pendente e perde a resposta por erro de rede; recupera pela tentativa idempotente. Não é um timeout real de 10 s |

Em desenvolvimento, ou em build com `VITE_ENABLE_MSW=true`, os controles abaixo ficam no console do navegador. A configuração feita por console vale para o documento atual; não navegue com reload depois de configurá-la. Para conservar o cenário ao recarregar, use a variável de ambiente.

```js
window.__KURIO_MOCKS__.configure({ scenario: 'slow' })
window.__KURIO_MOCKS__.configure({ scenario: 'success', latencyMs: 0 })
```

### Receitas de avaliação

- **Vazio:** busque `sem-resultado-auditoria-xyz` no catálogo.
- **Validação/cadastro em conflito:** cadastre novamente `demo@kurio.test`; o mock retorna 409. Senhas divergentes e campos inválidos são validados pela UI.
- **Cupom:** `KURIO10` é válido; `KURIO2024` retorna expirado (410); `INVALIDO` retorna inválido (422).
- **Falha transitória:** após abrir o detalhe e autenticar, execute `failNext({ path: '/api/favorites/emerald-ape-042', status: 503 })` no objeto de controles e clique em favoritar. Verifique rollback e tente novamente.
- **Conexão indisponível:** configure `scenario: 'offline'` e faça uma operação de rede; restaure `success` para tentar novamente. Queries podem repetir automaticamente algumas falhas.
- **Lentidão:** inicie com `VITE_MOCK_SCENARIO=slow`; abra catálogo, detalhe e carrinho para verificar skeletons.

Alteração real de preço/estoque no mock, com publicação pelo protocolo Socket.IO:

```js
// Faça login e abra o checkout com esse NFT no carrinho antes de executar.
window.__KURIO_MOCKS__.updateNft('emerald-ape-042', { priceEth: '9.99' })
window.__KURIO_MOCKS__.updateNft('emerald-ape-042', { availability: 0 })
```

Pendência controlada, recusa e perda de resposta:

```js
// Execute no checkout antes de confirmar a compra.
window.__KURIO_MOCKS__.configure({
  scenario: 'payment-pending',
  autoConfirmPendingOrders: false
})
// Após a criação, substitua pelo ID exibido na tela.
window.__KURIO_MOCKS__.confirmOrder('ord-ID-EXIBIDO')

// Para novas tentativas, escolha um dos cenários abaixo.
window.__KURIO_MOCKS__.configure({ scenario: 'payment-declined' })
window.__KURIO_MOCKS__.configure({ scenario: 'order-timeout' })
```

Reconexão e eventos antigos:

```js
window.__KURIO_MOCKS__.disconnectRealtime()
window.__KURIO_MOCKS__.reconnectRealtime()
window.__KURIO_MOCKS__.emitNftUpdate({
  nftId: 'emerald-ape-042',
  priceEth: '1.19',
  availability: 2,
  version: 0
})
```

`emitNftUpdate` e `emitOrderUpdate` injetam eventos para verificar descarte e não alteram os registros REST. Use `updateNft` para mudança de negócio consistente. A reconexão com pedido pendente tem falha conhecida; esses controles permitem reproduzi-la, não certificam recuperação correta.

Para investigar expiração, configure `now: '2030-01-01T00:00:00Z'` após autenticar. A consulta de sessão rejeita expiração, mas os demais endpoints não a aplicam corretamente; o retorno à autenticação durante checkout ainda precisa ser implementado. Restaure `now: null` após a demonstração.

### Reset integral

`window.__KURIO_MOCKS__.reset()` reinicia somente o banco/cenário do mock. Para restaurar também sessão, carrinho, tentativas e recibos da aplicação, execute no console da origem de demonstração:

```js
window.__KURIO_MOCKS__?.reset()
for (const key of Object.keys(localStorage)) {
  if (key.startsWith('kurio.')) localStorage.removeItem(key)
}
for (const key of Object.keys(sessionStorage)) {
  if (key.startsWith('kurio.')) sessionStorage.removeItem(key)
}
location.reload()
```

Isso apaga os dados locais da demonstração e restaura o cenário inicial definido no build. O mock não compartilha dados entre dispositivos.

## Testes E2E e regressão visual

Instale os navegadores antes da primeira execução:

```bash
npx playwright install
npm run test:e2e -- --workers=2
npm run test:e2e:report
```

Playwright inicia o Vite quando necessário e usa projetos desktop/mobile. Apesar do nome `chromium-mobile`, o dispositivo iPhone 13 herda WebKit; falta configurar Chromium explicitamente para cumprir o desafio. O relatório HTML fica em `playwright-report/index.html`; falhas preservam screenshots, vídeos e `trace.zip` em `test-results/`. Abra um trace com `npx playwright show-trace caminho/trace.zip`.

Capturas de início, detalhe, carrinho e pagamento estão em `e2e/visual-regression.spec.ts`. Atualize baselines somente após revisão visual. A configuração atual compartilha o caminho de snapshot entre projetos; é necessário separar desktop/mobile e versionar o conjunto completo.

**Limitação dos testes:** a fixture atual limpa localStorage/sessionStorage em cada carregamento de página, inclusive refresh e `page.goto`. Isso invalida testes de persistência e autenticação entre navegações. O relatório da auditoria distingue falhas da suite e defeitos confirmados separadamente. Não considere os testes aprovados apenas por existirem.

## Lighthouse

É necessário Chrome/Chromium instalado. O script usa `chrome-launcher`; se necessário, configure `CHROME_PATH` com o executável. Execute sem outra auditoria ou carga pesada concorrente:

```bash
npm run lighthouse
```

A configuração em `lighthouse/config.mjs` audita `/` e `/nft/emerald-ape-042`, em mobile e desktop, três vezes cada. O script gera build, inicia preview na porta 4173, usa os presets Lighthouse e grava HTML/JSON de cada medição em `reports/lighthouse/`, além de `summary.md` com medianas, LCP, CLS, TBT e versões do ambiente. A execução completa substitui os relatórios anteriores dessa pasta.

Metas: Performance ≥90, Accessibility ≥95, Best Practices ≥95 e SEO ≥90. Resultados abaixo das metas devem ser acompanhados de causas e justificativas; o script retorna falha quando as medianas não atingem as metas. Arquivos de configuração/execução e todos os relatórios precisam integrar a entrega. Nenhuma pontuação está certificada por esta documentação.

## Publicação

O deploy obrigatório ainda precisa de URL e validação. Para publicar este projeto Vite, configure o provedor escolhido com instalação `npm ci`, build `npm run build`, saída `dist`, `VITE_ENABLE_MSW=true` e `VITE_MOCK_SCENARIO=success` no ambiente de build. Use HTTPS e fallback de SPA para rotas que não correspondam a arquivos estáticos.

Antes de enviar a URL: valide acesso direto e refresh em detalhe, login, carrinho, perfil e checkout; carregamento de `/mockServiceWorker.js`; REST e eventos simulados; fluxo de compra; e correspondência entre commit publicado e entregue. Registre a URL pública e o commit aqui após a publicação. Este documento não afirma que algum provedor já foi configurado ou que o deploy foi realizado.

## Documentação complementar

- [ARCHITECTURE.md](ARCHITECTURE.md): responsabilidades, REST/eventos, sessão, carrinho, cache, reconciliação, decisões de UX e limitações.
- [Validação de entrega](docs/delivery-audit.md): achados, evidências e requisitos pendentes.
- [Design system](docs/design/system.md): tokens, fontes e composição pretendida.
- [Especificações](specs/): histórico de planejamento; o enunciado original permanece a referência de aceitação.
