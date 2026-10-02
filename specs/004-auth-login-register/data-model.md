# Data Model: Autenticação

## Conta

- `id`: identificador fictício estável.
- `name`: obrigatório, entre 2 e 80 caracteres.
- `email`: obrigatório, formato de e-mail, normalizado em minúsculas.
- `passwordHash`: representação simulada no handler; nunca enviada ao cliente.

## Sessão

- `token`: token fictício opaco, armazenável sem senha.
- `user`: conta pública autenticada.
- `expiresAt`: instante ISO de expiração.
- `returnTo`: rota/ação original, opcional e validada como caminho local.

## Transições

`anonymous -> authenticating -> authenticated` após login/cadastro; `authenticated -> expired` em
resposta 401 ou sessão inválida; `authenticated/expired -> anonymous` após logout/limpeza.

## Isolamento

Dados privados usam chave/query key com `user.id`. Logout cancela queries privadas, remove cache e
encerra subscription antes de estabelecer outra sessão.
