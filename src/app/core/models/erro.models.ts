export interface ErroCampo {
  campo: string;
  mensagem: string;
}

/** Shape único de erro do backend. `erros[]` só vem em falha de validação de campo (400). */
export interface ErroRS {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  erros: ErroCampo[] | null;
}
