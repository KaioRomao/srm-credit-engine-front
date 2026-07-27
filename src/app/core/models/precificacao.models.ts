import { TipoRecebivel } from './recebivel.models';

export interface SimulacaoPrecificacaoRQ {
  vlFace: number;
  dtVencimento: string;
  tipoRecebivel: TipoRecebivel;
  sgMoeda: string;
  sgMoedaPagamento: string;
  vlTaxaBase: number;
}

export interface PrecificacaoRS {
  vlFace: number;
  vlLiquido: number;
  vlConvertido: number | null;
  qtPrazoDia: number;
  tipoRecebivel: TipoRecebivel;
  sgMoeda: string;
  sgMoedaPagamento: string;
}
