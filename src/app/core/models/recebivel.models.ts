/** Tipos aceitos pelo backend — qualquer outro valor dá 422. */
export const TIPOS_RECEBIVEL = ['DUPLICATA_MERCANTIL', 'CHEQUE_PRE_DATADO'] as const;
export type TipoRecebivel = (typeof TIPOS_RECEBIVEL)[number];
