export type StatusLiquidacao = 'PENDENTE' | 'PROCESSANDO' | 'LIQUIDADA' | 'FALHA' | 'CANCELADA';

export const STATUS_TERMINAIS: StatusLiquidacao[] = ['LIQUIDADA', 'FALHA', 'CANCELADA'];

export interface LiquidacaoRQ {
  precificacaoId: number;
  sgMoedaLiquidacao: string;
}

/** No 202 os campos de resultado vêm nulos — são preenchidos pelo consumidor assíncrono. */
export interface LiquidacaoRS {
  id: number;
  trackId: string;
  status: StatusLiquidacao;
  dsObservacao: string | null;
  vlLiquidado: number | null;
  vlCambioAplicado: number | null;
  sgMoedaLiquidacao: string;
  dtLiquidacao: string | null;
}

// Campos aceitos no sort da listagem de liquidações (whitelist do backend — outro campo dá 400)
export const LIQUIDACAO_SORT_WHITELIST = [
  'dtCriacao',
  'dtLiquidacao',
  'id',
  'status',
  'trackId',
  'vlLiquidado',
] as const;
export type LiquidacaoSortCampo = (typeof LIQUIDACAO_SORT_WHITELIST)[number];
