# Contrato HTTP de Autenticação (MSW)

Base URL: `/api`

| Método | Endpoint | Entrada | Sucesso | Erros |
|---|---|---|---|---|
| POST | `/auth/register` | `{name,email,password}` | `201 {session}` | `400 {fieldErrors}`, `409 {fieldErrors.email}` |
| POST | `/auth/login` | `{email,password}` | `200 {session}` | `401 {message}` |
| GET | `/auth/session` | `Authorization: Bearer token` | `200 {session}` | `401 {message}` |
| POST | `/auth/logout` | `Authorization` | `204` | `401` |

Senhas são aceitas apenas no corpo transitório da requisição, comparadas no handler e descartadas;
nenhuma resposta contém senha ou hash.
