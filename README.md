# SRM Credit Engine — Frontend

Painel de operações da mesa de uma gestora de FIDC multimoedas: simulação de
precificação em tempo real, intake de lotes de recebíveis, liquidação assíncrona com
acompanhamento de status e relatórios com consulta server-side.

![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Angular Material](https://img.shields.io/badge/Angular%20Material-M3-757575?logo=materialdesign&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)

---

## Visão geral

Este repositório contém a camada de apresentação do **SRM Credit Engine**. A aplicação
consome a API REST do [backend Spring Boot](https://github.com/KaioRomao/srm-credit-engine),
cujos contratos são documentados por uma collection do Postman com 50 requisições
validadas contra a aplicação real (`docs/collections/` no repositório do backend) — a
fonte da verdade de todos os payloads, formatos de campo e cenários de erro implementados
aqui.

| Módulo | Rota | Descrição |
|---|---|---|
| Simulação | `/simulacao` | Precificação em tempo real conforme o operador preenche o formulário (debounce de 400 ms), com valor líquido, conversão cambial, deságio e prazo. Operação sem efeito colateral. |
| Lotes | `/lotes` | Intake de lote com lista dinâmica de recebíveis. Operação atômica: um recebível inválido faz rollback do lote inteiro. Cada item retorna sua precificação, com atalho para liquidar. |
| Liquidação | `/liquidacao` | Solicitação idempotente (TrackId UUID gerado no cliente e enviado no header), acompanhamento por polling até estado terminal, consulta individual por ID e listagem geral com filtros. |
| Câmbio | `/cambio` | Sincronização de cotações por data e par de moedas (pré-requisito das operações cross-currency) e consulta da última cotação. |
| Extrato | `/extrato` | Relatório das liquidações efetivadas, com paginação, ordenação e filtros resolvidos no servidor. |

## Stack

| Tecnologia | Uso |
|---|---|
| Angular 22 (standalone components) | Framework base, sem NgModules, com lazy loading por feature |
| Angular Signals | Gerenciamento de estado nos services — sem biblioteca externa de state management |
| Angular Material + CDK | Componentes de UI com tema Material 3 customizado |
| Reactive Forms | Formulários com validação espelhando as regras do backend |
| RxJS | Debounce da simulação, polling da liquidação e cancelamento de requisições concorrentes |
| Vitest + TestBed | Testes unitários |

## Arquitetura

```
src/app/
├── core/
│   ├── interceptors/          # Tratamento centralizado de erros HTTP (ErroRS → MatSnackBar)
│   ├── models/                # DTOs tipados por domínio, com barrel de exportação
│   ├── validators/            # Validação de dígito verificador de CNPJ no cliente
│   └── utils/                 # Conversão de datas para o formato ISO da API
├── shared/
│   ├── components/            # Badge de status de liquidação (reutilizável)
│   └── layout/                # Shell da aplicação (toolbar + navegação lateral)
└── features/
    ├── simulacao/             # 1 service (HTTP + signals) + 1 componente de página
    ├── lotes/                 #   por feature — sem camadas intermediárias
    ├── liquidacao/
    ├── cambio/
    └── extrato/
```

Princípios adotados:

- **Estado com Signals em services `providedIn: 'root'`** — cada feature possui um único
  service responsável pelas chamadas HTTP e pelo estado reativo da tela, sem NgRx ou
  camadas adicionais.
- **Tipagem estrita** — todos os DTOs da API possuem interface TypeScript própria;
  o projeto não utiliza `any`.
- **Contratos respeitados na íntegra** — ordenações são restritas às whitelists do
  backend (campos fora da lista retornam `400`), listas de moedas e tipos de recebível
  são fechadas e não há telas para operações que a API não expõe.

## Integração com a API

- Base URL configurada por ambiente em `src/environments/`.
- Em desenvolvimento, o dev-server atua como proxy de `/api` para
  `http://localhost:8080` (`proxy.conf.json`), dispensando configuração de CORS no
  backend.
- Um `HttpInterceptorFn` único converte o contrato de erro (`ErroRS`) em notificação ao
  operador, sem tratamento repetido nos componentes:

| Status | Tratamento |
|---|---|
| `400` | Lista os campos inválidos retornados em `erros[]` |
| `404` / `409` / `422` | Exibe a mensagem de negócio retornada pela API |
| `5xx` | Mensagem genérica fixa — detalhes internos nunca são expostos |
| Falha de conexão | Orienta a verificar a disponibilidade do backend |

Validações de formulário replicam as regras do servidor no cliente (campos
obrigatórios, valores positivos, vencimento futuro, CNPJ com dígito verificador válido,
TrackId em formato UUID), fornecendo feedback imediato antes da requisição.

## Execução

Pré-requisitos: Node.js 22+ e o backend em execução em `http://localhost:8080`
(`docker-compose up -d` no repositório do backend).

```bash
npm install
npm start          # http://localhost:4200
```

| Comando | Descrição |
|---|---|
| `npm start` | Servidor de desenvolvimento com proxy para a API |
| `npm test` | Testes unitários (Vitest) |
| `npm run build` | Build de produção |

### Execução com Docker

Com o backend já em execução (`docker-compose up -d` no repositório dele):

```bash
docker-compose up -d --build   # http://localhost:4200
```

A imagem é construída em dois estágios (build Angular em Node 22 → nginx servindo os
estáticos). O nginx cumpre em produção o mesmo papel do proxy de desenvolvimento:
encaminha `/api` ao backend pela rede interna do Docker (`API_UPSTREAM`, padrão
`http://srm-app:8080`) e devolve o `index.html` para qualquer rota da SPA.

## Fluxo de contribuição

- Branch `development` para o trabalho contínuo; `main` recebe mudanças exclusivamente
  via pull request (proteção de branch ativa, sem exceções).
- Mensagens de commit seguem o padrão
  [Conventional Commits](https://www.conventionalcommits.org/pt-br/) —
  `feat(escopo):`, `fix:`, `chore:`, `docs:`.
