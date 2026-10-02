# Feature Specification: Detalhes do NFT

**Feature Branch**: `005-nft-detail-page`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "Implementar a tela de Detalhes do NFT conforme o Figma (node-id
10-244 desktop, 15-5536 mobile): galeria com miniaturas e imagem principal com zoom, nome, preço em
ETH, avaliação por estrelas, descrição, seleção de edição, seletor de quantidade, ações Comprar e
Favoritar, metadados (ID do token, coleção, atributos), compartilhamento social, abas de Detalhes do
NFT e Avaliações de colecionadores, informações de rede/contrato/direitos autorais, carrossel 'Mais
desta coleção' e navegação a partir do catálogo. Header e footer devem fazer parte de um layout
global compartilhado por todas as telas, não apenas da Home."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar os detalhes de um NFT (Priority: P1)

Uma pessoa visitante clica em um card do catálogo (Início) e chega à tela de detalhes do NFT
selecionado, vendo a galeria de imagens, nome, preço, avaliação, descrição, edição, metadados e as
abas de detalhes/avaliações, fielmente ao Figma, em desktop e mobile.

**Why this priority**: Sem a tela de detalhes carregando os dados corretos do NFT escolhido, nenhuma
outra interação desta feature (favoritar, ajustar quantidade, comprar, avaliar) tem onde acontecer;
é o pré-requisito de toda a entrega.

**Independent Test**: A partir do catálogo, selecionar qualquer NFT e confirmar que a URL muda para a
rota de detalhe daquele NFT, que os dados exibidos (nome, preço, imagens, descrição, metadados)
correspondem ao item selecionado, e que acessar essa URL diretamente (ou recarregar a página) produz
o mesmo resultado.

**Acceptance Scenarios**:

1. **Given** o catálogo exibindo NFTs, **When** a pessoa seleciona um card, **Then** ela é levada à
   tela de detalhes daquele NFT específico, com header e footer globais presentes.
2. **Given** a URL de um NFT existente, **When** a pessoa acessa essa URL diretamente ou recarrega a
   página, **Then** os mesmos detalhes são exibidos sem exigir navegação prévia pelo catálogo.
3. **Given** a tela de detalhes aberta em um viewport mobile (390px), **When** a pessoa visualiza a
   tela, **Then** o layout segue o frame mobile do Figma (hero com imagem, cartão de detalhes e barra
   de compra fixa), preservando a mesma informação do desktop.
4. **Given** um identificador de NFT que não existe no catálogo, **When** a pessoa acessa a URL
   correspondente, **Then** ela vê um estado claro de "NFT não encontrado" com um caminho de volta ao
   catálogo, em vez de uma tela quebrada ou vazia.

---

### User Story 2 - Ajustar quantidade e comprar um NFT (Priority: P1)

Uma pessoa visitante ou autenticada ajusta a quantidade desejada (respeitando a disponibilidade da
edição) e aciona a compra, sendo conduzida ao fluxo de checkout já existente no produto.

**Why this priority**: Compra é a ação principal da tela — o motivo de negócio para a página existir
— e depende diretamente da visualização correta do NFT (US1).

**Independent Test**: Na tela de detalhes, aumentar/diminuir a quantidade e confirmar que o controle
respeita limites (mínimo 1, máximo igual à disponibilidade da edição); acionar "Comprar" e confirmar
que a pessoa é conduzida ao fluxo de checkout com a quantidade e o NFT corretos, autenticando-se antes
se necessário.

**Acceptance Scenarios**:

1. **Given** uma edição com disponibilidade maior que 1, **When** a pessoa incrementa a quantidade,
   **Then** o valor exibido aumenta até o limite de disponibilidade, sem ultrapassá-lo.
2. **Given** a quantidade no valor mínimo (1), **When** a pessoa tenta decrementar, **Then** o
   controle de decremento fica desabilitado ou a quantidade permanece em 1.
3. **Given** uma pessoa não autenticada, **When** ela aciona "Comprar", **Then** é direcionada para o
   fluxo de autenticação preservando a intenção de compra (NFT e quantidade), retornando ao checkout
   após autenticar.
4. **Given** uma pessoa autenticada, **When** ela aciona "Comprar", **Then** é direcionada ao fluxo de
   checkout já existente, com o NFT e a quantidade selecionados preservados.
