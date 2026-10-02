# Feature Specification: Autenticação — Login e Cadastro

**Feature Branch**: `004-auth-login-register`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "Implementar login e registro conforme Figma (node-id 70381-239 e
70383-239). Cadastro, login, logout e sessão são obrigatórios, integrados à API simulada. Checkout,
perfil, carteiras, favoritos e pedidos exigem autenticação. A sessão deve ser recuperável após
refresh. Tratar expiração durante navegação e checkout, preservando contexto para retomada. Logout e
troca de usuário devem limpar dados privados em cache e subscriptions da sessão anterior. Validar
formulários de cadastro, perfil, senha e carteiras, incluindo erros da API. Alterações confirmadas
devem permanecer após refresh. Usar credenciais fictícias e não armazenar senha em claro."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar uma conta (Priority: P1)

Uma pessoa visitante preenche o formulário de cadastro (conforme o Figma) e passa a ter uma conta
autenticada, podendo prosseguir imediatamente para a área que originou o cadastro.

**Why this priority**: Sem cadastro não há novas contas; é pré-requisito de todo o resto do fluxo
autenticado.

**Independent Test**: Uma pessoa preenche dados válidos, envia o formulário, é autenticada e
redirecionada; repetindo com e-mail já usado ou dados inválidos, vê erros nos campos correspondentes.

**Acceptance Scenarios**:

1. **Given** dados válidos e únicos, **When** a pessoa envia o cadastro, **Then** a conta é criada,
   a sessão inicia e ela retorna ao contexto que originou o cadastro.
2. **Given** um e-mail já cadastrado ou dados inválidos, **When** envia o formulário, **Then** recebe
   erros associados aos campos (locais e/ou retornados pela API) sem perder o que já preencheu.

---

### User Story 2 - Entrar com uma conta existente (Priority: P1)

Uma pessoa visitante informa e-mail/senha (conforme o Figma) e autentica, retornando ao contexto que
exigiu o login.

**Why this priority**: Login é a porta de entrada recorrente para todas as áreas privadas.

**Independent Test**: Uma pessoa entra com credenciais fictícias válidas e é redirecionada; com
credenciais inválidas, vê mensagem de erro sem detalhar qual campo está incorreto.

**Acceptance Scenarios**:

1. **Given** credenciais válidas, **When** a pessoa envia o login, **Then** a sessão inicia e ela
   retorna à ação original (ex.: checkout, favoritos).
2. **Given** credenciais inválidas, **When** envia o login, **Then** recebe mensagem de erro clara e
   permanece na tela de login.

---

### User Story 3 - Manter sessão confiável durante navegação e checkout (Priority: P1)

Uma pessoa autenticada permanece conectada após recarregar a página; se a sessão expirar durante a
navegação ou durante o checkout, a aplicação pede nova autenticação sem perder o contexto (ex.: o
passo do checkout ou a página atual).

**Why this priority**: Sustenta a confiabilidade de compra e de qualquer fluxo privado contínuo.

**Independent Test**: Autenticar, recarregar e confirmar que a sessão persiste; simular expiração em
navegação comum e durante checkout e confirmar retomada no mesmo ponto após novo login.

**Acceptance Scenarios**:

1. **Given** uma sessão válida, **When** a página é recarregada, **Then** a pessoa continua
   autenticada sem novo login.
2. **Given** uma sessão expirada durante navegação comum, **When** a expiração é detectada, **Then** a
   pessoa é levada ao login e retorna à tela anterior após autenticar novamente.
3. **Given** uma sessão expirada durante o checkout, **When** a expiração é detectada, **Then** o
   progresso do checkout (carrinho/etapa) é preservado e retomado após novo login.

---

### User Story 4 - Encerrar sessão e trocar de usuário com segurança (Priority: P2)

Uma pessoa autenticada sai da conta ou entra com outra conta, e nenhum dado privado da sessão anterior
permanece visível ou é atualizado por eventos em tempo real remanescentes.

**Why this priority**: Evita vazamento de dados entre contas em uso compartilhado do navegador.

**Independent Test**: Autenticar como usuário A, abrir dados privados, sair, autenticar como usuário B
e confirmar ausência de qualquer dado/cache/evento do usuário A.

**Acceptance Scenarios**:

1. **Given** uma sessão ativa, **When** a pessoa faz logout, **Then** dados privados em cache e
   subscriptions em tempo real da sessão são encerrados e a navegação para áreas privadas exige novo
   login.
2. **Given** uma troca de usuário na mesma aba, **When** o novo login é concluído, **Then** nenhum
   dado em cache do usuário anterior aparece para o novo usuário.

---

### User Story 5 - Proteger áreas que exigem autenticação (Priority: P2)

Um visitante tenta acessar checkout, perfil, carteiras, favoritos ou pedidos sem estar autenticado e é
direcionado ao login, retornando à ação original após autenticar.

**Why this priority**: Garante que dados e operações sensíveis nunca fiquem acessíveis sem sessão.

**Independent Test**: Acessar diretamente uma rota protegida sem sessão e confirmar redirecionamento
ao login com retomada da rota original após autenticação.

