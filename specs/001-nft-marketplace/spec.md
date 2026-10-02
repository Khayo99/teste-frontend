# Feature Specification: NFT Marketplace

**Feature Branch**: `001-nft-marketplace`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "Construir o marketplace de NFTs exatamente conforme o Figma fornecido
e os requisitos do desafio, utilizando o fluxo Spec Kit e sem adicionar comportamentos fora do escopo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descobrir e avaliar NFTs (Priority: P1)

Um visitante explora a página inicial, encontra NFTs por busca, categoria, rede, faixa de preço e
ordenação, percorre os resultados paginados e abre uma obra para avaliar suas imagens, edição, preço
e disponibilidade. A composição visual segue o Figma em desktop e mobile.

**Why this priority**: Descoberta e detalhe são a entrada do fluxo de compra e demonstram a maior
parte do catálogo e da identidade visual do produto.

**Independent Test**: Um visitante busca um termo, combina filtros, altera a ordenação, avança uma
página, recarrega, retorna pelo histórico e abre um NFT diretamente pelo seu endereço.

**Acceptance Scenarios**:

1. **Given** um catálogo com obras em categorias, redes, preços e disponibilidades diferentes,
   **When** o visitante combina busca, filtros e ordenação, **Then** somente resultados compatíveis
   são exibidos e a paginação recomeça na primeira página.
2. **Given** uma busca ou filtro aplicado, **When** o visitante recarrega a página ou usa voltar e
   avançar, **Then** o mesmo estado do catálogo é restaurado.
3. **Given** um identificador de NFT válido ou inexistente, **When** o visitante abre o endereço
   direto, **Then** vê os detalhes da obra ou uma mensagem clara de recurso não encontrado.
4. **Given** carregamento lento, resultado vazio ou falha temporária, **When** o visitante acessa o
   catálogo ou detalhe, **Then** vê feedback com dimensões estáveis, estado vazio ou recuperação
   acionável sem dados enganadores.

---

### User Story 2 - Montar um carrinho confiável (Priority: P1)

Um visitante adiciona edições disponíveis ao carrinho, ajusta quantidades, remove itens e aplica ou
remove um cupom, vendo sempre subtotal, desconto, taxa de rede e total coerentes. O carrinho
sobrevive ao refresh e acompanha mudanças relevantes de preço ou disponibilidade.

**Why this priority**: O carrinho conecta descoberta à compra e exige integridade de preço e estoque.

**Independent Test**: Um visitante adiciona uma edição, altera sua quantidade dentro do limite,
aplica um cupom válido, recarrega a página e remove o item; em cada passo o resumo é conferido.

**Acceptance Scenarios**:

1. **Given** uma edição disponível, **When** o visitante a adiciona ou altera sua quantidade,
   **Then** o carrinho respeita o limite da edição e atualiza o resumo de valores.
2. **Given** um cupom válido, inválido ou expirado, **When** o visitante tenta aplicá-lo,
   **Then** o desconto é refletido somente quando aplicável e a mensagem explica qualquer recusa.
3. **Given** itens no carrinho de um visitante, **When** ele recarrega ou se autentica, **Then** os
   itens continuam presentes e são preservados junto aos itens existentes da conta.
4. **Given** preço ou disponibilidade alterados durante a navegação, **When** a alteração chega,
   **Then** o carrinho informa a mudança e impede uma compra baseada em valores desatualizados.

---

### User Story 3 - Finalizar e recuperar uma compra (Priority: P1)

Um colecionador autenticado revisa seus dados, escolhe carteira e rede simuladas, confirma a cotação
e envia uma única tentativa de compra. Ele acompanha um pedido pendente e vê recibo completo apenas
quando a compra é confirmada; recusas preservam seus itens e permitem recuperação.

**Why this priority**: Compra confirmada e recibo são o resultado de negócio principal do marketplace.

**Independent Test**: Um usuário autenticado inicia com item válido no carrinho, conclui pagamento
confirmado e abre o recibo após atualizar a página; depois repete com recusa e confirma que o item
permanece no carrinho.

**Acceptance Scenarios**:

1. **Given** um carrinho válido e uma carteira selecionada, **When** o colecionador revisa e confirma
   a compra, **Then** é criada uma única tentativa e o pedido mostra seu estado atual.
