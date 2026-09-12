# Fluxo de Produção

## 1. Selecionar exercício
Escolher sempre o próximo item do `catalog/production-board.json`. Trabalhar em lotes de 3 a 5 exercícios da mesma família.

## 2. Travar identidade visual
Usar o master aprovado de `elevacao-de-pernas` como referência de corpo, fundo, iluminação, vermelho muscular e composição.

## 3. Gerar master 2x2
Gerar quatro poses progressivas respeitando o `style-guide.md`. Equipamento e câmera devem permanecer congelados.

## 4. Revisão visual
Antes de usar no APK, conferir ancoragem do equipamento, proporções, pontos de apoio, músculo-alvo e progressão de movimento. Se falhar, marcar `needs-regeneration`.

## 5. Nomear
Arquivo externo para importação: `<exercise-id>-2x2.png`. No repositório, salvar como `assets/<category>/<exercise-id>/master-2x2.png`.

## 6. Gerar derivados
O APK recorta os quatro frames, gera GIF/WebP, metadata e exporta o pacote. Padrão de loop preferido: ping-pong.

## 7. Subir ao repositório
Adicionar master, frames, GIF/WebP, thumbnail e metadata. Atualizar o production board.

## 8. Aprovar
Status recomendados:
- `planned`: ainda não começou;
- `generating`: imagem sendo produzida;
- `review`: aguardando avaliação visual;
- `needs-regeneration`: falhou em consistência;
- `approved-master`: master 2x2 aprovado;
- `gif-ready`: derivados e GIF aprovados;
- `integrated`: já usado em um app.

## Regra para não perder tempo
Nunca gerar grandes lotes antes de validar 1 ou 2 exercícios do mesmo tipo. Exercícios em máquina devem validar primeiro a máquina fixa; exercícios livres devem validar primeiro pés/mãos/pontos de apoio fixos.
