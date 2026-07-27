import { TipoRecebivel } from './recebivel.models';

export interface RecebivelRQ {
  nrTitulo: string;
  vlFace: number;
  dtVencimento: string;
  tipoRecebivel: TipoRecebivel;
  sgMoeda: string;
  sgMoedaPagamento: string;
}

export interface LoteRQ {
  dsReferencia: string;
  cedenteDocumento: string;
  cedenteNome: string;
  vlTaxaBase: number;
  recebiveis: RecebivelRQ[];
}

export interface LoteItemRS {
  precificacaoId: number;
  recebivelId: number;
  nrTitulo: string;
  vlFace: number;
  vlLiquido: number;
  vlConvertido: number | null;
  qtPrazoDia: number;
  sgMoeda: string;
  sgMoedaPagamento: string;
}

export interface LoteRS {
  id: number;
  dsReferencia: string;
  cedenteNome: string;
  cedenteDocumento: string;
  dtCriacao: string;
  itens: LoteItemRS[];
}