5. **Given** uma edição esgotada (disponibilidade zero), **When** a pessoa visualiza a tela, **Then**
   os controles de quantidade e o botão "Comprar" são desabilitados, com indicação textual de edição
   indisponível.

---

### User Story 3 - Favoritar um NFT (Priority: P2)

Uma pessoa autenticada marca ou desmarca um NFT como favorito a partir da tela de detalhes, e esse
estado persiste entre sessões e recarregamentos.

**Why this priority**: Favoritar enriquece a experiência e é mencionado no brief do projeto, mas não
bloqueia a descoberta nem a compra — por isso vem depois de US1/US2.

**Independent Test**: Autenticada, a pessoa favorita um NFT na tela de detalhes, recarrega a página e
confirma que o estado de favorito permanece; desfavorita e confirma a reversão.

**Acceptance Scenarios**:

1. **Given** uma pessoa autenticada vendo um NFT não favoritado, **When** aciona "Favoritar", **Then**
   o botão reflete o novo estado (favoritado) imediatamente e após recarregar a página.
2. **Given** um NFT já favoritado, **When** a pessoa aciona o botão novamente, **Then** o NFT é
   removido dos favoritos e o botão volta ao estado não favoritado.
3. **Given** uma pessoa não autenticada, **When** ela aciona "Favoritar", **Then** é direcionada ao
   fluxo de autenticação preservando a intenção, retornando à tela de detalhes com o NFT já favoritado
   após autenticar.

---

### User Story 4 - Avaliar e consultar avaliações de colecionadores (Priority: P3)

Uma pessoa alterna entre as abas "Detalhes do NFT" e "Avaliações de colecionadores" para ler a
descrição completa, informações de rede/contrato/direitos autorais, ou ver a nota média e o total de
avaliações existentes.

**Why this priority**: Enriquece a confiança na compra, mas a tela já entrega valor completo (ver,
comprar, favoritar) sem essa navegação secundária.

**Independent Test**: Alternar entre as duas abas e confirmar que cada uma mostra o conteúdo correto
(descrição/rede/contrato/direitos autorais na primeira; nota média e lista/contador de avaliações na
segunda) sem recarregar a página.

**Acceptance Scenarios**:

1. **Given** a tela de detalhes carregada, **When** a pessoa seleciona a aba "Avaliações de
   colecionadores (N)", **Then** o conteúdo da aba muda para mostrar a nota média e as avaliações,
   mantendo o restante da tela (galeria, compra) inalterado.
2. **Given** a aba "Avaliações" selecionada, **When** a pessoa volta para "Detalhes do NFT", **Then**
   a descrição completa, rede, contrato e direitos autorais voltam a ser exibidos.

---

### User Story 5 - Descobrir NFTs relacionados (Priority: P3)

Uma pessoa navega pelo carrossel "Mais desta coleção" ao final da tela de detalhes e seleciona outro
NFT, sendo levada à tela de detalhes desse novo item.

**Why this priority**: Incentiva descoberta adicional e reaproveita o card do catálogo, mas é uma
melhoria de navegação, não uma necessidade central da tela.

**Independent Test**: Na tela de detalhes, usar os controles/pontos do carrossel para navegar os
itens relacionados e selecionar um deles, confirmando a navegação para a tela de detalhes desse item.

**Acceptance Scenarios**:

1. **Given** o carrossel "Mais desta coleção" visível, **When** a pessoa seleciona um dos indicadores
   (dots) ou navega pelos itens, **Then** o conjunto de NFTs exibidos muda de acordo.
2. **Given** um NFT relacionado exibido no carrossel, **When** a pessoa o seleciona, **Then** é
   levada à tela de detalhes desse NFT, repetindo o comportamento da US1.

---

### Edge Cases

- O que acontece quando o identificador de NFT na URL não corresponde a nenhum item existente?
  (Ver US1, cenário 4 — estado "não encontrado" com caminho de volta ao catálogo.)
- Como o sistema trata uma edição sem disponibilidade (esgotada)? (Ver US2, cenário 5 — compra e
  quantidade desabilitadas, com indicação textual.)