2. **Given** uma alteração na cotação, estoque, cupom ou taxa antes da confirmação, **When** o
   colecionador tenta finalizar, **Then** ele é avisado e precisa revisar e confirmar os novos valores.
3. **Given** uma tentativa que aparenta expirar após ter sido recebida, **When** o colecionador
   recupera o fluxo ou atualiza a página, **Then** reencontra o mesmo pedido sem uma compra duplicada.
4. **Given** um pedido confirmado, recusado ou pendente, **When** seu estado muda ou a conexão retorna,
   **Then** o colecionador vê o resultado correspondente; somente a confirmação exibe o recibo e
   remove as quantidades efetivamente compradas.

---

### User Story 4 - Criar e manter uma sessão de colecionador (Priority: P2)

Uma pessoa cria conta, entra, sai e troca de usuário com validações e mensagens corretas. Fluxos
privados exigem sessão, retornam ao contexto original após autenticação e recuperam a sessão ao
recarregar, sem expor favoritos, pedidos ou dados de outro colecionador.

**Why this priority**: Sessão é obrigatória para compra e para todas as áreas privadas.

**Independent Test**: Uma pessoa se cadastra, entra a partir de uma ação privada, é devolvida ao
contexto de origem, recarrega, sai e entra como outro usuário sem receber informações da conta anterior.

**Acceptance Scenarios**:

1. **Given** dados de cadastro ou login inválidos ou em conflito, **When** a pessoa envia o formulário,
   **Then** recebe erros associados aos campos e não é autenticada.
2. **Given** uma ação que exige autenticação, **When** um visitante a inicia, **Then** é direcionado ao
   login e retorna ao fluxo original após entrar com sucesso.
3. **Given** uma sessão expirada no uso normal ou durante checkout, **When** a aplicação a detecta,
   **Then** protege os dados privados, pede nova autenticação e preserva o contexto recuperável.

---

### User Story 5 - Gerenciar coleção e identidade (Priority: P2)

Um colecionador autenticado marca favoritos, atualiza perfil e avatar, altera a senha e administra uma
carteira principal e secundária. Mudanças confirmadas persistem após recarregar e erros de validação
são compreensíveis.

**Why this priority**: Esses fluxos completam as telas de conta solicitadas e sustentam o checkout.

**Independent Test**: Um colecionador alterna um favorito, altera dados de perfil, cadastra ou edita
uma carteira e recarrega cada tela para confirmar persistência e isolamento da conta.

**Acceptance Scenarios**:

1. **Given** um NFT e um usuário autenticado, **When** ele adiciona ou remove o favorito,
   **Then** a interface responde imediatamente e restaura o estado anterior caso a operação falhe.
2. **Given** valores inválidos para perfil, senha ou carteira, **When** o colecionador salva,
   **Then** vê os erros retornados sem perder os dados que inseriu.
3. **Given** alterações confirmadas, **When** o colecionador recarrega ou volta à tela,
   **Then** vê seus dados, avatar e carteiras atualizados.

---

### User Story 6 - Usar em qualquer tela prevista (Priority: P2)

Um visitante ou colecionador usa todas as telas previstas com teclado, em desktop, tablet e celular,
sem perda de conteúdo. A interface preserva a composição, os assets e a hierarquia da referência
visual, inclusive em estados que não possuem frame desenhado.

**Why this priority**: A avaliação exige fidelidade visual, responsividade e acessibilidade em toda a
entrega, não apenas nos fluxos principais.

**Independent Test**: Nas larguras de 390, 768 e 1440 pixels, uma pessoa percorre início, detalhe,
carrinho e pagamento somente por teclado e verifica foco, diálogos, erros e ausência de rolagem
horizontal indevida.

**Acceptance Scenarios**:

1. **Given** qualquer tela prevista, **When** ela é aberta nas três larguras de referência,
   **Then** conteúdos, controles e informações permanecem visíveis, operáveis e sem overflow horizontal.
2. **Given** um formulário, diálogo, drawer ou atualização dinâmica, **When** a pessoa navega por
   teclado ou leitor de tela, **Then** foco, rótulos, mensagens e anúncios fornecem contexto suficiente.

### Edge Cases

- Uma resposta de busca mais antiga chega depois de uma busca nova; somente o resultado mais recente
  pode permanecer visível.
