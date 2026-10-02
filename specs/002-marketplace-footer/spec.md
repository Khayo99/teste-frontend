# Feature Specification: Marketplace Footer

**Feature Branch**: `002-marketplace-footer`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "Usando Spec Kit, implementar o footer do Figma no nó 70492:696."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar recursos e novidades (Priority: P1)

Como visitante do marketplace, quero encontrar os benefícios da plataforma e inscrever meu e-mail para receber lançamentos, para descobrir conteúdos e novidades relevantes.

**Why this priority**: O bloco inicial comunica o valor do produto e dá acesso direto à inscrição de novidades.

**Independent Test**: A página pode ser aberta no fim da rolagem e exibe três benefícios, um campo de e-mail e uma ação de envio legíveis e utilizáveis.

**Acceptance Scenarios**:

1. **Given** que a pessoa chega ao fim da página em desktop, **When** visualiza o footer, **Then** vê os três benefícios, seus ícones circulares e a área de newsletter na mesma faixa visual.
2. **Given** que uma pessoa informa um e-mail válido, **When** envia o formulário, **Then** recebe uma confirmação visível de inscrição sem sair da página.
3. **Given** que uma pessoa tenta enviar um e-mail vazio ou inválido, **When** envia o formulário, **Then** recebe uma mensagem de validação associada ao campo.

---

### User Story 2 - Navegar e entrar em contato (Priority: P2)

Como visitante, quero acessar links de perfil, ajuda, coleções, redes sociais e canais de contato, para continuar navegando ou buscar suporte.

**Why this priority**: Os links e dados de contato consolidam a navegação de saída da página e o suporte ao usuário.

**Independent Test**: Todos os grupos de links, e-mail, telefone, redes sociais e carteiras compatíveis ficam visíveis e podem receber foco pelo teclado.

**Acceptance Scenarios**:

1. **Given** que a pessoa visualiza o footer, **When** chega às colunas de navegação, **Then** encontra os grupos Meu perfil, Central de ajuda, Coleções e Redes sociais com seus itens.
2. **Given** que a pessoa navega apenas pelo teclado, **When** alcança um link ou botão do footer, **Then** o foco fica visível e o controle pode ser ativado.
3. **Given** que a pessoa seleciona o e-mail ou telefone, **When** ativa o respectivo controle, **Then** recebe o destino de contato apropriado ou o telefone copiável no contexto do navegador.

---

### User Story 3 - Usar o footer em telas menores (Priority: P3)

Como visitante em tela pequena, quero que o conteúdo do footer seja reorganizado sem cortes, para continuar lendo e usando todos os recursos.

**Why this priority**: A página deve preservar a acessibilidade e a compreensão em cada largura suportada pelo produto.

**Independent Test**: O footer pode ser verificado em 390 px, 768 px e 1440 px sem sobreposição, rolagem horizontal ou controles inacessíveis.

**Acceptance Scenarios**:

1. **Given** uma tela de 390 px, **When** o footer é exibido, **Then** benefícios, newsletter e colunas formam uma sequência vertical legível.
2. **Given** uma tela de 768 px, **When** o footer é exibido, **Then** o conteúdo ocupa a largura disponível com agrupamentos claros e sem recorte.

### Edge Cases

- Em telas estreitas, nomes extensos de carteiras e links não causam rolagem horizontal.
- O envio duplicado é evitado enquanto a confirmação está sendo apresentada.
- As redes sociais preservam nomes acessíveis mesmo quando exibidas como ícones.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST apresentar o footer como o último conteúdo da página inicial.
- **FR-002**: O sistema MUST exibir os benefícios Segurança da carteira, Criadores em destaque e Alertas de lançamentos, cada um com identificador circular, título e descrição.
- **FR-003**: O sistema MUST oferecer inscrição para lançamentos com validação de e-mail e confirmação de sucesso local.
- **FR-004**: O sistema MUST apresentar a faixa de marca com KURIO, mensagem institucional, e-mail e telefone.
- **FR-005**: O sistema MUST apresentar os grupos Meu perfil, Central de ajuda, Coleções e Redes sociais com controles navegáveis.
- **FR-006**: O sistema MUST exibir as cinco redes sociais fornecidas pelo Figma e o chip de carteiras compatíveis sem substituir seus ativos visuais.
- **FR-007**: O sistema MUST preservar os textos, cores, espaçamentos e hierarquia do desktop definidos no nó do Figma.
- **FR-008**: O sistema MUST reorganizar o conteúdo sem perda de informação em 390 px, 768 px e 1440 px.
- **FR-009**: O sistema MUST manter foco visível, rótulos acessíveis e estrutura semântica para links, formulário e navegação.

### Key Entities *(include if feature involves data)*

- **Newsletter subscription**: Interesse de uma pessoa em receber lançamentos; contém um e-mail válido e um estado de confirmação local.
- **Footer link group**: Grupo rotulado de destinos de navegação, contato ou rede social apresentado no rodapé.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 1440 px, todo o footer cabe na largura de conteúdo sem rolagem horizontal e preserva as três faixas do Figma.
- **SC-002**: Em 390 px e 768 px, 100% dos textos, links e controles do footer permanecem visíveis e utilizáveis.
- **SC-003**: 100% dos links e controles do footer podem receber foco e ser acionados pelo teclado.
- **SC-004**: Um e-mail válido gera confirmação em até uma interação; um e-mail inválido apresenta validação antes do envio.

## Assumptions

- A inscrição é uma confirmação local, pois nenhum serviço de newsletter foi incluído no escopo.
- Os links ainda sem rota de produto apontam para âncoras internas de forma segura até que as páginas correspondentes existam.
- Os cinco SVGs exportados pelo Figma são os ativos visuais oficiais das redes sociais.
- O conteúdo visual do desktop do Figma é a referência para espaçamento e tipografia; telas menores usam reflow responsivo, pois não foi fornecido um frame móvel específico.
