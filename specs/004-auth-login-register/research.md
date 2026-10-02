# Research: Autenticação

## Decision: Persistência mínima de sessão no navegador

Usar `localStorage` somente para token fictício, identidade pública mínima e contexto de retorno.
Senha nunca entra em storage, logs ou estado global persistido. Na inicialização, a aplicação valida
o token via `GET /api/auth/session` antes de liberar rotas privadas.

**Rationale**: reproduz refresh e retomada com a API MSW sem introduzir backend real.

## Decision: Zustand para sessão e TanStack Query para dados remotos

Zustand concentra `status`, usuário e `returnTo`; TanStack Query mantém requisições e permite cancelar
e invalidar dados privados no logout.

**Alternatives considered**: somente Context ou somente React Query. Context não oferece política de
cache suficiente; React Query sozinho não é adequado para o estado síncrono de redirecionamento.

## Decision: Socket.IO compartilhado com limpeza explícita

O cliente realtime recebe `auth:session-start` e `auth:session-end`; logout remove listeners privados,
desconecta e reconecta somente após nova sessão.

## Decision: MSW como fonte dos cenários de API

Handlers cobrem cadastro, login, sessão, logout e expiração determinística. O frontend acessa tudo por
Axios e nunca chama uma função mock diretamente.

## Decision: Layout responsivo baseado no sistema visual local

Aplicar tokens e assets existentes para os breakpoints de 390, 768 e 1440px. O conteúdo dos nós Figma
não pôde ser extraído nesta sessão; essa limitação é explícita e não altera o contrato funcional.
