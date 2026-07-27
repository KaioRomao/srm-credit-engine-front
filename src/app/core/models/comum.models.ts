/** Moedas cadastradas no backend (tabela `moeda`) — lista fechada. */
export const MOEDAS = ['BRL', 'USD'] as const;
export type Moeda = (typeof MOEDAS)[number];

/** Página do Spring Data, shape comum a todas as listagens paginadas. */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
