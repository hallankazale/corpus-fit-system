# Prompt-base — Master 2x2

Crie uma folha de referência de exercício em grade 2x2, fundo branco, quatro quadros iguais, sem números, sem textos, sem logos e sem marca d'água. Use ilustração fitness anatômica realista: corpo em escala de cinza, musculatura-alvo destacada em vermelho, aparência profissional e consistente.

O MESMO personagem deve aparecer nos quatro quadros com rosto, cabelo, roupa, anatomia, proporções e iluminação idênticos. A câmera, zoom, perspectiva e enquadramento devem ficar completamente fixos.

O equipamento do exercício deve permanecer EXATAMENTE na mesma posição, tamanho, perspectiva e orientação nos quatro quadros. Banco, máquina, rack, polia, solo e apoios são âncoras visuais e não podem se mover. Partes do corpo que não participam do movimento também devem permanecer o mais fixas possível.

Apenas as articulações necessárias ao exercício devem mudar. Mostrar progressão suave: quadro 1 posição inicial, quadro 2 primeiro terço, quadro 3 segundo terço, quadro 4 posição final. Os quatro quadros devem parecer frames retirados de uma única filmagem com câmera travada.

O corpo inteiro e todo equipamento relevante precisam caber em cada célula. Evitar deformações, mudança de escala, troca de personagem, tremor de equipamento, mudança de piso e alteração de perspectiva.

## Campos a completar por exercício

- Exercício: `<NOME>`
- ID: `<EXERCISE_ID>`
- Categoria: `<CATEGORY>`
- Ângulo fixo: `<CAMERA>`
- Equipamento fixo: `<EQUIPMENT>`
- Músculo-alvo em vermelho: `<TARGET_MUSCLE>`
- Elementos corporais que devem ficar ancorados: `<ANCHORS>`
- Progressão das quatro poses: `<POSES>`

## Nome do arquivo

Ao salvar/exportar a imagem gerada, usar `<exercise-id>-2x2.png`. O APK usa esse nome para detectar automaticamente exercício, categoria, slug e nome final do GIF.
