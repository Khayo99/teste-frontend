# Documentação do projeto

Este diretório reúne a documentação técnica e de produto do Jungle NFT Marketplace.

## Entrega e arquitetura

- [README da solução](../README.md): instalação, credenciais, comandos, cenários e publicação.
- [Arquitetura atual](../ARCHITECTURE.md): referência consolidada de contratos, sessão, carrinho, cache, eventos e limitações.
- [Validação de entrega](./delivery-audit.md): verificações executadas, pendências e matriz de conformidade.

- [Visão geral da arquitetura](./architecture/overview.md): uso da stack, cache, sincronização, autenticação e pagamento.

## Design

- [Design System Kurio](./design/system.md): tokens, princípios de fidelidade visual e regras de responsividade.

## Integrações

- [Contratos REST](./integrations/api-contracts.md): recursos HTTP, formatos de resposta e eventos.
- [Cenários de mock e tempo real](./integrations/mock-scenarios.md): cenários MSW e limites do transporte Socket.IO.

Os artefatos de especificação e planejamento de funcionalidades permanecem em [`../specs/`](../specs/) por compatibilidade com o fluxo SpecKit.
