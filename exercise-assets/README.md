# Trincado Exercise Assets

Biblioteca oficial de exercícios do Projeto Trincado. O objetivo é manter um acervo próprio, consistente e reutilizável de masters 2x2, frames, GIFs, WebP e metadados para qualquer aplicativo de academia futuro.

## Estrutura

- `catalog/exercises.json`: nomes canônicos e categorias.
- `catalog/categories.json`: categorias oficiais.
- `catalog/aliases.json`: apelidos aceitos pelo detector de nomes de arquivo.
- `catalog/production-board.json`: fila e status de produção.
- `assets/<category>/<exercise-id>/`: arquivos finais de cada exercício.
- `docs/style-guide.md`: regras visuais obrigatórias.
- `docs/production-flow.md`: fluxo de produção e aprovação.
- `templates/prompt-base.md`: prompt-base para geração 2x2.

## Convenção por exercício

Exemplo: `elevacao-de-pernas`

```text
assets/core/elevacao-de-pernas/
  master-2x2.png
  frame-1.png
  frame-2.png
  frame-3.png
  frame-4.png
  elevacao-de-pernas.gif
  elevacao-de-pernas.webp
  thumbnail.png
  metadata.json
```

## Regra de nomes

O nome canônico vem de `catalog/exercises.json`. O arquivo master deve sempre ser `master-2x2.png`. Para importação no APK, também aceitamos um arquivo externo com o ID no nome, por exemplo `elevacao-de-pernas-2x2.png`. O aplicativo remove sufixos como `2x2`, `final`, `v2`, `teste` e tenta resolver o exercício pelo ID ou por `aliases.json`.

## Definição de pronto

Um exercício só é considerado final quando possui: master 2x2 aprovado, quatro frames recortados, GIF validado, metadata, nome/categoria corretos e status `gif-ready` ou `integrated` no production board.

## Princípio de produção

Gerar por lotes pequenos de 3 a 5 exercícios. Nunca pular aleatoriamente entre categorias. O master visual aprovado de `elevacao-de-pernas` é a referência inicial para corpo, iluminação, fundo, vermelho muscular e composição.
