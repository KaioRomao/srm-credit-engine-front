import { TipoRecebivel } from './recebivel.models';

export interface ExtratoItemRS {
  liquidacaoId: number;
  trackId: string;
  dtLiquidacao: string;
  cedenteId: number;
  cedenteNome: string;
  cedenteDocumento: string;
  nrTitulo: string;
  tipoRecebivel: TipoRecebivel;
  dtVencimento: string;
  vlFace: number;
  sgMoedaOrigem: string;
  vlLiquido: number;
  vlSpread: number;
  vlTaxaBase: number;
  qtPrazoDia: number;
  vlLiquidado: number;
  vlCambioAplicado: number | null;
  sgMoedaLiquidacao: string;
}

// Campos aceitos no sort do extrato (whitelist do backend — qualquer outro dá 400)
export const EXTRATO_SORT_WHITELIST = [
  'dtLiquidacao',
  'vlLiquidado',
  'vlFace',
  'dtVencimento',
  'cedenteNome',
  'sgMoedaLiquidacao',
] as const;
export type ExtratoSortCampo = (typeof EXTRATO_SORT_WHITELIST)[number];
