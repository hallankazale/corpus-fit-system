# Corpus Fit System

Primeira implementação do aplicativo mobile da academia, baseada nos mockups 9:16 definidos no projeto.

## Análise técnica

Esta fase implementa o **app do aluno** como SPA/PWA com React + TypeScript. A lógica de dados foi separada da UI através de `types`, `mocks`, `state` e `services`, permitindo substituir os mocks por Supabase/API sem reescrever as telas.

O backend financeiro, autenticação real, LGPD/auditoria e integração de catraca **não devem ser simulados como produção**. Esses módulos entram na próxima fase com banco, autenticação, webhooks idempotentes e gateway local da catraca.

## Arquitetura

```text
src/
├── components/       # Shell, navegação, cards e componentes reutilizáveis
├── screens/          # Telas/rotas do app
├── state/            # Estado local da demo
├── types/            # Contratos de domínio
├── mocks/            # Dados demonstrativos
├── services/         # Camada pronta para trocar mock por API/Supabase
├── utils/            # Formatação e utilidades
└── test/             # Vitest + Testing Library
```

## Telas implementadas

- Login e cadastro
- Dashboard
- Menu lateral
- Treinos e treino em andamento
- Evolução/avaliações
- Aulas/reservas
- Pagamentos + modal PIX mock
- Notificações
- Perfil e perfil público
- Comunidade/alunos
- Configurações
- Sobre

## Rodar no Linux

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite. No computador, a interface fica centralizada com largura de smartphone. No celular, ocupa a tela toda.

## Build

```bash
npm run build
npm run preview
```

## Testes

```bash
npm test
```

Testes iniciais cobrem login, navegação, reserva de aula e abertura do modal PIX.

## Segurança - próxima fase

1. Supabase Auth com e-mail/CPF e recuperação de senha.
2. PostgreSQL com `gym_id` e RLS por academia/usuário.
3. Webhooks de pagamento validados e idempotentes.
4. Nenhuma chave secreta no frontend.
5. Gateway de catraca local com cache offline e sincronização.
6. Perfis públicos e contato opt-in, com trilha de consentimento LGPD.
7. Logs de auditoria para ações financeiras e administrativas.

## Próxima etapa recomendada

Conectar Supabase e implementar primeiro o fluxo crítico:

`pagamento confirmado -> matrícula regularizada -> política de acesso -> catraca liberada`.

Depois separar o painel administrativo em uma aplicação web própria, reaproveitando os mesmos contratos de domínio.