- A edição está indisponível, o NFT não existe ou a quantidade solicitada excede a disponibilidade.
- Uma alteração de preço ou estoque chega repetida ou com versão mais antiga; o estado atual não regride.
- A conexão cai durante pedido pendente e retorna após o pedido atingir estado terminal.
- Um usuário sai ou troca de conta enquanto há dados privados ou atualizações pendentes em tela.
- A carteira simulada é recusada, desconectada ou incompatível com a rede selecionada.
- O zoom do navegador, preferência de movimento reduzido e imagens indisponíveis não podem ocultar
  conteúdo, quebrar interação ou criar indicação falsa de sucesso.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O produto MUST apresentar as telas de início, detalhe, carrinho, pagamento, confirmação,
  login, cadastro, perfil e carteiras previstas no brief, com composição e assets da referência Figma.
- **FR-002**: O produto MUST adaptar todas as telas a desktop, tablet e celular, incluindo as telas
  sem frame mobile específico. A adaptação MUST seguir os frames responsivos do Figma sem alterações
  criativas e MUST preservar composição, ordem, proporções, espaçamentos, tipografia, cores, assets e
  hierarquia visual. Diferenças visuais nas larguras de 390, 768 e 1440 pixels MUST ser tratadas como
  defeitos de implementação.
- **FR-003**: O catálogo MUST permitir busca, filtros combináveis, ordenação e paginação; seu estado
  MUST poder ser restaurado por endereço, refresh e histórico.
- **FR-004**: O catálogo MUST tratar carregamento, vazio, falha, atualização em segundo plano e
  respostas fora de ordem sem apresentar dados obsoletos.
- **FR-005**: O detalhe MUST suportar acesso direto, galeria, edição, disponibilidade, seleção de
  quantidade, favoritar e adição ao carrinho, incluindo NFT inexistente ou edição indisponível.
- **FR-006**: O carrinho MUST permitir inclusão, edição de quantidade e remoção respeitando a
  disponibilidade por NFT e edição.
- **FR-007**: O carrinho MUST sobreviver ao refresh e MUST preservar e combinar itens de visitante
  ao autenticar, sem misturar dados de usuários distintos.
- **FR-008**: O carrinho MUST permitir aplicar e remover cupom e informar código inválido ou expirado.
- **FR-009**: O resumo MUST mostrar subtotal, desconto, taxa de rede e total consistentes; valores em
  ETH MUST conservar precisão decimal e quantidades MUST ser inteiras.
- **FR-010**: O produto MUST informar alterações de preço ou disponibilidade de itens ativos e MUST
  exigir nova confirmação quando uma cotação deixa de ser válida.
- **FR-011**: Pagamento MUST validar dados do colecionador, carteira e rede antes de permitir revisão.
- **FR-012**: A simulação de carteira MUST permitir conexão, recusa e desconexão e MUST usar as
  carteiras cadastradas pelo colecionador.
- **FR-013**: A confirmação de compra MUST revalidar preço, disponibilidade, cupom e taxas e MUST
  bloquear pedidos duplicados por cliques repetidos ou reenvio após espera.
- **FR-014**: Cada tentativa de pedido MUST ter identidade única; recuperar uma tentativa ambígua MUST
  retornar o mesmo pedido, e reutilizar sua identidade com conteúdo distinto MUST ser recusado.
- **FR-015**: O pedido MUST suportar os estados pendente, confirmado e recusado, com recuperação após
  refresh ou retorno de conexão.
- **FR-016**: A confirmação MUST aparecer somente para pedido confirmado e MUST mostrar transação,
  itens, taxas e total exatamente como eram na compra.
- **FR-017**: Uma confirmação MUST remover do carrinho apenas as quantidades compradas; falhas e recusas
  MUST preservar os itens.
- **FR-018**: Cadastro, login, logout, recuperação de sessão e expiração MUST funcionar com validação,
  retorno ao fluxo original e isolamento dos dados privados.
- **FR-019**: Checkout, favoritos, perfil, carteiras e pedidos MUST exigir autenticação.
- **FR-020**: Logout e troca de usuário MUST limpar visualmente dados privados e impedir atualizações
  destinadas à sessão anterior.
- **FR-021**: O colecionador MUST poder consultar, adicionar e remover favoritos; uma falha MUST
  restaurar o estado anterior e explicar a recuperação.