- O que acontece se a pessoa tentar favoritar ou comprar sem estar autenticada? (Ver US2 cenário 3 e
  US3 cenário 3 — fluxo de autenticação preserva a intenção original.)
- Como a tela se comporta enquanto os dados do NFT ainda estão carregando (primeira visita, conexão
  lenta)? Deve exibir um estado de carregamento que preserve a estrutura do layout, sem conteúdo
  final incorreto ou "piscar" de dados vazios.
- Como a tela se comporta se a consulta dos dados do NFT falhar (erro de rede/servidor)? Deve exibir
  uma mensagem de erro com possibilidade de tentar novamente, sem quebrar o layout ou o header/footer
  globais.
- O que acontece quando a pessoa navega do catálogo para um NFT, usa "Voltar" do navegador e depois
  avança novamente? O estado da tela de detalhes (aba selecionada, imagem da galeria em destaque,
  quantidade) pode reiniciar aos valores padrão ao reentrar pela navegação do histórico.
- Como o carrossel "Mais desta coleção" se comporta quando a coleção tem poucos itens relacionados
  (menos que o número de posições do carrossel)? Deve exibir somente os itens disponíveis, sem
  posições vazias ou indicadores quebrados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir uma tela de detalhes dedicada para cada NFT, acessível por uma
  URL própria que identifica o NFT selecionado, navegável a partir de qualquer card do catálogo.
- **FR-002**: A tela de detalhes MUST exibir, fielmente ao Figma (desktop node `10:244` e mobile node
  `15:5536`): galeria de imagens com miniaturas e imagem principal, nome do NFT, preço em ETH,
  avaliação por estrelas com contagem de avaliações, descrição ("Sobre este NFT"), seleção de edição
  (ex.: 1/1, 1/10, 1/50, status aberta/fechada), seletor de quantidade, ações "Comprar" e "Favoritar",
  metadados (ID do token, coleção, atributos) e compartilhamento social.
- **FR-003**: A tela de detalhes MUST exibir uma seção com abas "Detalhes do NFT" (descrição completa,
  rede, contrato, direitos autorais) e "Avaliações de colecionadores (N)" (nota média e avaliações),
  alternáveis sem recarregar a página.
- **FR-004**: A tela de detalhes MUST exibir um carrossel "Mais desta coleção" com NFTs relacionados,
  navegável por indicadores (dots), permitindo acessar a tela de detalhes de qualquer item relacionado.
- **FR-005**: Header e footer MUST fazer parte de um layout global, compartilhado por todas as rotas
  da aplicação (incluindo a tela de detalhes do NFT), em vez de serem renderizados individualmente por
  cada tela.
- **FR-006**: O seletor de quantidade MUST respeitar o limite mínimo de 1 e o limite máximo igual à
  disponibilidade da edição selecionada, desabilitando os controles nos limites correspondentes.
- **FR-007**: Quando a disponibilidade da edição for zero, o sistema MUST desabilitar o seletor de
  quantidade e a ação "Comprar", indicando textualmente que a edição está indisponível.
- **FR-008**: A ação "Comprar" MUST conduzir a pessoa ao fluxo de checkout existente, preservando o
  NFT e a quantidade selecionados.
- **FR-009**: A ação "Favoritar" MUST alternar o estado de favorito do NFT e persistir essa alteração
  para a pessoa autenticada entre sessões e recarregamentos.
- **FR-010**: Quando uma pessoa não autenticada acionar "Comprar" ou "Favoritar", o sistema MUST
  direcioná-la ao fluxo de autenticação existente, preservando a intenção original e retomando-a após
  a autenticação ser concluída.
- **FR-011**: Quando o identificador de NFT na URL não corresponder a nenhum item existente, o sistema
  MUST exibir um estado "NFT não encontrado" com um caminho claro de retorno ao catálogo, em vez de
  uma tela vazia ou quebrada.
- **FR-012**: Enquanto os dados do NFT estiverem sendo carregados, o sistema MUST exibir um estado de
  carregamento que preserve a estrutura visual da tela (sem conteúdo final incorreto).
- **FR-013**: Caso a consulta dos dados do NFT falhe, o sistema MUST exibir uma mensagem de erro com
  opção de tentar novamente, mantendo o header e o footer globais visíveis.
