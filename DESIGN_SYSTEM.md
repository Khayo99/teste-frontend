# Design System Kurio

Fonte de verdade: frame `Desktop / Início`, node `2:2`, do arquivo Figma do desafio.

## Princípios de uso

- Componentes usam somente tokens semânticos expostos em `src/styles/design-system.css`.
- Valores de cor não são declarados diretamente em componentes.
- Cores, tipografia, dimensões, espaçamentos, posicionamentos, escalas e medidas específicas do Figma devem existir como tokens nomeados no tema Tailwind antes de serem utilizados.
- Classes arbitrárias como `bg-[#241612]`, `text-[#f5f1eb]`, `text-[15px]`, `w-[258px]` ou equivalentes não são permitidas.
- A família tipográfica é Roboto Mono, carregada localmente nos pesos 400, 500 e 700.
- As classes tipográficas `text-*` semânticas representam os estilos locais encontrados no Figma.
- O frame desktop usa conteúdo de 1200 px, margens laterais de 120 px e ritmo vertical principal de 96 px.
- O Figma é a única fonte de verdade visual. Não são permitidas alterações criativas, simplificações ou decisões estéticas que não estejam presentes no layout.

## Fidelidade visual e responsividade

- A implementação deve ser 100% fiel ao Figma em todas as larguras disponibilizadas no arquivo.
- Cada breakpoint deve seguir o frame correspondente do Figma, preservando composição, ordem dos elementos, alinhamentos, proporções, dimensões, espaçamentos, tipografia, cores, bordas, raios, sombras, ícones e assets.
- A responsividade não pode apenas reduzir o layout desktop. Elementos devem reorganizar, ocultar, expandir ou alterar sua direção exatamente como definido nos frames responsivos.
- Quando existir frame específico para desktop, tablet ou mobile, suas medidas e comportamento têm precedência sobre qualquer convenção genérica de breakpoint.
- Entre as larguras documentadas, a adaptação deve ser fluida e não pode introduzir quebra visual, sobreposição, corte de conteúdo, rolagem horizontal indevida ou alteração da hierarquia.
- Quando não existir frame para uma largura intermediária, a adaptação deve preservar a intenção visual do frame mais próximo, sem criar componentes, conteúdo ou padrões visuais novos.
- Textos, imagens e componentes não podem ser substituídos, reposicionados ou redimensionados arbitrariamente para facilitar a implementação.
- Toda tela deve ser validada por comparação visual nas larguras de 390, 768 e 1440 px, além das dimensões específicas encontradas no Figma.
- Diferenças visuais identificadas na comparação devem ser tratadas como defeitos de implementação.
- Acessibilidade e responsividade devem ser implementadas sem descaracterizar o layout original.

## Cores

| Token | Valor | Uso |
| --- | --- | --- |
| `primary` | `#D28A4C` | Ações primárias e destaque |
| `primary-light` | `#DD9A5F` | Estado de interação claro |
| `primary-dark` | `#C47B3E` | Estado de interação escuro |
| `amber` | `#E3A44E` | Destaques âmbar |
| `text-coral` | `#F0805F` | Texto coral |
| `foreground` | `#F5F1EB` | Conteúdo claro |
| `background-elevated` | `#FBFBFB` | Superfície clara elevada |
| `white` | `#FFFFFF` | Branco absoluto |
| `black` | `#000000` | Preto absoluto |
| `secondary` | `#B39463` | Acento secundário |
| `text-muted` | `#B0916A` | Texto atenuado |
| `surface-card` | `#241612` | Cards e filtros |
| `surface-raised` | `#2F1D15` | Superfície elevada escura |
| `ink` | `#140D0A` | Fundo principal |
| `ink-deep` | `#0E0907` | Fundo profundo |
| `ink-soft` | `#1C110C` | Fundo suave |
| `surface-dark` | `#38220F` | Superfície escura |
| `border` | `#3F2319` | Divisores e bordas |
| `border-soft` | `#55321F` | Bordas de maior contraste |
| `gray-light` | `#EDEDED` | Cinza claro |
| `success` | `#00A66C` | Sucesso |
| `error` | `#ED1B2E` | Erro |
| `text-primary` | `#F7F3EC` | Texto principal |
| `text-secondary` | `#CFB28C` | Texto secundário |
| `text-accent` | `#E89B55` | Texto ativo e preços |