- **FR-022**: O colecionador MUST poder editar perfil, avatar e senha, recebendo erros de validação sem
  armazenamento ou exibição de senha em claro.
- **FR-023**: O colecionador MUST poder cadastrar e editar carteira principal e secundária, com
  validações e persistência após refresh.
- **FR-024**: Alterações de NFTs e pedidos MUST atualizar telas afetadas em tempo real, tolerando
  eventos duplicados, antigos, desconectados ou de outro usuário.
- **FR-025**: Após reconexão, recursos ativos MUST ser reconciliados antes que alterações recebidas
  possam gerar regressão de estado.
- **FR-026**: Estados dependentes de dados MUST usar placeholders de carregamento com dimensões
  preservadas e animação que respeite preferência por movimento reduzido.
- **FR-027**: Todo fluxo MUST oferecer operação por teclado, foco visível, semântica, rótulos, mensagens
  de erro associadas, alternativas textuais e feedback que não dependa somente de cor.
- **FR-028**: Ações auxiliares e links fora do escopo MUST ter comportamento coerente e MUST NOT
  aparentar sucesso funcional inexistente.
- **FR-029**: O produto MUST fornecer cenários reproduzíveis de sucesso, vazio, lentidão, falhas,
  sessão inválida, conflito, cupom inválido, mudança de preço ou estoque, timeout, pagamento aprovado
  e pagamento recusado.
- **FR-030**: O produto MUST permanecer navegável por endereço direto e refresh na versão publicada.

### Key Entities

- **NFT**: Obra colecionável identificada de forma estável, com imagens, criador, categoria, rede,
  preço, edição, disponibilidade e versão de atualização.
- **Edição**: Variação limitada de um NFT, com quantidade disponível e regras de aquisição.
- **Colecionador**: Conta autenticada com dados de perfil, avatar, favoritos, carteiras e pedidos.
- **Sessão**: Contexto de autenticação recuperável que define quais dados privados podem ser vistos e
  quais atualizações são válidas.
- **Carrinho**: Conjunto persistente de linhas por NFT e edição, com quantidade e cotação atual.
- **Cotação**: Snapshot de subtotal, desconto, taxa, total, cupom e validade usado para autorizar uma
  compra.
- **Carteira**: Identidade simulada do colecionador, principal ou secundária, vinculada a redes aceitas.
- **Pedido**: Tentativa única de compra, com estado, referência de transação simulada e recibo imutável.
- **Evento de atualização**: Mudança versionada de NFT ou pedido que identifica o recurso e a sessão
  aplicável.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma pessoa consegue encontrar uma obra por busca e filtros, abrir seu detalhe e adicionar
  uma quantidade disponível ao carrinho em até 2 minutos, nas larguras de 390, 768 e 1440 pixels.
- **SC-002**: Um colecionador autenticado conclui uma compra simulada confirmada, do catálogo ao recibo,
  em até 3 minutos sem criar pedido duplicado.
- **SC-003**: Todos os 12 fluxos de aceitação definidos no brief passam em desktop e mobile, incluindo
  falhas, retomadas, eventos repetidos e navegação por teclado.
- **SC-004**: Nas quatro telas prioritárias — início, detalhe, carrinho e pagamento — a comparação
  visual contra referências estáveis não apresenta regressões aprovadas como significativas.
- **SC-005**: Nas auditorias de início e detalhe, as medianas de três medições atendem pelo menos 90 em
  desempenho e SEO, e 95 em acessibilidade e boas práticas, em perfis desktop e mobile.
- **SC-006**: Em testes de fluxo, 100% dos valores exibidos no recibo de um pedido confirmado permanecem
  iguais após alterações posteriores no catálogo.

## Assumptions

- O arquivo Figma fornecido é a referência visual vigente; cada frame e asset será inspecionado antes
  de sua implementação, e não haverá substituição visual sem registro.
- As duas contas fictícias e todos os cenários de dados serão definidos em documentação de execução;
  nenhuma integração financeira ou blockchain real será usada.
- Dados locais podem sustentar refresh desde que o reset restaure integralmente um cenário determinístico.
- Páginas editoriais, suporte, atividade, ofertas e downloads permanecem fora do escopo.
- O produto é avaliado em navegadores Chromium nas três larguras indicadas e em ambiente publicado com
  acesso direto às rotas.