**Acceptance Scenarios**:

1. **Given** nenhuma sessão ativa, **When** a pessoa acessa uma rota protegida, **Then** é levada ao
   login e, após autenticar, retorna exatamente à rota solicitada.

### Edge Cases

- Reenvio do formulário de cadastro/login enquanto uma submissão já está em andamento.
- Erros retornados pela API (ex.: e-mail duplicado, credenciais inválidas, servidor indisponível)
  devem aparecer de forma compreensível e associada ao campo ou ao formulário, conforme o caso.
- Sessão expira enquanto uma requisição privada já estava em voo (ex.: salvar perfil) — a operação não
  deve aparentar sucesso.
- Múltiplas abas: logout em uma aba não deve deixar outra aba operar como se ainda autenticada ao
  tentar uma ação privada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O produto MUST apresentar as telas de Login e Cadastro com a composição, assets e
  tipografia dos nós Figma informados (login: 70381-239; cadastro: 70383-239), incluindo adaptação a
  390, 768 e 1440 pixels.
- **FR-002**: O cadastro MUST validar os campos obrigatórios e formatos esperados antes do envio e
  MUST exibir erros retornados pela API (ex.: e-mail já cadastrado) associados ao campo ou ao
  formulário.
- **FR-003**: O login MUST validar formato de e-mail e senha antes do envio e MUST exibir mensagem de
  erro genérica para credenciais inválidas, sem indicar qual campo especificamente está incorreto.
- **FR-004**: Um cadastro ou login bem-sucedido MUST iniciar uma sessão e MUST retornar a pessoa ao
  contexto (rota/ação) que originou o fluxo de autenticação, quando houver um.
- **FR-005**: A sessão MUST ser recuperável após um refresh da página, sem exigir novo login enquanto
  válida.
- **FR-006**: A aplicação MUST detectar expiração de sessão tanto durante navegação comum quanto
  durante o checkout e MUST preservar o contexto (rota, etapa do checkout, carrinho) para retomada
  após nova autenticação.
- **FR-007**: Logout MUST encerrar a sessão, MUST limpar dados privados em cache (perfil, favoritos,
  pedidos, carteiras) e MUST encerrar subscriptions em tempo real associadas à sessão anterior.
- **FR-008**: Trocar de usuário (logout seguido de novo login) MUST garantir que nenhum dado em cache
  ou subscription do usuário anterior permaneça acessível ao novo usuário.
- **FR-009**: Checkout, perfil, carteiras, favoritos e pedidos MUST exigir autenticação; acesso sem
  sessão MUST redirecionar ao login e retomar a rota original após autenticar.
- **FR-010**: O produto MUST usar apenas credenciais fictícias simuladas pela API MSW e MUST NOT
  armazenar ou exibir senha em claro em nenhum momento (campo, log ou armazenamento local).
- **FR-011**: Os formulários de cadastro, perfil, senha e carteiras MUST validar entradas localmente e
  MUST refletir erros estruturados retornados pela API simulada.
- **FR-012**: Alterações confirmadas de cadastro, login (sessão) e dados dependentes de autenticação
  MUST permanecer consistentes após um refresh da página.

### Key Entities *(include if feature involves data)*

- **Conta**: Credenciais fictícias de uma pessoa (e-mail, senha com hashing/mascaramento) e dados de
  perfil associados.
- **Sessão**: Contexto de autenticação ativo, recuperável após refresh, com validade/expiração e ponto
  de retomada (rota ou etapa de checkout) quando interrompida.
- **Credenciais**: Par e-mail/senha usado para autenticar; nunca persistido ou logado em claro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma pessoa cria uma conta e está autenticada em uma única submissão bem-sucedida do
  formulário de cadastro.
- **SC-002**: Uma pessoa com credenciais fictícias válidas entra na conta em uma única submissão do
  formulário de login.
- **SC-003**: 100% das sessões ativas sobrevivem a um refresh da página sem exigir novo login.
- **SC-004**: Em 100% dos casos de expiração simulada durante checkout, a pessoa retoma a mesma etapa
  após autenticar novamente.
- **SC-005**: Após logout ou troca de usuário, nenhum dado privado do usuário anterior é exibido na
  interface do novo contexto.

## Assumptions

- Os campos exatos de cada formulário (ex.: nome, e-mail, senha, confirmação de senha) seguirão os
  nós Figma indicados; a composição visual exata será conferida/exportada na fase de implementação,
  pois o acesso automatizado ao Figma não retornou o conteúdo do design nesta sessão.
- "Troca de usuário" significa logout seguido de novo login na mesma aba/sessão de navegador; múltiplas
  abas simultâneas com usuários diferentes estão fora do escopo desta feature.
- A API simulada (MSW) fornecerá os endpoints de cadastro, login, logout e validação de sessão; não há
  integração com provedor de identidade real.
- Reaproveitamos as definições já existentes em `specs/001-nft-marketplace` (FR-018 a FR-023) como
  pano de fundo; esta feature detalha e implementa especificamente Login, Cadastro e o
  comportamento de sessão que os sustenta.