- **FR-014**: A tela de detalhes MUST ser acessível diretamente por URL e sobreviver a um
  recarregamento de página, exibindo o mesmo NFT sem exigir nova navegação pelo catálogo.
- **FR-015**: O layout da tela de detalhes MUST se adaptar fielmente aos frames desktop e mobile do
  Figma, mantendo a mesma informação disponível em ambos os tamanhos de tela.
- **FR-016**: Valores em ETH exibidos na tela de detalhes MUST manter precisão decimal consistente com
  o restante do produto (sem erros de arredondamento de ponto flutuante).

### Key Entities

- **NFT Detail**: Representa um NFT individual com seus dados completos para a tela de detalhes —
  identificador, nome, imagens da galeria, preço em ETH, descrição curta e completa, edição e status
  de disponibilidade, atributos, coleção, rede, informações de contrato e direitos autorais, nota
  média e contagem de avaliações. Estende os dados já usados pelo card do catálogo.
- **Collector Review**: Representa uma avaliação de um colecionador associada a um NFT — nota e
  eventual comentário — usada para compor a nota média e a listagem da aba "Avaliações".
- **Favorite**: Representa a relação entre uma pessoa autenticada e um NFT marcado como favorito,
  persistida por usuário.
- **Related NFT**: Representa um NFT da mesma coleção exibido no carrossel "Mais desta coleção",
  reaproveitando os dados básicos já usados no card do catálogo (nome, imagem, preço).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A partir do catálogo, uma pessoa consegue abrir a tela de detalhes de qualquer NFT em
  até 2 cliques (selecionar o card e, se preciso, confirmar a seleção).
- **SC-002**: 100% dos NFTs existentes no catálogo possuem uma tela de detalhes correspondente
  acessível e correta, sem exceções ou NFTs "quebrados".
- **SC-003**: Acessar diretamente a URL de um NFT existente ou recarregar a página de detalhes produz
  o mesmo conteúdo em 100% das tentativas, sem exigir navegação prévia pelo catálogo.
- **SC-004**: Uma pessoa consegue ajustar a quantidade desejada e iniciar o fluxo de compra em menos
  de 10 segundos a partir da chegada na tela de detalhes.
- **SC-005**: Tentar comprar ou favoritar além do limite de disponibilidade da edição é impossível em
  100% das tentativas (os controles bloqueiam a ação antes de qualquer envio).
- **SC-006**: O estado de favorito de um NFT permanece correto após recarregar a página em 100% dos
  casos para pessoas autenticadas.
- **SC-007**: Header e footer aparecem de forma idêntica em todas as telas da aplicação (incluindo a
  nova tela de detalhes), sem duplicação ou ausência em nenhuma rota.
- **SC-008**: A tela de detalhes mantém a mesma informação essencial (nome, preço, descrição,
  metadados, ações) tanto em viewports desktop (1440px) quanto mobile (390px).

## Assumptions

- O catálogo existente (`src/features/catalog`) já fornece os NFTs base (nome, imagem, preço,
  categoria, rede, disponibilidade); a tela de detalhes estende esses dados com campos adicionais
  (descrição completa, atributos, coleção, contrato, direitos autorais, avaliações), simulados via
  MSW, sem exigir uma nova fonte de dados externa.
- Avaliações de colecionadores são dados simulados (mock) somente leitura nesta entrega; a
  possibilidade de uma pessoa criar sua própria avaliação fica fora do escopo desta feature.
- O fluxo de compra em si (checkout completo, pagamento, confirmação de pedido) já está coberto por
  outra feature do produto; esta tela apenas inicia esse fluxo com o NFT e a quantidade corretos.
- Compartilhamento social (LinkedIn, mensagem, Twitter/X) abre o compartilhamento padrão do
  navegador/rede social com a URL da tela de detalhes; não há rastreamento ou integração customizada
  de analytics para esta ação nesta entrega.
- O refactor de header/footer para um layout global é parte desta entrega por ser pré-requisito
  direto para a tela de detalhes ter header/footer consistentes com o restante do produto.
- "Edição" (ex.: 1/1, 1/10, 1/50, aberta) refere-se ao tipo de edição/impressão do NFT dentro da
  coleção, conforme rotulado no Figma, e corresponde à disponibilidade (quantidade restante) exibida
  no card de badges.