## Cores de marca

| Token | Valor |
| --- | --- |
| `logo-orange` | `#FF641A` |
| `logo-facebook` | `#3B5999` |
| `logo-google-blue` | `#4086F4` |
| `logo-google-green` | `#59C36A` |
| `logo-google-yellow` | `#FFDA2D` |
| `logo-blue` | `#4175DF` |
| `logo-light-blue` | `#03A9F4` |
| `logo-indigo` | `#283593` |

## Tipografia

| Classe | Peso | Tamanho | Altura de linha | Tracking |
| --- | ---: | ---: | ---: | ---: |
| `text-display` | 700 | 43 px | 70 px | 0 |
| `text-heading` | 700 | 24 px | 32 px | 0 |
| `text-body-18-bold-compact` | 700 | 18 px | 16 px | 0 |
| `text-body-18-bold` | 700 | 18 px | 24 px | 0 |
| `text-body-18` | 400 | 18 px | 16 px | 0 |
| `text-body-17-bold` | 700 | 17 px | 16 px | 0 |
| `text-body-16-bold` | 700 | 16 px | automática | 0 |
| `text-body-16-bold-compact` | 700 | 16 px | 20 px | 0 |
| `text-body-16-medium` | 500 | 16 px | automática | 0 |
| `text-body-16` | 400 | 16 px | automática | 0 |
| `text-body-16-compact` | 400 | 16 px | 16 px | 0 |
| `text-body-15-bold-list` | 700 | 15 px | 40 px | 0 |
| `text-body-15-medium` | 500 | 15 px | 16 px | 0 |
| `text-body-15` | 400 | 15 px | automática | 0 |
| `text-body-15-compact` | 400 | 15 px | 16 px | 0 |
| `text-body-15-list` | 400 | 15 px | 40 px | 0 |
| `text-body-14-brand` | 700 | 14 px | automática | 10% |
| `text-body-14-label` | 500 | 14 px | 16 px | 10% |
| `text-body-14-medium` | 500 | 14 px | 20 px | 0 |
| `text-body-14-compact` | 400 | 14 px | 16 px | 0 |
| `text-body-14-copy` | 400 | 14 px | 22 px | 0 |
| `text-body-14-relaxed` | 400 | 14 px | 24 px | 0 |
| `text-body-14-loose` | 400 | 14 px | 30 px | 0 |
| `text-caption` | 400 | 13 px | 22 px | 0 |
| `text-caption-bold` | 700 | 12 px | 14 px | 0 |
| `text-tiny-medium` | 500 | 10 px | automática | 0 |
| `text-tiny-bold` | 700 | 9 px | automática | 0,1 px |

## Espaçamento e geometria

Escala observada no arquivo: 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 50, 72, 88, 92, 96, 110, 120, 124, 280 e 290 px.

Raios disponíveis: 2, 4, 6, 8, 13, 15, 17, 18, 22, 24, 29 e 37 px.

Espessuras de borda observadas: 0,3, 1, 1,5, 2, 3 e 4 px.

Sombra principal: `0 0 20px rgb(10 6 4 / 45%)`.

## Estrutura desktop

- Canvas: 1440 px.
- Conteúdo: 1200 px.
- Margens laterais: 120 px.
- Header: 1200 × 45 px.
- Hero: 1200 × 450 px, conteúdo textual de 600 px e imagem de 450 px.
- Catálogo: sidebar de 310 px, intervalo de 48 px e grid de 842 px.
- Grid: três colunas de 258 px, intervalo horizontal de 32 px e vertical de 72 px.
- Card: 258 × 356 px, área visual de 258 × 300 px.
