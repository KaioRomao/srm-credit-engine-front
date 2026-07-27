# SRM Credit Engine — Frontend

Painel do operador de mesa da gestora de FIDC multimoedas. Frontend em **Angular 22**
(standalone components, Signals, Angular Material M3) para o backend Spring Boot do
[srm-credit-engine](../srm-credit-engine).

## Como rodar

Pré-requisitos: Node 22+, backend no ar em `http://localhost:8080`
(`docker-compose up -d` na pasta do backend).

```bash
npm install
npm start        # ng serve — abre em http://localhost:4200
```

O backend não envia headers CORS, então o dev-server faz **proxy** de `/api` para
`http://localhost:8080` (ver `proxy.conf.json`). Por isso `environment.ts` usa
`apiBaseUrl: ''` em desenvolvimento; em produção (`environment.prod.ts`) a base é a URL
completa do backend.

```bash
npm test         # vitest — testes do serviço de Simulação
npm run build    # build de produção
```

## Telas

- **Simulação** (`/simulacao`) — painel do operador: formulário reativo com os campos de
  `SimulacaoPrecificacaoRQ`; a cada alteração (debounce de 400 ms) chama
  `POST /api/v1/precificacoes/simular` e mostra num card ao lado o valor líquido em
  destaque, o convertido (quando a moeda de pagamento difere da do título), deságio e
  prazo em dias. Nada é persistido.
- **Lotes** (`/lotes`) — cadastro de lote com lista dinâmica de recebíveis (`FormArray`,
  adicionar/remover linhas). O CNPJ do cedente é validado com dígito verificador no
  cliente (mesma regra do `@CNPJ` do backend) e enviado sem máscara (14 dígitos). Após o
  `201`, mostra a tabela dos itens precificados com seus `precificacaoId` e um botão
  **Liquidar** por item, que abre a tela de Liquidação já preenchida.
- **Liquidação** (`/liquidacao`) — gera o `TrackId` (UUID de idempotência) automaticamente
  no cliente e o envia no **header** da `POST /api/v1/liquidacoes`. O `202` volta com os
  campos de resultado nulos; a tela faz polling em `GET /api/v1/liquidacoes/{id}` a cada
  3 s até o status sair de `PENDENTE`/`PROCESSANDO`, com badge colorido por estado
  (`PENDENTE` âmbar, `PROCESSANDO` azul com spinner, `LIQUIDADA` verde, `FALHA` vermelho).
  A mesma tela tem o card **Consultar liquidação por ID**, que busca qualquer liquidação
  em `GET /api/v1/liquidacoes/{id}` e, se ela ainda não estiver em estado terminal,
  retoma o acompanhamento automático. Abaixo, o **Acompanhamento de liquidações** lista
  liquidações de qualquer status via `GET /api/v1/liquidacoes` (paginação e ordenação
  server-side, sort restrito à whitelist `dtCriacao`, `dtLiquidacao`, `id`, `status`,
  `trackId`, `vlLiquidado`), com filtros por ID, TrackId (UUID validado no cliente) e
  status, e botão "Ver detalhe" que carrega o item no card de resultado.
- **Câmbio** (`/cambio`) — utilitária: sincronizar cotação (data + par, parâmetros na
  query string, sem corpo) e consultar a última cotação de um par (a resposta é um número
  puro; a taxa inversa é calculada pelo backend).
- **Extrato** (`/extrato`) — `mat-table` com paginação e ordenação **server-side** (cada
  mudança de página/ordenação/filtro dispara nova chamada a
  `GET /api/v1/liquidacoes/extrato`). Filtros de período (`mat-date-range-picker`), ID do
  cedente e moeda. Só as 6 colunas da whitelist do backend são ordenáveis
  (`dtLiquidacao`, `vlLiquidado`, `vlFace`, `dtVencimento`, `cedenteNome`,
  `sgMoedaLiquidacao`) — o operador não digita campo de ordenação livre. Sem botão de
  exportar (o backend não tem exportação).

## Arquitetura

```
src/app/
  core/
    interceptors/error.interceptor.ts   # traduz o ErroRS em MatSnackBar (400 lista os
                                        # campos; 404/409/422 mostram message; 5xx tem
                                        # mensagem genérica fixa, nunca stacktrace)
    models/                             # DTOs do backend separados por domínio (cambio,
                                        # lote, precificacao, liquidacao, extrato, erro,
                                        # recebivel, comum) com barrel index.ts
    validators/cnpj.validator.ts        # dígito verificador do CNPJ no cliente
  shared/
    components/status-badge.ts          # badge reusável dos estados da liquidação
    layout/shell.*                      # toolbar fixa + sidenav com os 5 itens
  features/                             # 1 service (HTTP + signals) + 1 página por feature
    simulacao/  lotes/  liquidacao/  cambio/  extrato/
```

Sem NgRx: cada feature tem um service `providedIn: 'root'` com `HttpClient` e o estado em
**Signals**. Rotas lazy por feature (`loadComponent`). Locale `pt-BR`, valores monetários
sempre via `CurrencyPipe` com a moeda do item e numerais tabulares nas tabelas.

A fonte da verdade dos contratos é a collection do backend
(`docs/collections/SRM-Credit-Engine.postman_collection.json`, 43 requisições) — os 22
cenários negativos dela servem de roteiro de teste manual do tratamento de erros.
